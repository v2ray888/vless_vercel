'use server';

import { getDb } from '@/db';
import { subscriptions, plans, serverGroups } from '@/db/schema';
import { 
  eq, 
  and, 
  gte, 
  lte, 
  desc,
  count,
  sum
} from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { validateV2RayUUID, addV2RayUUID } from '@/lib/v2ray-api';
import { getBaseUrl } from '@/lib/url-utils';

const generateSubscriptionUrlSchema = z.object({
  subscriptionId: z.string().min(1, '订阅ID是必填项'),
});

type ActionResult = {
  success: boolean;
  message?: string;
};

/**
 * 创建新订阅
 * @param userId 用户ID
 * @param planId 套餐ID
 * @param userUUID 用户UUID
 * @returns 创建结果
 */
export async function createSubscription(
  userId: string, 
  planId: string, 
  userUUID: string
): Promise<ActionResult> {
  const db = getDb();
  
  try {
    // 获取套餐信息
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan) {
      return { success: false, message: '套餐不存在。' };
    }
    
    // 获取服务器组信息
    const [serverGroup] = await db.select().from(serverGroups).where(eq(serverGroups.id, plan.serverGroupId)).limit(1);
    if (!serverGroup) {
      return { success: false, message: '服务器组不存在。' };
    }
    
    // 计算过期时间
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);
    
    // 生成订阅令牌
    const subscriptionToken = require('crypto').randomBytes(32).toString('hex');
    
    // 创建订阅
    await db.insert(subscriptions).values({
      userId,
      planId,
      userUUID,
      subscriptionToken,
      status: 'active',
      trafficTotal: plan.trafficLimit * 1024 * 1024 * 1024, // GB转为bytes
      trafficUsed: 0,
      createdAt: startDate,
      expiresAt: endDate,
      planName: plan.name
    });
    
    // 如果服务器组配置了API信息，则添加UUID到V2Ray面板
    if (serverGroup.apiUrl && serverGroup.apiKey) {
      try {
        await addV2RayUUID(
          {
            apiUrl: serverGroup.apiUrl,
            apiKey: serverGroup.apiKey
          },
          userUUID
        );
      } catch (error) {
        console.error('添加UUID到V2Ray面板失败:', error);
        // 不返回错误，因为订阅已经创建成功
      }
    }
    
    revalidatePath('/dashboard/subscriptions');
    return { success: true, message: '订阅创建成功。' };
  } catch (error) {
    console.error('创建订阅失败:', error);
    return { success: false, message: '创建订阅失败。' };
  }
}

/**
 * 获取用户的所有订阅
 * @param userId 用户ID
 * @returns 订阅列表
 */
export async function getUserSubscriptions(userId: string) {
  const db = getDb();
  
  const result = await db.select({
    id: subscriptions.id,
    planName: subscriptions.planName,
    status: subscriptions.status,
    createdAt: subscriptions.createdAt,
    expiresAt: subscriptions.expiresAt,
    trafficTotal: subscriptions.trafficTotal,
    trafficUsed: subscriptions.trafficUsed,
  })
  .from(subscriptions)
  .where(eq(subscriptions.userId, userId))
  .orderBy(desc(subscriptions.createdAt));
  
  return result;
}

/**
 * 获取用户的有效订阅
 * @param userId 用户ID
 * @returns 有效的订阅信息
 */
export async function getActiveSubscription(userId: string) {
  const db = getDb();
  
  const [subscription] = await db.select().from(subscriptions).where(
    and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active'),
      gte(subscriptions.expiresAt, new Date())
    )
  ).limit(1);
  
  return subscription || null;
}

/**
 * 生成订阅地址
 * @param subscriptionId 订阅ID
 * @returns 订阅地址
 */
export async function generateSubscriptionUrl(subscriptionId: string) {
  // 验证输入参数
  const validatedFields = generateSubscriptionUrlSchema.safeParse({
    subscriptionId,
  });

  if (!validatedFields.success) {
    throw new Error(
      validatedFields.error.flatten().fieldErrors.subscriptionId?.[0] ||
      '输入无效。'
    );
  }

  const db = getDb();
  
  const [subscription] = await db.select({
    subscriptionToken: subscriptions.subscriptionToken
  }).from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  
  if (!subscription) {
    throw new Error('未找到订阅信息。');
  }
  
  // 生成订阅地址
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/subscribe?token=${subscription.subscriptionToken}`;
}

/**
 * 更新已用流量
 * @param subscriptionId 订阅ID
 * @param trafficUsed 已用流量（bytes）
 */
export async function updateTrafficUsage(subscriptionId: string, trafficUsed: number) {
  const db = getDb();
  
  await db.update(subscriptions).set({
    trafficUsed
  }).where(eq(subscriptions.id, subscriptionId));
  
  revalidatePath('/dashboard/subscription');
}

/**
 * 暂停订阅
 * @param subscriptionId 订阅ID
 */
export async function suspendSubscription(subscriptionId: string) {
  const db = getDb();
  
  await db.update(subscriptions).set({
    status: 'suspended'
  }).where(eq(subscriptions.id, subscriptionId));
  
  revalidatePath('/dashboard/subscription');
}

/**
 * 恢复订阅
 * @param subscriptionId 订阅ID
 */
export async function resumeSubscription(subscriptionId: string) {
  const db = getDb();
  
  await db.update(subscriptions).set({
    status: 'active'
  }).where(eq(subscriptions.id, subscriptionId));
  
  revalidatePath('/dashboard/subscription');
}

/**
 * 取消订阅
 * @param subscriptionId 订阅ID
 */
export async function cancelSubscription(subscriptionId: string) {
  const db = getDb();
  
  await db.update(subscriptions).set({
    status: 'cancelled'
  }).where(eq(subscriptions.id, subscriptionId));
  
  revalidatePath('/dashboard/subscription');
}

/**
 * 删除订阅
 * @param subscriptionId 订阅ID
 */
export async function deleteSubscription(subscriptionId: string) {
  const db = getDb();
  
  await db.delete(subscriptions).where(eq(subscriptions.id, subscriptionId));
  
  revalidatePath('/dashboard/subscriptions');
}

/**
 * 获取订阅统计信息
 * @param userId 用户ID
 * @returns 订阅统计信息
 */
export async function getSubscriptionStats(userId: string) {
  const db = getDb();
  
  // 获取总订阅数
  const [totalResult] = await db.select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));
  
  // 获取活跃订阅数
  const [activeResult] = await db.select({ count: count() })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.expiresAt, new Date())
      )
    );
  
  // 获取总流量使用情况
  const [trafficResult] = await db.select({ 
    total: sum(subscriptions.trafficTotal),
    used: sum(subscriptions.trafficUsed)
  })
  .from(subscriptions)
  .where(eq(subscriptions.userId, userId));
  
  return {
    total: totalResult.count,
    active: activeResult.count,
    trafficTotal: parseInt(trafficResult.total as string) || 0,
    trafficUsed: parseInt(trafficResult.used as string) || 0,
  };
}