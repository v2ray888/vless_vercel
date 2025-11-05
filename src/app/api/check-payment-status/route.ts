import { NextRequest } from 'next/server';
import { getDb } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    
    console.log('检查支付状态请求:', { orderId });
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: '缺少订单号参数' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const db = getDb();
    
    // 查询订单状态
    const orderResults = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    
    console.log('订单查询结果:', orderResults);
    
    // 如果订单不存在，返回特定的状态而不是404错误
    if (orderResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          paid: false,
          status: 'not_found',
          message: '订单不存在'
        }),
        { 
          status: 200, // 使用200状态码，因为这是业务逻辑而非错误
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const order = orderResults[0];
    
    // 返回订单状态
    return new Response(
      JSON.stringify({ 
        paid: order.status === 'completed',
        status: order.status,
        orderId: orderId
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('检查支付状态时出错:', error);
    return new Response(
      JSON.stringify({ 
        paid: false,
        status: 'error',
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误'
      }),
      { 
        status: 200, // 使用200状态码，避免前端出现错误
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}