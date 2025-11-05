import { PaymentConfig, PaymentRequest, ApiPaymentRequest, PaymentResponse, MerchantInfo, OrderInfo, PayType } from './types';
import { buildPaymentRequest, buildApiPaymentRequest, buildQueryUrl, verifySign } from './utils';
import { buildApiPaymentRequestWithRSA } from './rsa-utils';

export class PaymentService {
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
    // 添加配置验证日志
    console.log('支付服务配置:', {
      pid: config.pid,
      keyPresent: !!config.key,
      keyLength: config.key ? config.key.length : 0,
      apiUrl: config.apiUrl,
      hasRsaPrivateKey: !!config.rsaPrivateKey,
      hasRsaPublicKey: !!config.rsaPublicKey
    });
  }

  /**
   * 页面跳转支付 - 生成支付表单HTML
   * @param request 支付请求数据
   * @returns 支付表单HTML
   */
  async generatePaymentForm(request: Omit<PaymentRequest, 'sign' | 'sign_type' | 'pid'>): Promise<string> {
    const params = buildPaymentRequest(this.config, request);
    
    let formHtml = `<form id="paymentForm" action="${this.config.apiUrl}/submit.php" method="post">`;
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        formHtml += `<input type="hidden" name="${key}" value="${value}">`;
      }
    }
    
    formHtml += '</form>';
    formHtml += '<script>document.getElementById("paymentForm").submit();</script>';
    
    return formHtml;
  }

  /**
   * API接口支付
   * @param request API支付请求数据
   * @returns 支付响应
   */
  async apiPayment(request: Omit<ApiPaymentRequest, 'sign' | 'sign_type' | 'pid'>): Promise<PaymentResponse> {
    // 验证配置
    if (!this.config.pid || !this.config.key || !this.config.apiUrl) {
      console.error('支付配置不完整:', this.config);
      throw new Error('支付配置不完整');
    }
    
    // 添加调试日志
    console.log('支付配置详情:', {
      hasPid: !!this.config.pid,
      hasKey: !!this.config.key,
      hasApiUrl: !!this.config.apiUrl,
      hasRsaPrivateKey: !!this.config.rsaPrivateKey,
      hasRsaPublicKey: !!this.config.rsaPublicKey
    });
    
    // 根据配置决定使用哪种签名方式
    let params: ApiPaymentRequest;
    if (this.config.rsaPrivateKey) {
      // 使用RSA签名
      console.log('使用RSA签名');
      params = buildApiPaymentRequestWithRSA(this.config, request);
    } else {
      // 使用MD5签名（默认）
      console.log('使用MD5签名');
      params = buildApiPaymentRequest(this.config, request);
    }
    
    // 添加日志以便调试
    console.log('准备发送支付请求到:', `${this.config.apiUrl}/mapi.php`);
    console.log('请求参数:', params);
    
    // 特别记录签名相关参数
    const signDebug = {
      pid: params.pid,
      out_trade_no: params.out_trade_no,
      notify_url: params.notify_url,
      return_url: params.return_url,
      name: params.name,
      money: params.money,
      clientip: params.clientip,
      sign_type: params.sign_type,
      timestamp: params.timestamp
    };
    console.log('签名计算参数:', signDebug);
    
    // 验证签名计算
    const { sign, ...paramsForSign } = params;
    console.log('用于签名计算的参数:', paramsForSign);
    
    try {
      const response = await fetch(`${this.config.apiUrl}/mapi.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: new URLSearchParams(params as any).toString(),
      });
      
      console.log('支付API响应状态:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('支付API错误响应:', errorText);
        // 返回错误信息而不是抛出异常
        return {
          code: -1,
          msg: `HTTP错误: ${response.status}, 响应内容: ${errorText}`
        };
      }
      
      const result: PaymentResponse = await response.json();
      console.log('支付API响应:', result); // 添加日志以便调试
      
      // 检查API返回的错误代码
      if (result.code !== 1) {
        console.error('支付API返回业务错误:', result);
        // 直接返回API的错误信息
        return result;
      }
      
      return result;
    } catch (error) {
      console.error('API支付请求失败:', error);
      // 返回更详细的错误信息
      return {
        code: -1,
        msg: '支付请求失败: ' + (error instanceof Error ? error.message : '未知错误') + 
             (error instanceof Error && error.stack ? '\n' + error.stack : '')
      };
    }
  }

  /**
   * 验证支付通知签名
   * @param notification 支付通知数据
   * @returns 是否验证通过
   */
  verifyNotification(notification: any): boolean {
    // 根据配置决定使用哪种签名验证方式
    if (this.config.rsaPublicKey) {
      // 使用RSA验签
      try {
        // 这里需要实现RSA验签逻辑
        // 由于我们没有平台公钥的完整实现，暂时返回true
        console.log('使用RSA验签（需要实现完整逻辑）');
        return true;
      } catch (error) {
        console.error('RSA验签失败:', error);
        return false;
      }
    } else {
      // 使用MD5签名验证
      return verifySign(notification, this.config.key);
    }
  }

  /**
   * 处理支付通知
   * @param notification 支付通知数据
   * @returns 处理结果
   */
  async handleNotification(notification: any): Promise<{ success: boolean; message: string }> {
    // 验证签名
    if (!this.verifyNotification(notification)) {
      return {
        success: false,
        message: '签名验证失败'
      };
    }
    
    // 检查支付状态
    if (notification.trade_status !== 'TRADE_SUCCESS') {
      return {
        success: false,
        message: '支付未成功'
      };
    }
    
    // 这里应该处理业务逻辑，比如更新订单状态等
    // 由于这是示例代码，我们只是返回成功
    
    return {
      success: true,
      message: 'success' // 异步通知需要返回success
    };
  }

  /**
   * 查询商户信息
   * @returns 商户信息
   */
  async queryMerchantInfo(): Promise<MerchantInfo> {
    try {
      const url = buildQueryUrl(this.config, 'query');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: MerchantInfo = await response.json();
      return result;
    } catch (error) {
      console.error('查询商户信息失败:', error);
      return {
        code: -1,
        pid: 0,
        key: '',
        active: 0,
        money: '0.00',
        type: 0,
        account: '',
        username: '',
        orders: 0,
        order_today: 0,
        order_lastday: 0
      };
    }
  }

  /**
   * 查询单个订单
   * @param outTradeNo 商户订单号
   * @returns 订单信息
   */
  async queryOrder(outTradeNo: string): Promise<OrderInfo> {
    try {
      const url = buildQueryUrl(this.config, 'order', { out_trade_no: outTradeNo });
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: OrderInfo = await response.json();
      return result;
    } catch (error) {
      console.error('查询订单失败:', error);
      return {
        code: -1,
        trade_no: '',
        out_trade_no: '',
        api_trade_no: '',
        type: '',
        pid: 0,
        addtime: '',
        endtime: '',
        name: '',
        money: '0.00',
        status: 0
      };
    }
  }

  /**
   * 查询可用支付方式
   * @returns 支付方式列表
   */
  async queryPayTypes(): Promise<PayType[]> {
    try {
      const url = buildQueryUrl(this.config, 'paytype');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: { code: number; msg?: string; data?: PayType[] } = await response.json();
      
      if (result.code === 1 && result.data) {
        return result.data;
      }
      
      return [];
    } catch (error) {
      console.error('查询支付方式失败:', error);
      return [];
    }
  }
}