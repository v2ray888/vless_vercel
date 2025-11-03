'use server';

import { getDb } from '@/db';
import { redemptionCodes, users, plans, orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { addMonths, addYears } from 'date-fns';
import { createSubscription } from '@/app/dashboard/subscriptions/actions';

type ActionResult = {
  success: boolean;
  message: string;
};

function getNewEndDate(planName: string): Date {
    const now = new Date();
    if (planName.includes('月')) {
        return addMonths(now, 1);
    }
    if (planName.includes('季')) {
        return addMonths(now, 3);
    }
    if (planName.includes('年')) {
        return addYears(now, 1);
    }
    // Default to 1 month if no match
    return addMonths(now, 1);
}

export async function redeemCode(
  code: string,
  userId: string
): Promise<ActionResult> {
  const db = getDb();
  if (!code || !userId) {
    return { success: false, message: '兑换码和用户ID不能为空。' };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Find the redemption code and its associated plan
      // 使用select查询而不是query
      const [codeData] = await tx.select({
        id: redemptionCodes.id,
        code: redemptionCodes.code,
        status: redemptionCodes.status,
        planId: redemptionCodes.planId
      })
      .from(redemptionCodes)
      .where(and(
        eq(redemptionCodes.code, code),
        eq(redemptionCodes.status, 'available')
      ))
      .leftJoin(plans, eq(redemptionCodes.planId, plans.id));

      if (!codeData) {
        return { success: false, message: '兑换码无效或已被使用。' };
      }

      // 获取套餐信息
      const [planData] = await tx.select().from(plans).where(eq(plans.id, codeData.planId));
      
      if (!planData) {
        return { success: false, message: '兑换码关联的套餐不存在。' };
      }

      // 2. Update the user's plan and end date
      const newEndDate = getNewEndDate(planData.name);

      await tx
        .update(users)
        .set({
          planId: codeData.planId,
          endDate: newEndDate,
          status: 'active',
        })
        .where(eq(users.id, userId));

      // 3. Mark the redemption code as used
      await tx
        .update(redemptionCodes)
        .set({
          status: 'used',
          usedById: userId,
          usedAt: new Date(),
        })
        .where(eq(redemptionCodes.id, codeData.id));
      
      // 4. Create an order record for this redemption
      const orderId = `order_${Date.now()}_${userId.substring(0, 8)}`;
      await tx.insert(orders).values({
        id: orderId,
        userId: userId,
        planId: codeData.planId,
        amount: 0, // 兑换码订单金额为0
        date: new Date(),
        status: 'completed', // 兑换码订单状态为已完成
      });
      
      // 5. Automatically create a subscription for the user
      try {
        // Calculate duration in days based on plan type
        let durationDays = 30; // Default to 30 days for monthly plan
        if (planData.name.includes('季')) {
          durationDays = 90; // 90 days for quarterly plan
        } else if (planData.name.includes('年')) {
          durationDays = 365; // 365 days for yearly plan
        }
        
        // Set traffic total based on plan (1GB for monthly, 3GB for quarterly, 12GB for yearly)
        let trafficTotal = 1000000000; // 1GB in bytes
        if (planData.name.includes('季')) {
          trafficTotal = 3000000000; // 3GB
        } else if (planData.name.includes('年')) {
          trafficTotal = 12000000000; // 12GB
        }
        
        // Create subscription
        await createSubscription(userId, codeData.planId, trafficTotal, durationDays);
        
        return { 
          success: true, 
          message: `兑换成功！您的 '${planData.name}' 已激活，并已为您创建了订阅。` 
        };
      } catch (subscriptionError) {
        console.error('Failed to create subscription after redemption:', subscriptionError);
        // Even if subscription creation fails, we still consider the redemption successful
        return { 
          success: true, 
          message: `兑换成功！您的 '${planData.name}' 已激活。但创建订阅时出现问题，请手动创建订阅以获取节点配置。` 
        };
      }
    });

    return result;

  } catch (error) {
    console.error('Redemption failed:', error);
    return { success: false, message: '服务器发生错误，请稍后再试。' };
  }
}