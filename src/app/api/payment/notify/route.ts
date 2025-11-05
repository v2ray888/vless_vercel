import { NextRequest } from 'next/server';
import { PaymentService } from '@/lib/payment/service';
import { processSuccessfulPayment } from '@/lib/payment/payment-success-handler';

// 创建支付服务实例
// 在实际应用中，这些配置应该从环境变量中获取
const paymentService = new PaymentService({
  pid: parseInt(process.env.PAYMENT_PID || '0'),
  key: process.env.PAYMENT_KEY || '',
  apiUrl: process.env.PAYMENT_API_URL || 'https://server.misufu.com',
});

/**
 * 处理支付异步通知
 * @param request 支付通知请求
 * @returns 处理结果
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const notificationData: Record<string, string> = {};
    
    // 将URLSearchParams转换为普通对象
    for (const [key, value] of searchParams.entries()) {
      notificationData[key] = value;
    }
    
    // 处理支付通知
    const result = await paymentService.handleNotification(notificationData);
    
    // 如果处理成功，处理支付完成后的逻辑
    if (result.success) {
      // 从通知数据中提取相关信息
      const outTradeNo = notificationData.out_trade_no;
      const amount = parseFloat(notificationData.money || '0');
      
      // 对于新的简洁订单号格式，我们需要从数据库或其他方式获取用户和套餐信息
      // 这里简化处理，假设我们可以通过其他方式获取这些信息
      // 在实际应用中，您可能需要查询数据库获取订单详情
      
      // 返回success给支付平台
      return new Response('success', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    // 如果处理失败，返回错误信息
    return new Response(result.message, {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('处理支付通知时出错:', error);
    return new Response('处理支付通知时出错', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

/**
 * 处理支付异步通知 (POST方式)
 * @param request 支付通知请求
 * @returns 处理结果
 */
export async function POST(request: NextRequest) {
  try {
    // 获取表单数据
    const formData = await request.formData();
    const notificationData: Record<string, string> = {};
    
    // 将FormData转换为普通对象
    for (const [key, value] of formData.entries()) {
      notificationData[key] = value.toString();
    }
    
    // 处理支付通知
    const result = await paymentService.handleNotification(notificationData);
    
    // 如果处理成功，处理支付完成后的逻辑
    if (result.success) {
      // 从通知数据中提取相关信息
      const outTradeNo = notificationData.out_trade_no;
      const amount = parseFloat(notificationData.money || '0');
      
      // 对于新的简洁订单号格式，我们需要从数据库或其他方式获取用户和套餐信息
      // 这里简化处理，假设我们可以通过其他方式获取这些信息
      // 在实际应用中，您可能需要查询数据库获取订单详情
      
      // 返回success给支付平台
      return new Response('success', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    // 如果处理失败，返回错误信息
    return new Response(result.message, {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('处理支付通知时出错:', error);
    return new Response('处理支付通知时出错', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}