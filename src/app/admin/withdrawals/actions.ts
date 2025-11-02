'use server';

import { getDb } from '@/db';
import { withdrawals, affiliates, users } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import type { Withdrawal } from '@/lib/types';

export async function getWithdrawals(): Promise<Withdrawal[]> {
  const db = getDb();
  const result = await db.query.withdrawals.findMany({
    with: {
      affiliate: {
        with: {
          user: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [desc(withdrawals.date)],
  });

  return result.map((w) => ({
    id: w.id,
    userName: w.affiliate.user.name,
    amount: w.amount,
    date: new Date(w.date).toLocaleDateString(),
    status: w.status as 'pending' | 'completed' | 'rejected',
  }));
}

export async function updateWithdrawalStatus(
  id: string,
  newStatus: 'completed' | 'rejected'
) {
  const db = getDb();
  await db
    .update(withdrawals)
    .set({ status: newStatus })
    .where(eq(withdrawals.id, id));

  revalidatePath('/admin/withdrawals');
  revalidatePath('/admin/finance'); // Also revalidate finance page as it uses withdrawal data
}
