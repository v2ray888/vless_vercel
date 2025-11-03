import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '2ec75766333405bcdf64c6503e6fc09b';

  try {
    const db = getDb();
    
    // 1. 查询所有匹配令牌的订阅
    const allMatchingSubscriptions = await db.select().from(subscriptions).where(
      eq(subscriptions.subscriptionToken, token)
    );
    
    let debugInfo: any = {
      token: token,
      allMatchingSubscriptions: allMatchingSubscriptions,
      validSubscriptions: []
    };
    
    if (allMatchingSubscriptions.length > 0) {
      const subscription = allMatchingSubscriptions[0];
      debugInfo.subscriptionDetails = {
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        currentTime: new Date(),
        isExpired: subscription.expiresAt < new Date(),
        isActive: subscription.status === 'active'
      };
      
      // 2. 查询有效的订阅（API中使用的查询）
      const validSubscriptions = await db.select().from(subscriptions).where(
        and(
          eq(subscriptions.subscriptionToken, token),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.expiresAt, new Date())
        )
      ).limit(1);
      
      debugInfo.validSubscriptions = validSubscriptions;
      
      if (validSubscriptions.length === 0) {
        debugInfo.validationFailureReason = [];
        if (subscription.status !== 'active') {
          debugInfo.validationFailureReason.push(`状态不是active，当前状态: ${subscription.status}`);
        }
        if (subscription.expiresAt < new Date()) {
          debugInfo.validationFailureReason.push(`订阅已过期，过期时间: ${subscription.expiresAt}`);
        }
      }
    } else {
      // 显示所有订阅记录
      const allSubscriptions = await db.select().from(subscriptions);
      debugInfo.allSubscriptions = {
        count: allSubscriptions.length,
        sample: allSubscriptions.slice(0, 5).map(sub => ({
          id: sub.id,
          token: sub.subscriptionToken,
          status: sub.status,
          expiresAt: sub.expiresAt
        }))
      };
    }
    
    return NextResponse.json(debugInfo);
  } catch (error: any) {
    console.error('Debug subscription error:', error);
    return NextResponse.json({ error: '服务器内部错误', details: error.message }, { status: 500 });
  }
}