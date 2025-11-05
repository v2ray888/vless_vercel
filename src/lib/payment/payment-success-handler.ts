'use server';

import { getDb } from '@/db';
import { users, orders, plans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { addMonths, addYears } from 'date-fns';

/**
 * 处理支付成功后的业务逻辑
 * @param userId 用户ID
 * @param planId 套餐ID
 * @param amount 支付金额
 * @param orderId 订单ID
 * @param billingCycle 计费周期
 */
export async function processSuccessfulPayment(
  userId: string,
  planId: string,
  amount: number,
  orderId: string,
  billingCycle: string
): Promise<{ success: boolean; message: string }> {
  const db = getDb();
  
  try {
    // 1. 查询用户和套餐信息
    const userResults = await db.select().from(users).where(eq(users.id, userId));
    const planResults = await db.select().from(plans).where(eq(plans.id, planId));
    
    const user = userResults[0];
    const plan = planResults[0];
    
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    if (!plan) {
      return { success: false, message: '套餐不存在' };
    }
    
    // 2. 计算新的订阅结束日期
    const currentDate = user.endDate && new Date(user.endDate) > new Date() 
      ? new Date(user.endDate) 
      : new Date();
    
    let newEndDate: Date;
    switch (billingCycle) {
      case 'monthly':
        newEndDate = addMonths(currentDate, 1);
        break;
      case 'quarterly':
        newEndDate = addMonths(currentDate, 3);
        break;
      case 'yearly':
        newEndDate = addYears(currentDate, 1);
        break;
      default:
        newEndDate = addMonths(currentDate, 1);
    }
    
    // 3. 更新用户订阅信息
    await db.update(users).set({
      planId: planId,
      endDate: newEndDate,
      status: 'active'
    }).where(eq(users.id, userId));
    
    // 4. 创建订单记录
    await db.insert(orders).values({
      id: orderId,
      userId: userId,
      planId: planId,
      amount: amount,
      date: new Date(),
      status: 'completed'
    });
    
    console.log(`支付成功处理完成: 用户${userId}订阅了套餐${planId}，订单号${orderId}`);
    
    return { 
      success: true, 
      message: '支付成功，订阅已更新' 
    };
  } catch (error) {
    console.error('处理支付成功时出错:', error);
    return { 
      success: false, 
      message: '处理支付成功时出错: ' + (error instanceof Error ? error.message : '未知错误') 
    };
  }
}

/**
 * 通过订单号解析用户和套餐信息（用于处理支付通知）
 * @param orderId 订单号
 * @returns 用户ID和套餐ID
 */
export async function parseOrderInfo(orderId: string): Promise<{ userId: string; planId: string; billingCycle: string } | null> {
  // 对于新的简洁订单号格式，我们需要查询数据库获取订单信息
  try {
    const db = getDb();
    const orderResults = await db.select().from(orders).where(eq(orders.id, orderId));
    
    if (orderResults.length > 0) {
      const order = orderResults[0];
      return {
        userId: order.userId,
        planId: order.planId,
        billingCycle: 'monthly' // 默认值，实际应用中可能需要存储计费周期信息
      };
    }
    
    return null;
  } catch (error) {
    console.error('解析订单信息时出错:', error);
    return null;
  }
}