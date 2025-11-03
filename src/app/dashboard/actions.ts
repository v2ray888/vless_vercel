'use server';

import { getDb } from '@/db';
import { users, plans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '@/lib/types';

type UserDashboardData = {
  planName: string | null;
  endDate: string | null;
  daysRemaining: number | null;
};

export async function getUserDashboardData(
  userId: string
): Promise<UserDashboardData> {
  const db = getDb();
  const userResult = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      plan: {
        columns: {
          name: true,
        },
      },
    },
  });

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
}