'use server';

import { getDb } from '@/db';
import { users, plans } from '@/db/schema';
import { eq } from 'drizzle-orm';

type UserDashboardData = {
  planName: string | null;
  endDate: string | null;
  daysRemaining: number | null;
};

export async function getUserDashboardData(
  userId: string
): Promise<UserDashboardData> {
  const db = getDb();
  
  try {
    const userResults = await db
      .select({
        id: users.id,
        planId: users.planId,
        endDate: users.endDate,
        plan: {
          name: plans.name,
        },
      })
      .from(users)
      .leftJoin(plans, eq(users.planId, plans.id))
      .where(eq(users.id, userId));
    
    const userResult = userResults[0];
    
    // 如果用户不存在或没有订阅计划
    if (!userResult || !userResult.plan) {
      return {
        planName: '无有效订阅',
        endDate: null,
        daysRemaining: null,
      };
    }
    
    // 如果没有结束日期，说明订阅无效
    if (!userResult.endDate) {
      return {
        planName: '无有效订阅',
        endDate: null,
        daysRemaining: null,
      };
    }
    
    const endDate = new Date(userResult.endDate);
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    return {
      planName: userResult.plan.name,
      endDate: userResult.endDate ? new Date(userResult.endDate).toISOString().split('T')[0] : null,
      daysRemaining: daysRemaining > 0 ? daysRemaining : null, // 如果已过期，返回null
    };
  } catch (error) {
    console.error('获取用户仪表板数据时出错:', error);
    return {
      planName: '无有效订阅',
      endDate: null,
      daysRemaining: null,
    };
  }
}