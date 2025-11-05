import { NextRequest } from 'next/server';
import { PaymentService } from '@/lib/payment/service';
import { redirect } from 'next/navigation';

// 创建支付服务实例
// 在实际应用中，这些配置应该从环境变量中获取
const paymentService = new PaymentService({
  pid: parseInt(process.env.PAYMENT_PID || '0'),
  key: process.env.PAYMENT_KEY || '',
  apiUrl: process.env.PAYMENT_API_URL || 'https://server.misufu.com',
});

/**
 * 处理支付页面跳转通知
 * @param request 支付通知请求
 * @returns 重定向到结果页面
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
    
    // 验证签名
    if (!paymentService.verifyNotification(notificationData)) {
      // 签名验证失败，重定向到错误页面
      return redirect('/payment/result?success=false&message=签名验证失败');
    }
    
    // 检查支付状态
    if (notificationData.trade_status !== 'TRADE_SUCCESS') {
      // 支付未成功，重定向到失败页面
      return redirect(`/payment/result?success=false&message=支付未成功&order=${notificationData.out_trade_no}`);
    }
    
    // 支付成功，重定向到成功页面
    return redirect(`/payment/result?success=true&message=支付成功&order=${notificationData.out_trade_no}`);
  } catch (error) {
    console.error('处理支付返回时出错:', error);
    return redirect('/payment/result?success=false&message=处理支付返回时出错');
  }
}