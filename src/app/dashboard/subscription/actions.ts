'use server';

// 移除对@/auth的导入，使用自定义认证方法
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

type ActionResult = {
  success: boolean;
  message?: string;
  url?: string | null;
  newUrl?: string | null;
};

// 改进BASE_URL的获取逻辑，支持多种环境变量和自动检测
function getBaseUrl(): string {
  // 首先检查NEXT_PUBLIC_SITE_URL环境变量
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // 检查VERCEL_URL环境变量（Vercel部署环境）
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // 检查HOST和PORT环境变量
  if (process.env.HOST && process.env.PORT) {
    return `http://${process.env.HOST}:${process.env.PORT}`;
  }
  
  // 检查NEXT_PUBLIC_PORT环境变量
  if (process.env.NEXT_PUBLIC_PORT) {
    return `http://localhost:${process.env.NEXT_PUBLIC_PORT}`;
  }
  
  // 默认值
  return 'http://localhost:3000';
}

// 修改函数签名，接收用户ID作为参数
export async function getSubscriptionInfo(userId: string): Promise<ActionResult> {
  const db = getDb();
  
  if (!userId) {
    return { success: false, message: '用户未登录。' };
  }

  try {
    // 查询用户信息
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    const currentUser = userResult[0];

    if (!currentUser) {
      return { success: false, message: '找不到用户。' };
    }

    // If user has no active plan, they don't get a subscription URL.
    if (!currentUser.planId) {
      return { success: true, url: null, message: '用户没有有效的订阅。' };
    }
    
    if (!currentUser.subscriptionUrlToken) {
      // If user has a plan but no token, create one
      const newUrlResult = await resetSubscriptionUrl(userId);
      return { success: true, url: newUrlResult.newUrl };
    }

    const baseUrl = getBaseUrl();
    return {
      success: true,
      url: `${baseUrl}/api/subscribe?token=${currentUser.subscriptionUrlToken}`,
    };
  } catch (error) {
    return { success: false, message: '获取订阅信息失败。' };
  }
}

// 修改函数签名，接收用户ID作为参数
export async function resetSubscriptionUrl(userId: string): Promise<ActionResult> {
  const db = getDb();
  
  if (!userId) {
    return { success: false, message: '用户未登录。' };
  }
  
  try {
    const newToken = randomBytes(16).toString('hex');
    await db
      .update(users)
      .set({ subscriptionUrlToken: newToken })
      .where(eq(users.id, userId));
      
    const baseUrl = getBaseUrl();
    const newUrl = `${baseUrl}/api/subscribe?token=${newToken}`;
      
    return { success: true, newUrl: newUrl };

  } catch (error) {
     return { success: false, message: '重置订阅地址失败。' };
  }
}