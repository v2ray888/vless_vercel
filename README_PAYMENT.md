# 支付系统集成说明

## 概述

本项目已集成第三方支付系统，支持多种支付方式，包括支付宝、微信支付等。支付系统基于Misufu支付平台实现。

## 目录结构

```
src/
├── lib/
│   └── payment/           # 支付系统核心代码
│       ├── types.ts       # 类型定义
│       ├── utils.ts       # 工具函数（签名算法等）
│       └── service.ts     # 支付服务类
├── app/
│   ├── api/
│   │   └── payment/       # 支付相关API路由
│   │       ├── notify/     # 异步通知处理
│   │       └── return/     # 页面跳转通知处理
│   ├── payment/           # 支付相关页面
│   │   ├── result/        # 支付结果页面
│   │   └── qrcode/        # 二维码支付页面
│   └── dashboard/
│       └── payment-test/  # 支付测试页面
└── components/
    └── payment/           # 支付相关组件
        └── payment-button.tsx  # 支付按钮组件
```

## 配置

### 环境变量

在 `.env.local` 文件中配置以下环境变量：

```bash
# Payment Configuration
PAYMENT_PID=1001                    # 商户ID
PAYMENT_KEY=your_payment_key        # 商户密钥
PAYMENT_API_URL=https://server.misufu.com  # 支付API地址
```

## 核心功能

### 1. 支付服务类 (PaymentService)

位于 `src/lib/payment/service.ts`，提供以下核心功能：

- **页面跳转支付**: 生成支付表单HTML
- **API支付**: 后端发起支付请求
- **通知处理**: 验证并处理支付通知
- **查询接口**: 查询商户信息、订单、支付方式等

### 2. 支付按钮组件 (PaymentButton)

位于 `src/components/payment/payment-button.tsx`，提供简单的支付按钮组件，可直接在页面中使用。

### 3. API路由

- **异步通知**: `/api/payment/notify` - 处理支付平台的异步通知
- **页面跳转**: `/api/payment/return` - 处理支付平台的页面跳转通知

### 4. 页面

- **支付结果**: `/payment/result` - 显示支付结果
- **二维码支付**: `/payment/qrcode` - 显示二维码支付页面
- **支付测试**: `/dashboard/payment-test` - 测试支付功能

## 使用方法

### 在页面中使用支付按钮

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

### 直接使用支付服务

```typescript
import { PaymentService } from '@/lib/payment';

const paymentService = new PaymentService({
  pid: parseInt(process.env.PAYMENT_PID || '0'),
  key: process.env.PAYMENT_KEY || '',
  apiUrl: process.env.PAYMENT_API_URL || 'https://server.misufu.com',
});

// 发起API支付
const result = await paymentService.apiPayment({
  out_trade_no: 'ORDER123456',
  notify_url: 'https://yoursite.com/api/payment/notify',
  return_url: 'https://yoursite.com/api/payment/return',
  name: 'VIP会员',
  money: '1.00',
  clientip: '192.168.1.100',
});
```

## 安全性

1. **签名验证**: 所有支付通知都经过MD5签名验证
2. **HTTPS**: 所有支付接口都应通过HTTPS传输
3. **环境变量**: 敏感信息存储在环境变量中

## 测试

可以通过以下方式测试支付系统：

1. 访问 `/dashboard/payment-test` 页面
2. 输入测试订单信息
3. 点击支付按钮进行测试

## 部署

部署到生产环境时，请确保：

1. 更新环境变量为生产配置
2. 配置正确的通知URL
3. 确保服务器能够接收外部HTTP请求