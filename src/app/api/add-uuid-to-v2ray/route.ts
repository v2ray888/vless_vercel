import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { subscriptions, serverGroups, plans, users } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { addV2RayUUID } from '@/lib/v2ray-api';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: '缺少订阅令牌' }, { status: 400 });
    }

    const db = getDb();
    
    // 通过subscriptionUrlToken查找用户
    const [user] = await db.select().from(users).where(
      eq(users.subscriptionUrlToken, token)
    ).limit(1);
    
    if (!user) {
      return NextResponse.json({ error: '无效的订阅令牌' }, { status: 404 });
    }
    
    // 查找用户的订阅
    const [subscription] = await db.select().from(subscriptions).where(
      and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.expiresAt, new Date())
      )
    ).limit(1);
    
    if (!subscription) {
      return NextResponse.json({ error: '用户没有有效的订阅或订阅已过期' }, { status: 404 });
    }
    
    // 获取订阅关联的套餐
    const [plan] = await db.select().from(plans).where(
      eq(plans.id, subscription.planId)
    ).limit(1);
    
    if (!plan) {
      return NextResponse.json({ error: '未找到关联套餐' }, { status: 404 });
    }
    
    // 获取套餐关联的服务器组
    const [serverGroup] = await db.select().from(serverGroups).where(
      eq(serverGroups.id, plan.serverGroupId)
    ).limit(1);
    
    if (!serverGroup) {
      return NextResponse.json({ error: '未找到关联服务器组' }, { status: 404 });
    }
    
    // 检查服务器组是否有API配置
    if (!serverGroup.apiUrl || !serverGroup.apiKey) {
      return NextResponse.json({ error: '服务器组未配置API信息' }, { status: 400 });
    }
    
    // 将UUID添加到V2Ray面板
    const addResult = await addV2RayUUID(
      {
        apiUrl: serverGroup.apiUrl,
        apiKey: serverGroup.apiKey
      },
      subscription.userUUID
    );
    
    if (!addResult.success) {
      return NextResponse.json({ 
        error: '添加UUID到V2Ray面板失败', 
        details: addResult.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'UUID已成功添加到V2Ray面板',
      uuid: subscription.userUUID
    });
  } catch (error: any) {
    console.error('添加UUID到V2Ray面板错误:', error);
    return NextResponse.json({ error: '服务器内部错误', details: error.message }, { status: 500 });
  }
}