'use server';

import { getDb } from '@/db';
import type { Order } from '@/lib/types';
import { desc, eq } from 'drizzle-orm';
import { orders, plans, users } from '@/db/schema';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// 自定义认证函数
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    // 验证JWT令牌
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secret);
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string | null,
      isAdmin: payload.isAdmin as boolean
    };
  } catch (error) {
    console.error('验证认证令牌时出错:', error);
    return null;
  }
}

export async function getUserOrders(): Promise<Omit<Order, 'user_name' | 'user_email'>[]> {
    const db = getDb();
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return [];
    }
    
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
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.date));

  return results.map((row) => ({
    id: row.id,
    plan_name: row.planName || 'N/A',
    amount: row.amount,
    date: new Date(row.date).toISOString().split('T')[0],
    status: row.status as 'completed' | 'pending' | 'failed',
  }));
}