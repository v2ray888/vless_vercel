'use server';

import { getDb } from '@/db';
import { subscriptions, serverGroups, plans } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addV2RayUUID } from '@/lib/v2ray-api';

// 创建订阅的验证模式
const createSubscriptionSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空。'),
  planId: z.string().min(1, '套餐ID不能为空。'),
  trafficTotal: z.number().min(0, '总流量不能为负数。'),
  durationDays: z.number().min(1, '订阅时长必须至少为1天。'),
});

// 生成订阅地址的验证模式
const generateSubscriptionUrlSchema = z.object({
  subscriptionId: z.string().min(1, '订阅ID不能为空。'),
});

/**
 * 创建新订阅
 * @param userId 用户ID
 * @param planId 套餐ID
 * @param trafficTotal 总流量（bytes）
 * @param durationDays 订阅时长（天）
 * @returns 订阅ID
 */
export async function createSubscription(
  userId: string,
  planId: string,
  trafficTotal: number,
  durationDays: number
) {
  // 验证输入参数
  const validatedFields = createSubscriptionSchema.safeParse({
    userId,
    planId,
    trafficTotal,
    durationDays,
  });

  if (!validatedFields.success) {
    throw new Error(
      validatedFields.error.flatten().fieldErrors.userId?.[0] ||
      validatedFields.error.flatten().fieldErrors.planId?.[0] ||
      validatedFields.error.flatten().fieldErrors.trafficTotal?.[0] ||
      validatedFields.error.flatten().fieldErrors.durationDays?.[0] ||
      '输入无效。'
    );
  }

  const db = getDb();
  
  // 生成UUID和订阅令牌
  const userUUID = crypto.randomUUID();
  const subscriptionToken = crypto.randomUUID();
  
  // 计算过期时间
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);
  
  // 获取套餐信息
  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  if (!plan) {
    throw new Error('未找到指定套餐。');
  }
  
  // 获取服务器组信息
  const [serverGroup] = await db.select().from(serverGroups).where(eq(serverGroups.id, plan.serverGroupId)).limit(1);
  if (!serverGroup) {
    throw new Error('未找到关联服务器组。');
  }
  
  // 如果服务器组配置了API信息，则创建V2Ray用户
  if (serverGroup.apiUrl && serverGroup.apiKey) {
    const result = await addV2RayUUID(
      {
        apiUrl: serverGroup.apiUrl,
        apiKey: serverGroup.apiKey
      },
      userUUID
    );
    
    if (!result.success) {
      throw new Error(result.message || '添加V2Ray UUID失败。');
    }
  }
  
  // 创建订阅记录
  const result = await db.insert(subscriptions).values({
    userId,
    planId,
    userUUID,
    subscriptionToken,
    expiresAt,
    trafficTotal,
    trafficUsed: 0,
    status: 'active',
  }).returning({ id: subscriptions.id });

  revalidatePath('/dashboard/subscription');
  
  return result[0].id;
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
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
  
  // 检查订阅是否仍然有效
  const [subscription] = await db.select({
    expiresAt: subscriptions.expiresAt
  }).from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  
  if (!subscription) {
    throw new Error('未找到订阅信息。');
  }
  
  // 如果订阅已过期，则不能恢复
  if (subscription.expiresAt < new Date()) {
    throw new Error('订阅已过期，无法恢复。');
  }
  
  await db.update(subscriptions).set({
    status: 'active'
  }).where(eq(subscriptions.id, subscriptionId));
  
  revalidatePath('/dashboard/subscription');
}