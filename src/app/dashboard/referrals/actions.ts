'use server';

// 移除对@/auth的导入，使用自定义认证方法
import { getDb } from '@/db';
import { affiliates, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

type ReferralData = {
  referralLink: string;
  referralCount: number;
  totalCommission: number;
  pendingCommission: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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

export async function getReferralData(): Promise<ReferralData | null> {
  const db = getDb();
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return null;
  }

  try {
    // 查询affiliate数据
    const affiliateResult = await db.select().from(affiliates).where(eq(affiliates.userId, user.id));
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