'use server';

import { getDb } from '@/db';
import { affiliates, users, settings as settingsTable } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import type { Affiliate, AffiliateStats } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getAffiliatesData(): Promise<Affiliate[]> {
  const db = getDb();
  const result = await db
    .select({
      id: affiliates.id,
      name: users.name,
      referralCount: affiliates.referralCount,
      totalCommission: affiliates.totalCommission,
    })
    .from(affiliates)
    .leftJoin(users, sql`${affiliates.userId} = ${users.id}`);

  // The result is already of a compatible type, but we ensure non-null names.
  return result.map(r => ({...r, name: r.name ?? '未知用户'}));
}

export async function getAffiliateStats(): Promise<AffiliateStats> {
  const db = getDb();
  // This can be optimized in a real application, potentially with a single query
  const totalAffiliatesResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliates);

  const commissionStatsResult = await db
    .select({
      total: sql<number>`sum(${affiliates.totalCommission})`.mapWith(Number),
      pending: sql<number>`sum(${affiliates.pendingCommission})`.mapWith(Number),
    })
    .from(affiliates);

  return {
    totalAffiliates: totalAffiliatesResult[0].count,
    totalCommission: commissionStatsResult[0].total ?? 0,
    pendingCommission: commissionStatsResult[0].pending ?? 0,
  };
}

export async function getAffiliateSettings() {
    const db = getDb();
    const result = await db.query.settings.findFirst({
        where: eq(settingsTable.key, 'affiliate_commission_rate')
    });
    if (result && result.value && typeof (result.value as any).rate === 'number') {
        return { commissionRate: (result.value as any).rate };
    }
    // Return default if not found
    return { commissionRate: 20 };
}


export async function updateAffiliateSettings(settings: {
  commissionRate: number;
}) {
  const db = getDb();
  if (settings.commissionRate < 0 || settings.commissionRate > 100) {
    throw new Error('佣金比例必须在 0 到 100 之间。');
  }

  await db.insert(settingsTable)
    .values({ key: 'affiliate_commission_rate', value: { rate: settings.commissionRate } })
    .onConflictDoUpdate({ 
        target: settingsTable.key, 
        set: { value: { rate: settings.commissionRate } } 
    });
  
  revalidatePath('/admin/affiliates');

  return { success: true };
}
