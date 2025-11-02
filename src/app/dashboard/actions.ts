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

  if (!userResult || !userResult.endDate) {
    return {
      planName: userResult?.plan?.name || '无有效订阅',
      endDate: null,
      daysRemaining: null,
    };
  }
  
  const endDate = new Date(userResult.endDate);
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));

  return {
    planName: userResult.plan?.name || 'N/A',
    endDate: userResult.endDate ? new Date(userResult.endDate).toISOString().split('T')[0] : null,
    daysRemaining,
  };
}
