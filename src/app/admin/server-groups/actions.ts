'use server';

import { getDb } from '@/db';
import { serverGroups, subscriptions, plans } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import { eq, lt, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { parseNodeText } from '@/lib/node-utils';
import { removeV2RayUUID } from '@/lib/v2ray-api';

type ServerGroup = InferSelectModel<typeof serverGroups>;

const groupSchema = z.object({
  name: z.string().min(1, '组名称不能为空。'),
  api_url: z.string().min(1, 'API 地址不能为空。').url('请输入有效的 URL。'),
  api_key: z.string().min(1, 'API Key 不能为空。'),
  nodes: z.string().transform((val, ctx) => {
    try {
      // 首先尝试解析为JSON
      let parsed;
      try {
        parsed = JSON.parse(val);
      } catch (e) {
        // 如果不是有效的JSON，尝试作为文本解析
        parsed = parseNodeText(val);
      }
      
      if (!Array.isArray(parsed)) {
          throw new Error();
      }
      // Further validation of node structure can be added here if needed
      return parsed;
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '节点列表必须是有效的 JSON 数组或文本格式。',
      });
      return z.NEVER;
    }
  }),
});


export async function getServerGroups(): Promise<ServerGroup[]> {
  const db = getDb();
  const groups = await db.select().from(serverGroups);
  // Don't expose sensitive data to the client component
  return groups.map(g => ({ ...g, api_url: g.apiUrl || '', api_key: g.apiKey || '', nodes: g.nodes as any[] | undefined }));
}


export async function createServerGroup(formData: FormData) {
  const db = getDb();
  const validatedFields = groupSchema.safeParse({
    name: formData.get('name'),
    api_url: formData.get('api_url'),
    api_key: formData.get('api_key'),
    nodes: formData.get('nodes') || formData.get('nodes_text'),
  });

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.flatten().fieldErrors.name?.[0] || validatedFields.error.flatten().fieldErrors.api_url?.[0] || validatedFields.error.flatten().fieldErrors.api_key?.[0] || validatedFields.error.flatten().fieldErrors.nodes?.[0] || '输入无效。');
  }
  const { name, api_url, api_key, nodes } = validatedFields.data;

  await db.insert(serverGroups).values({
    id: `sg_${Date.now()}`,
    name,
    apiUrl: api_url,
    apiKey: api_key,
    server_count: nodes.length,
    nodes,
  });

  revalidatePath('/admin/server-groups');
}

export async function updateServerGroup(groupId: string, formData: FormData) {
    const db = getDb();
    const validatedFields = groupSchema.safeParse({
        name: formData.get('name'),
        api_url: formData.get('api_url'),
        api_key: formData.get('api_key'),
        nodes: formData.get('nodes') || formData.get('nodes_text'),
    });

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.flatten().fieldErrors.name?.[0] || validatedFields.error.flatten().fieldErrors.api_url?.[0] || validatedFields.error.flatten().fieldErrors.api_key?.[0] || validatedFields.error.flatten().fieldErrors.nodes?.[0] || '输入无效。');
    }
    const { name, api_url, api_key, nodes } = validatedFields.data;
    
    // Only update API key if a new one is provided.
    const updateData: Partial<ServerGroup> & { nodes: any, server_count: number } = {
        name,
        apiUrl: api_url,
        nodes,
        server_count: nodes.length,
    };

    if (api_key) {
        updateData.apiKey = api_key;
    }

  await db.update(serverGroups).set(updateData).where(eq(serverGroups.id, groupId));

  revalidatePath('/admin/server-groups');
  revalidatePath('/dashboard/nodes');
}

export async function deleteServerGroup(groupId: string) {
    const db = getDb();
    // Note: In a real app, you'd check if this group is used by any plans first.
    await db.delete(serverGroups).where(eq(serverGroups.id, groupId));
    revalidatePath('/admin/server-groups');
}

/**
 * 删除服务器组中过期订阅的UUID
 * @param serverGroupId 服务器组ID
 * @returns 删除结果
 */
export async function removeExpiredUUIDsFromServerGroup(serverGroupId: string) {
  const db = getDb();
  
  try {
    // 1. 获取服务器组信息
    const [serverGroup] = await db.select().from(serverGroups).where(eq(serverGroups.id, serverGroupId));
    
    if (!serverGroup) {
      throw new Error('服务器组不存在');
    }
    
    if (!serverGroup.apiUrl || !serverGroup.apiKey) {
      throw new Error('服务器组缺少API配置');
    }
    
    // 2. 获取该服务器组关联的所有过期订阅
    // 直接通过subscriptions表的serverGroupId字段查找，提高查询效率
    const expiredSubscriptions = await db.select({
      id: subscriptions.id,
      userUUID: subscriptions.userUUID,
      expiresAt: subscriptions.expiresAt
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.serverGroupId, serverGroupId),
        lt(subscriptions.expiresAt, new Date())
      )
    );
    
    if (expiredSubscriptions.length === 0) {
      return { 
        success: true, 
        message: '没有找到过期的订阅', 
        removedCount: 0 
      };
    }
    
    // 3. 从V2Ray面板删除过期的UUID
    let removedCount = 0;
    const failedRemovals: string[] = [];
    
    for (const subscription of expiredSubscriptions) {
      try {
        const result = await removeV2RayUUID(
          {
            apiUrl: serverGroup.apiUrl,
            apiKey: serverGroup.apiKey
          },
          subscription.userUUID
        );
        
        if (result.success) {
          removedCount++;
        } else {
          failedRemovals.push(subscription.userUUID);
        }
      } catch (error) {
        console.error(`删除UUID ${subscription.userUUID} 失败:`, error);
        failedRemovals.push(subscription.userUUID);
      }
    }
    
    // 4. 返回结果
    return {
      success: true,
      message: `成功删除 ${removedCount} 个过期UUID`,
      removedCount,
      failedCount: failedRemovals.length,
      failedUUIDs: failedRemovals
    };
  } catch (error) {
    console.error('删除过期UUID时出错:', error);
    throw new Error(error instanceof Error ? error.message : '删除过期UUID时发生未知错误');
  }
}