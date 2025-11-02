'use server';

// 移除对@/auth的导入，使用自定义认证方法
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

type ActionResult = {
  success: boolean;
  message?: string;
  url?: string | null;
  newUrl?: string | null;
};

// This should be in a config file or environment variable
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

export async function getSubscriptionInfo(): Promise<ActionResult> {
  const db = getDb();
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return { success: false, message: '用户未登录。' };
  }

  try {
    // 查询用户信息
    const userResult = await db.select().from(users).where(eq(users.id, user.id));
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
      const newUrlResult = await resetSubscriptionUrl();
      return { success: true, url: newUrlResult.newUrl };
    }

    return {
      success: true,
      url: `${BASE_URL}/api/subscription/${currentUser.subscriptionUrlToken}`,
    };
  } catch (error) {
    return { success: false, message: '获取订阅信息失败。' };
  }
}

export async function resetSubscriptionUrl(): Promise<ActionResult> {
  const db = getDb();
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return { success: false, message: '用户未登录。' };
  }
  
  try {
    const newToken = randomBytes(16).toString('hex');
    await db
      .update(users)
      .set({ subscriptionUrlToken: newToken })
      .where(eq(users.id, user.id));
      
    const newUrl = `${BASE_URL}/api/subscription/${newToken}`;
      
    return { success: true, newUrl: newUrl };

  } catch (error) {
     return { success: false, message: '重置订阅地址失败。' };
  }
}