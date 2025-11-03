'use server';

import { getDb } from '@/db';
import type { Order } from '@/lib/types';
import { desc, eq } from 'drizzle-orm';
import { orders, plans, users } from '@/db/schema';

// 修改函数签名，接收用户ID作为参数
export async function getUserOrders(userId: string): Promise<Omit<Order, 'user_name' | 'user_email'>[]> {
    const db = getDb();
    
    if (!userId) {
      return [];
    }
    
    try {
      const results = await db
        .select({
          id: orders.id,
          planName: plans.name,
          amount: orders.amount,
          date: orders.date,
          status: orders.status,
        })
        .from(orders)
        .leftJoin(plans, eq(orders.planId, plans.id))
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.date));

      return results.map((row) => ({
        id: row.id,
        plan_name: row.planName || 'N/A',
        amount: row.amount,
        date: new Date(row.date).toISOString().split('T')[0],
        status: row.status as 'completed' | 'pending' | 'failed',
      }));
    } catch (error) {
      console.error('获取用户订单时出错:', error);
      return [];
    }
}
