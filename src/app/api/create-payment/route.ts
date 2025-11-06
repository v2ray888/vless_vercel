import { NextRequest } from 'next/server';
import { PaymentService } from '@/lib/payment/service';
import { getBaseUrl } from '@/lib/url-utils';
import { detectDeviceType, isWeChatBrowser, isAlipayBrowser } from '@/lib/device-detection';

// 创建支付服务实例
// 在实际应用中，这些配置应该从环境变量中获取
const paymentService = new PaymentService({
  pid: parseInt(process.env.PAYMENT_PID || '0'),
  key: process.env.PAYMENT_KEY || '',
  apiUrl: process.env.PAYMENT_API_URL || 'https://server.misufu.com',
  rsaPrivateKey: process.env.PAYMENT_RSA_PRIVATE_KEY || undefined,
  rsaPublicKey: process.env.PAYMENT_RSA_PUBLIC_KEY || undefined,
});

console.log('支付服务实例已创建:', {
  pid: process.env.PAYMENT_PID,
  keyPresent: !!process.env.PAYMENT_KEY,
  keyLength: process.env.PAYMENT_KEY ? process.env.PAYMENT_KEY.length : 0,
  apiUrl: process.env.PAYMENT_API_URL,
  hasRsaPrivateKey: !!process.env.PAYMENT_RSA_PRIVATE_KEY,
  hasRsaPublicKey: !!process.env.PAYMENT_RSA_PUBLIC_KEY,
});

/**
 * 创建支付订单
 * @param request 支付请求
 * @returns 支付信息
 */
export async function POST(request: NextRequest) {
  try {
    // 手动读取请求体并确保UTF-8编码
    const rawBody = await request.text();
    console.log('原始请求体:', rawBody);
    
    // 手动解析JSON，确保UTF-8编码
    const body = JSON.parse(rawBody);
    const { orderId, amount, productName, paymentType, userAgent } = body;
    
    console.log('解析后的请求数据:', { orderId, amount, productName, paymentType, userAgent });
    
    // 检查必需参数
    if (!orderId || !amount || !productName) {
      console.log('缺少必要参数:', { orderId, amount, productName });
      return new Response(JSON.stringify({
        code: -1,
        msg: '缺少必要参数',
        orderId: orderId // 返回订单ID以便调试
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    // 获取基础URL用于构建通知地址
    const baseUrl = getBaseUrl();
    
    // 获取客户端IP（优先使用IPv4）
    let clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1';
    
    // 如果是IPv6本地环回地址，转换为IPv4
    if (clientIp === '::1') {
      clientIp = '127.0.0.1';
    }
    
    // 检测设备类型
    const deviceType = userAgent ? detectDeviceType(userAgent) : 'desktop';
    const isWeChat = userAgent ? isWeChatBrowser(userAgent) : false;
    const isAlipayApp = userAgent ? isAlipayBrowser(userAgent) : false;
    
    console.log('设备检测结果:', { deviceType, isWeChat, isAlipayApp });
    
    // 根据设备类型和浏览器类型决定支付方式和设备参数
    let deviceParam = 'pc'; // 默认为PC（返回二维码）
    let finalPaymentType = paymentType || 'alipay'; // 默认支付方式
    
    if (deviceType === 'mobile') {
      // 移动设备
      if (isWeChat && finalPaymentType === 'wxpay') {
        // 微信浏览器中使用微信支付
        deviceParam = 'mobile';
      } else if (isAlipayApp && finalPaymentType === 'alipay') {
        // 支付宝浏览器中使用支付宝支付
        deviceParam = 'mobile';
      } else {
        // 其他移动浏览器，仍然返回二维码
        deviceParam = 'pc';
      }
    }
    // PC设备默认使用pc参数返回二维码
    
    console.log('支付配置检查:', {
      pid: process.env.PAYMENT_PID,
      keyLength: process.env.PAYMENT_KEY?.length,
      apiUrl: process.env.PAYMENT_API_URL,
      hasRsaPrivateKey: !!process.env.PAYMENT_RSA_PRIVATE_KEY
    });
    
    // 检查支付配置
    if (!process.env.PAYMENT_PID || !process.env.PAYMENT_KEY) {
      console.error('支付配置缺失:', {
        pid: process.env.PAYMENT_PID,
        key: process.env.PAYMENT_KEY ? '已设置' : '未设置'
      });
      
      return new Response(JSON.stringify({
        code: -1,
        msg: '支付配置缺失',
        orderId: orderId // 返回订单ID以便调试
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    // 准备支付请求参数，确保中文字符正确处理
    const paymentRequest = {
      out_trade_no: orderId,
      notify_url: `${baseUrl}/api/payment/notify`,
      return_url: `${baseUrl}/api/payment/return`,
      name: productName, // 保持原始字符串，不要强制转换
      money: amount.toFixed(2),
      clientip: clientIp,
      type: finalPaymentType, // 使用确定的支付方式
      device: deviceParam, // 根据设备类型设置
      // 添加timestamp参数，这是SDK中的关键参数
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };
    
    console.log('准备发送的支付请求参数:', paymentRequest);
    
    // 记录环境变量信息（用于调试）
    console.log('环境变量信息:', {
      PAYMENT_PID: process.env.PAYMENT_PID,
      PAYMENT_KEY_LENGTH: process.env.PAYMENT_KEY?.length,
      PAYMENT_API_URL: process.env.PAYMENT_API_URL,
      HAS_RSA_PRIVATE_KEY: !!process.env.PAYMENT_RSA_PRIVATE_KEY
    });
    
    // 调用API支付接口
    const result = await paymentService.apiPayment(paymentRequest);
    
    // 添加日志以便调试
    console.log('支付服务返回结果:', result);
    
    // 检查支付服务返回结果
    if (!result) {
      console.error('支付服务返回空结果');
      return new Response(JSON.stringify({
        code: -1,
        msg: '支付服务返回空结果',
        orderId: orderId // 返回订单ID以便调试
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    // 如果支付服务返回错误，也返回订单ID
    if (result.code !== 1) {
      return new Response(JSON.stringify({
        ...result,
        orderId: orderId // 添加订单ID以便调试
      }), {
        status: 200, // 注意：这里使用200状态码，因为这是业务错误而不是服务器错误
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    // 返回支付信息，包括设备类型信息
    return new Response(JSON.stringify({
      ...result,
      orderId: orderId, // 添加订单ID以便调试
      deviceType: deviceType, // 返回设备类型信息
      deviceParam: deviceParam // 返回设备参数信息
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('创建支付订单时出错:', error);
    return new Response(JSON.stringify({
      code: -1,
      msg: '创建支付订单时出错: ' + (error instanceof Error ? error.message : '未知错误'),
      // 不要在这里返回orderId，因为可能解析JSON时就出错了
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }
}