import crypto from 'crypto';
import { PaymentConfig, PaymentRequest, ApiPaymentRequest, PaymentNotification } from './types';

// RSA签名算法
export function generateRSASign(params: Record<string, any>, privateKey: string): string {
  // 1. 过滤掉sign、sign_type和空值参数
  const filteredParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k !== 'sign' && k !== 'sign_type' && v !== undefined && v !== null && v !== '') {
      filteredParams[k] = String(v);
    }
  }

  // 2. 按参数名ASCII码从小到大排序
  const sortedKeys = Object.keys(filteredParams).sort();
  
  // 3. 拼接成URL键值对格式
  const paramString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&');
  
  console.log('RSA签名字符串:', paramString);
  console.log('RSA签名参数:', filteredParams);
  
  // 4. 使用RSA私钥进行签名
  try {
    // 格式化私钥
    const formattedPrivateKey = formatPrivateKey(privateKey);
    
    // 创建签名
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(paramString);
    const signature = sign.sign(formattedPrivateKey, 'base64');
    
    return signature;
  } catch (error) {
    console.error('RSA签名失败:', error);
    throw new Error('RSA签名失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

// RSA验签算法
export function verifyRSASign(params: Record<string, any>, publicKey: string): boolean {
  if (!params.sign) {
    return false;
  }

  const receivedSign = params.sign;
  
  // 1. 过滤掉sign、sign_type和空值参数
  const filteredParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k !== 'sign' && k !== 'sign_type' && v !== undefined && v !== null && v !== '') {
      filteredParams[k] = String(v);
    }
  }

  // 2. 按参数名ASCII码从小到大排序
  const sortedKeys = Object.keys(filteredParams).sort();
  
  // 3. 拼接成URL键值对格式
  const paramString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&');
  
  try {
    // 格式化公钥
    const formattedPublicKey = formatPublicKey(publicKey);
    
    // 验证签名
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(paramString);
    const result = verify.verify(formattedPublicKey, receivedSign, 'base64');
    
    return result;
  } catch (error) {
    console.error('RSA验签失败:', error);
    return false;
  }
}

// 格式化私钥
function formatPrivateKey(privateKey: string): string {
  // 移除所有换行符和空格
  let key = privateKey.replace(/\s/g, '');
  
  // 如果没有PEM头尾，添加它们
  if (!key.startsWith('-----BEGIN PRIVATE KEY-----')) {
    key = '-----BEGIN PRIVATE KEY-----\n' + 
          key.match(/.{1,64}/g)?.join('\n') + 
          '\n-----END PRIVATE KEY-----';
  }
  
  return key;
}

// 格式化公钥
function formatPublicKey(publicKey: string): string {
  // 移除所有换行符和空格
  let key = publicKey.replace(/\s/g, '');
  
  // 如果没有PEM头尾，添加它们
  if (!key.startsWith('-----BEGIN PUBLIC KEY-----')) {
    key = '-----BEGIN PUBLIC KEY-----\n' + 
          key.match(/.{1,64}/g)?.join('\n') + 
          '\n-----END PUBLIC KEY-----';
  }
  
  return key;
}

/**
 * 构建API支付请求参数（使用RSA签名）
 * @param config 支付配置
 * @param request API支付请求数据
 * @returns 完整的API支付请求参数
 */
export function buildApiPaymentRequestWithRSA(
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
    param: request.param,
    // 设置默认设备类型为pc以确保返回二维码
    device: request.device || 'pc',
    // 添加时间戳参数（SDK中的关键参数）
    timestamp: Math.floor(Date.now() / 1000).toString(),
    sign_type: 'RSA', // 使用RSA签名
    sign: '' // 占位符，稍后计算
  };

  // 如果指定了支付方式，则添加
  if (request.type) {
    params.type = request.type;
  }

  // 生成签名（使用RSA）
  if (config.rsaPrivateKey) {
    params.sign = generateRSASign(params, config.rsaPrivateKey);
  } else {
    throw new Error('缺少RSA私钥配置');
  }
  
  return params;
}