'use server';

// 移除对@/auth的导入，使用自定义认证方法
import { getDb } from '@/db';
import { affiliates, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

type ReferralData = {
  referralLink: string;
  referralCount: number;
  totalCommission: number;
  pendingCommission: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// 修改函数签名，接收用户ID作为参数
export async function getReferralData(userId: string): Promise<ReferralData | null> {
  const db = getDb();
  
  if (!userId) {
    return null;
  }

  try {
    // 查询affiliate数据
    const affiliateResult = await db.select().from(affiliates).where(eq(affiliates.userId, userId));
    const affiliateData = affiliateResult[0];

    if (!affiliateData) {
      // If user is not an affiliate, we can decide to either create a profile
      // or return null. For now, let's return null.
      // In a real app, you might auto-create an affiliate profile on first visit.
      return {
        referralLink: "您还不是推广员",
        referralCount: 0,
        totalCommission: 0,
        pendingCommission: 0,
      };
    }

    return {
      referralLink: `${BASE_URL}/signup?ref=${affiliateData.referralCode}`,
      referralCount: affiliateData.referralCount,
      totalCommission: affiliateData.totalCommission,
      pendingCommission: affiliateData.pendingCommission,
    };
  } catch (error) {
    console.error("Failed to get referral data:", error);
    return null;
  }
}