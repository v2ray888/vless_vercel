'use server';

// 移除对@/auth的导入，使用自定义认证方法
import { getDb } from '@/db';
import { affiliates, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getBaseUrl } from '@/lib/url-utils';

type ReferralData = {
  referralLink: string;
  referralCount: number;
  totalCommission: number;
  pendingCommission: number;
};

// 生成唯一的推荐码
function generateReferralCode(): string {
  return `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// 修改函数签名，接收用户ID作为参数
export async function getReferralData(userId: string): Promise<ReferralData | null> {
  const db = getDb();
  
  if (!userId) {
    return {
      referralLink: "无法获取用户信息",
      referralCount: 0,
      totalCommission: 0,
      pendingCommission: 0,
    };
  }

  try {
    // 查询affiliate数据
    const affiliateResult = await db.select().from(affiliates).where(eq(affiliates.userId, userId));
    let affiliateData = affiliateResult[0];

    // 如果用户还没有推广员档案，自动创建一个
    if (!affiliateData) {
      // 生成唯一的推荐码
      const referralCode = generateReferralCode();

      // 创建推广员档案
      const newAffiliate = await db.insert(affiliates).values({
        id: `affiliate_${userId}`,
        userId: userId,
        referralCode: referralCode,
        referralCount: 0,
        totalCommission: 0,
        pendingCommission: 0,
      }).returning();

      affiliateData = newAffiliate[0];
    }

    const baseUrl = getBaseUrl();
    return {
      referralLink: `${baseUrl}/auth/signup?ref=${affiliateData.referralCode}`,
      referralCount: affiliateData.referralCount,
      totalCommission: affiliateData.totalCommission,
      pendingCommission: affiliateData.pendingCommission,
    };
  } catch (error) {
    console.error("Failed to get referral data:", error);
    return {
      referralLink: "数据加载失败",
      referralCount: 0,
      totalCommission: 0,
      pendingCommission: 0,
    };
  }
}

// 添加创建推广员档案的函数（保持向后兼容）
export async function createAffiliateProfile(userId: string): Promise<{ success: boolean; message: string }> {
  const db = getDb();
  
  if (!userId) {
    return { success: false, message: '用户ID不能为空' };
  }

  try {
    // 检查用户是否已存在推广员档案
    const existingAffiliate = await db.select().from(affiliates).where(eq(affiliates.userId, userId));
    
    if (existingAffiliate.length > 0) {
      return { success: false, message: '您已经是推广员了' };
    }

    // 生成唯一的推荐码
    const referralCode = generateReferralCode();

    // 创建推广员档案
    await db.insert(affiliates).values({
      id: `affiliate_${userId}`,
      userId: userId,
      referralCode: referralCode,
      referralCount: 0,
      totalCommission: 0,
      pendingCommission: 0,
    });

    return { success: true, message: '推广员档案创建成功' };
  } catch (error) {
    console.error("Failed to create affiliate profile:", error);
    return { success: false, message: '创建推广员档案失败，请稍后再试' };
  }
}