import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { serverGroups, subscriptions, plans } from '@/db/schema';
import { eq, lt, and } from 'drizzle-orm';
import { removeV2RayUUID } from '@/lib/v2ray-api';

/**
 * 清理过期UUID的API接口
 * 供外部定时脚本调用
 */
export async function POST(request: Request) {
  try {
    console.log('清理过期UUID API被调用');
    
    const db = getDb();
    
    // 获取请求中的认证信息（如果需要的话）
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_AUTH_TOKEN;
    
    // 如果设置了认证令牌，则验证
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: '未授权的访问' },
        { status: 401 }
      );
    }
    
    // 获取所有服务器组
    console.log('获取所有服务器组...');
    const groups = await db.select().from(serverGroups);
    
    let totalRemovedCount = 0;
    let totalFailedCount = 0;
    const results: any[] = [];
    
    // 遍历每个服务器组
    for (const group of groups) {
      try {
        console.log(`处理服务器组: ${group.name} (${group.id})`);
        
        // 检查服务器组是否有API配置
        if (!group.apiUrl || !group.apiKey) {
          console.log(`服务器组 ${group.name} 缺少API配置，跳过`);
          results.push({
            serverGroupId: group.id,
            serverGroupName: group.name,
            success: false,
            message: '服务器组缺少API配置',
            removedCount: 0,
            failedCount: 0
          });
          continue;
        }
        
        // 获取该服务器组关联的所有过期订阅
        const expiredSubscriptions = await db.select({
          id: subscriptions.id,
          userUUID: subscriptions.userUUID,
          expiresAt: subscriptions.expiresAt
        })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.serverGroupId, group.id),
            lt(subscriptions.expiresAt, new Date())
          )
        );
        
        console.log(`服务器组 ${group.name} 找到 ${expiredSubscriptions.length} 个过期订阅`);
        
        if (expiredSubscriptions.length === 0) {
          results.push({
            serverGroupId: group.id,
            serverGroupName: group.name,
            success: true,
            message: '没有找到过期的订阅',
            removedCount: 0,
            failedCount: 0
          });
          continue;
        }
        
        // 从V2Ray面板删除过期的UUID
        let removedCount = 0;
        let failedCount = 0;
        const failedUUIDs: string[] = [];
        
        for (const subscription of expiredSubscriptions) {
          try {
            const result = await removeV2RayUUID(
              {
                apiUrl: group.apiUrl,
                apiKey: group.apiKey
              },
              subscription.userUUID
            );
            
            if (result.success) {
              removedCount++;
              totalRemovedCount++;
            } else {
              failedCount++;
              totalFailedCount++;
              failedUUIDs.push(subscription.userUUID);
            }
          } catch (error) {
            console.error(`删除UUID ${subscription.userUUID} 失败:`, error);
            failedCount++;
            totalFailedCount++;
            failedUUIDs.push(subscription.userUUID);
          }
        }
        
        results.push({
          serverGroupId: group.id,
          serverGroupName: group.name,
          success: true,
          message: `成功处理 ${expiredSubscriptions.length} 个过期订阅`,
          removedCount,
          failedCount,
          failedUUIDs: failedUUIDs.length > 0 ? failedUUIDs : undefined
        });
      } catch (error) {
        console.error(`处理服务器组 ${group.name} 时出错:`, error);
        results.push({
          serverGroupId: group.id,
          serverGroupName: group.name,
          success: false,
          message: error instanceof Error ? error.message : '未知错误',
          removedCount: 0,
          failedCount: 0
        });
      }
    }
    
    console.log('清理过期UUID完成');
    
    return NextResponse.json({
      success: true,
      message: `清理完成，总共删除 ${totalRemovedCount} 个UUID，失败 ${totalFailedCount} 个`,
      totalRemovedCount,
      totalFailedCount,
      results
    });
  } catch (error) {
    console.error('清理过期UUID时发生错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
}

// 为了方便测试，也支持GET方法
export async function GET() {
  return NextResponse.json({
    message: '清理过期UUID API',
    usage: {
      method: 'POST',
      description: '清理所有服务器组中的过期UUID',
      authentication: '如果设置了 CRON_AUTH_TOKEN 环境变量，需要在请求头中包含 Authorization: Bearer YOUR_TOKEN',
      example: 'curl -X POST https://your-domain.com/api/cleanup-expired-uuids -H "Authorization: Bearer YOUR_TOKEN"'
    }
  });
}