# 支付系统集成指南

## 概述

本文档介绍了如何在您的应用中集成支付系统。该支付系统基于Misufu支付平台，支持多种支付方式，包括支付宝、微信支付等。

## 支付系统架构

支付系统包含以下组件：

1. **支付服务类** (`PaymentService`) - 核心支付逻辑处理
2. **工具函数** (`utils.ts`) - 签名生成和验证
3. **类型定义** (`types.ts`) - 所有支付相关数据结构
4. **API路由** - 处理支付通知和回调
5. **前端组件** - 支付按钮和结果页面

## 配置

### 环境变量

在 `.env.local` 文件中配置以下环境变量：

```bash
# Payment Configuration
PAYMENT_PID=1001                    # 商户ID
PAYMENT_KEY=your_payment_key        # 商户密钥
PAYMENT_API_URL=https://server.misufu.com  # 支付API地址
```

## 使用方法

### 1. 创建支付服务实例

```typescript
import { PaymentService } from '@/lib/payment';

const paymentService = new PaymentService({
  pid: parseInt(process.env.PAYMENT_PID || '0'),
  key: process.env.PAYMENT_KEY || '',
  apiUrl: process.env.PAYMENT_API_URL || 'https://server.misufu.com',
});
```

### 2. 发起页面跳转支付

```typescript
const formHtml = await paymentService.generatePaymentForm({
  out_trade_no: 'ORDER123456',     // 商户订单号
  notify_url: 'https://yoursite.com/api/payment/notify',  // 异步通知地址
  return_url: 'https://yoursite.com/api/payment/return',  // 跳转通知地址
  name: 'VIP会员',                 // 商品名称
  money: '1.00',                  // 商品金额
});
```

### 3. 发起API支付

```typescript
const result = await paymentService.apiPayment({
  out_trade_no: 'ORDER123456',     // 商户订单号
  notify_url: 'https://yoursite.com/api/payment/notify',  // 异步通知地址
  return_url: 'https://yoursite.com/api/payment/return',  // 跳转通知地址
  name: 'VIP会员',                 // 商品名称
  money: '1.00',                  // 商品金额
  clientip: '192.168.1.100',      // 用户IP地址
});
```

### 4. 处理支付通知

支付系统会自动处理来自支付平台的异步通知和页面跳转通知。

## API接口

### 支付通知处理

- **异步通知URL**: `/api/payment/notify`
- **页面跳转URL**: `/api/payment/return`

### 查询接口

#### 查询商户信息

```typescript
const merchantInfo = await paymentService.queryMerchantInfo();
```

#### 查询订单

```typescript
const orderInfo = await paymentService.queryOrder('ORDER123456');
```

#### 查询支付方式

```typescript
const payTypes = await paymentService.queryPayTypes();
```

## 前端组件

### PaymentButton 组件

在您的页面中使用支付按钮组件：

```tsx
import { PaymentButton } from '@/components/payment/payment-button';

<PaymentButton
  orderId="ORDER123456"
  amount={1.00}
  productName="VIP会员"
  onPaymentSuccess={() => console.log('支付成功')}
  onPaymentError={(error) => console.error('支付失败:', error)}
/>
```

## 安全性

1. **签名验证**: 所有支付通知都会进行MD5签名验证
2. **HTTPS**: 所有支付接口都应通过HTTPS传输
3. **环境变量**: 敏感信息（如商户密钥）应存储在环境变量中

## 错误处理

支付系统包含完整的错误处理机制：

1. 网络请求错误
2. 签名验证失败
3. 支付状态异常
4. 数据格式错误

## 测试

在开发环境中，您可以使用测试商户ID和密钥进行测试。

## 部署

部署到生产环境时，请确保：

1. 更新环境变量为生产配置
2. 配置正确的通知URL
3. 确保服务器能够接收外部HTTP请求