import crypto from 'crypto';
import { PaymentConfig, PaymentRequest, ApiPaymentRequest, PaymentNotification } from './types';

/**
 * MD5签名算法
 * @param params 参数对象
 * @param key 商户密钥
 * @returns 签名字符串
 */
export function generateSign(params: Record<string, any>, key: string): string {
  // 1. 过滤掉sign、sign_type和空值参数
  const filteredParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    // 根据支付平台规范：sign、sign_type、和空值不参与签名
    if (k !== 'sign' && k !== 'sign_type' && v !== undefined && v !== null && v !== '') {
      filteredParams[k] = String(v);
    }
  }

  // 2. 按参数名ASCII码从小到大排序
  const sortedKeys = Object.keys(filteredParams).sort();
  
  // 3. 拼接成URL键值对格式（参数值不要进行url编码）
  const paramString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&');
  
  // 4. 拼接商户密钥并进行MD5加密得出sign签名参数
  const signString = paramString + key;
  console.log('MD5签名字符串:', signString); // 添加日志以便调试
  console.log('MD5签名参数:', filteredParams); // 添加日志以便调试
  return crypto.createHash('md5').update(signString, 'utf8').digest('hex');
}

/**
 * 验证签名
 * @param params 包含签名的参数对象
 * @param key 商户密钥
 * @returns 是否验证通过
 */
export function verifySign(params: Record<string, any>, key: string): boolean {
  if (!params.sign) {
    return false;
  }
  
  const receivedSign = params.sign;
  const calculatedSign = generateSign(params, key);
  return receivedSign === calculatedSign;
}

/**
 * 构建支付请求参数
 * @param config 支付配置
 * @param request 支付请求数据
 * @returns 完整的支付请求参数
 */
export function buildPaymentRequest(
  config: PaymentConfig, 
  request: Omit<PaymentRequest, 'sign' | 'sign_type' | 'pid'>
): PaymentRequest {
  const params: PaymentRequest = {
    pid: config.pid,
    out_trade_no: request.out_trade_no,
    notify_url: request.notify_url,
    return_url: request.return_url,
    name: request.name,
    money: request.money,
    param: request.param,
    sign_type: 'MD5', // 使用MD5签名
    sign: '' // 占位符，稍后计算
  };

  // 如果指定了支付方式，则添加
  if (request.type) {
    params.type = request.type;
  }

  // 生成签名（只使用MD5）
  params.sign = generateSign(params, config.key);
  
  return params;
}

/**
 * 构建API支付请求参数
 * @param config 支付配置
 * @param request API支付请求数据
 * @returns 完整的API支付请求参数
 */
export function buildApiPaymentRequest(
  config: PaymentConfig,
  request: Omit<ApiPaymentRequest, 'sign' | 'sign_type' | 'pid'>
): ApiPaymentRequest {
  const params: ApiPaymentRequest = {
    pid: config.pid,
    out_trade_no: request.out_trade_no,
    notify_url: request.notify_url,
    return_url: request.return_url,
    name: request.name,
    money: request.money,
    clientip: request.clientip,
    // 只有在有值时才添加param和device参数
    ...(request.param && { param: request.param }),
    // 设置默认设备类型为pc以确保返回二维码
    device: request.device || 'pc',
    // 使用传入的时间戳，如果未提供则生成新的
    timestamp: request.timestamp || Math.floor(Date.now() / 1000).toString(),
    sign_type: 'MD5', // 使用MD5签名
    sign: '' // 占位符，稍后计算
  };

  // 如果指定了支付方式，则添加
  if (request.type) {
    params.type = request.type;
  }

  // 生成签名（只使用MD5）
  params.sign = generateSign(params, config.key);
  
  return params;
}

/**
 * 构建查询API URL
 * @param config 支付配置
 * @param action 操作类型
 * @param additionalParams 附加参数
 * @returns 完整的查询URL
 */
export function buildQueryUrl(
  config: PaymentConfig,
  action: string,
  additionalParams: Record<string, string | number> = {}
): string {
  const baseUrl = config.apiUrl;
  const params = new URLSearchParams({
    act: action,
    pid: config.pid.toString(),
    key: config.key,
    ...additionalParams
  });
  
  return `${baseUrl}?${params.toString()}`;
}