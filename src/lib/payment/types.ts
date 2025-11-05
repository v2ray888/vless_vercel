// 支付相关类型定义

export interface PaymentConfig {
  pid: number;
  key: string;
  apiUrl: string;
  rsaPrivateKey?: string; // 商户私钥（用于RSA签名）
  rsaPublicKey?: string;  // 平台公钥（用于RSA验签）
}

export interface PaymentRequest {
  pid: number;
  type?: string; // 支付方式
  out_trade_no: string; // 商户订单号
  notify_url: string; // 异步通知地址
  return_url: string; // 跳转通知地址
  name: string; // 商品名称
  money: string; // 商品金额
  param?: string; // 业务扩展参数
  timestamp?: string; // 时间戳（用于签名）
  sign: string; // 签名字符串
  sign_type: string; // 签名类型
}

export interface ApiPaymentRequest extends PaymentRequest {
  clientip: string; // 用户IP地址
  device?: string; // 设备类型
}

export interface PaymentResponse {
  code: number; // 返回状态码
  msg?: string; // 返回信息
  trade_no?: string; // 订单号
  payurl?: string; // 支付跳转url
  qrcode?: string; // 二维码链接
  urlscheme?: string; // 小程序跳转url
}

export interface PaymentNotification {
  pid: number; // 商户ID
  trade_no: string; // 易支付订单号
  out_trade_no: string; // 商户订单号
  type: string; // 支付方式
  name: string; // 商品名称
  money: string; // 商品金额
  trade_status: string; // 支付状态
  param?: string; // 业务扩展参数
  timestamp?: string; // 时间戳
  sign: string; // 签名字符串
  sign_type: string; // 签名类型
}

export interface MerchantInfo {
  code: number; // 返回状态码
  pid: number; // 商户ID
  key: string; // 商户密钥
  active: number; // 商户状态
  money: string; // 商户余额
  type: number; // 结算方式
  account: string; // 结算账号
  username: string; // 结算姓名
  orders: number; // 订单总数
  order_today: number; // 今日订单
  order_lastday: number; // 昨日订单
}

export interface OrderInfo {
  code: number; // 返回状态码
  msg?: string; // 返回信息
  trade_no: string; // 易支付订单号
  out_trade_no: string; // 商户订单号
  api_trade_no: string; // 第三方订单号
  type: string; // 支付方式
  pid: number; // 商户ID
  addtime: string; // 创建订单时间
  endtime: string; // 完成交易时间
  name: string; // 商品名称
  money: string; // 商品金额
  status: number; // 支付状态
  param?: string; // 业务扩展参数
  buyer?: string; // 支付者账号
}

export interface PayType {
  name: string; // 支付类型
  showname: string; // 支付类型描述
}

export type PayTypeName = 'alipay' | 'wxpay' | 'qqpay' | 'bank' | 'jdpay' | 'paypal';
export type DeviceType = 'pc' | 'mobile' | 'qq' | 'wechat' | 'alipay';