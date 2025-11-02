'use server';

import { getDb } from '@/db';
import { serverGroups } from '@/db/schema';
import type { ServerGroup } from '@/lib/types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const groupSchema = z.object({
  name: z.string().min(1, '组名称不能为空。'),
  api_url: z.string().url('请输入有效的 URL。').or(z.literal('')),
  api_key: z.string(),
  nodes: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
          throw new Error();
      }
      // Further validation of node structure can be added here if needed
      return parsed;
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '节点列表必须是有效的 JSON 数组。',
      });
      return z.NEVER;
    }
  }),
});


export async function getServerGroups(): Promise<ServerGroup[]> {
  const db = getDb();
  const groups = await db.query.serverGroups.findMany();
  // Don't expose sensitive data to the client component
  return groups.map(g => ({ ...g, apiUrl: g.apiUrl || '', apiKey: '********', nodes: g.nodes as any[] | undefined }));
}


export async function createServerGroup(formData: FormData) {
  const db = getDb();
  const validatedFields = groupSchema.safeParse({
    name: formData.get('name'),
    api_url: formData.get('api_url'),
    api_key: formData.get('api_key'),
    nodes: formData.get('nodes'),
  });

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.flatten().fieldErrors.name?.[0] || validatedFields.error.flatten().fieldErrors.nodes?.[0] || '输入无效。');
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
        nodes: formData.get('nodes'),
    });

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.flatten().fieldErrors.name?.[0] || validatedFields.error.flatten().fieldErrors.nodes?.[0] || '输入无效。');
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
