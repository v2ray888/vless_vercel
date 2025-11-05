'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  productName: string;
  paymentType?: string; // 添加支付方式参数
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export function PaymentButton({ 
  orderId, 
  amount, 
  productName,
  paymentType = 'alipay', // 默认支付方式为支付宝
  onPaymentSuccess,
  onPaymentError
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // 这里应该调用后端API来创建支付订单
      // 示例代码，实际实现需要根据您的后端API调整
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          productName,
          paymentType, // 传递支付方式参数
        }),
      });
      
      console.log('创建支付订单API响应状态:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('创建支付订单API错误响应:', errorText);
        throw new Error(`创建支付订单失败: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 添加日志以便调试
      console.log('创建支付订单API返回结果:', result);
      
      // 检查返回结果是否有效
      if (!result) {
        throw new Error('支付API返回空结果');
      }
      
      // 根据返回的结果处理支付
      if (result.payurl) {
        // 如果返回了支付URL，直接跳转
        window.location.href = result.payurl;
      } else if (result.qrcode) {
        // 如果返回了二维码，显示二维码页面
        window.location.href = `/payment/qrcode?url=${encodeURIComponent(result.qrcode)}&orderId=${orderId}`;
      } else {
        console.error('支付信息不完整，返回结果:', result);
        // 提供更详细的错误信息
        if (result.code !== undefined && result.msg) {
          throw new Error(`支付API返回错误: ${result.msg} (code: ${result.code})`);
        } else {
          throw new Error('支付信息不完整: 未返回支付URL或二维码');
        }
      }
      
      // 调用成功回调
      onPaymentSuccess?.();
    } catch (error) {
      console.error('支付过程中出错:', error);
      // 调用错误回调
      const errorMessage = error instanceof Error ? error.message : '支付过程中出现未知错误';
      onPaymentError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          处理中...
        </>
      ) : (
        `支付 ¥${amount.toFixed(2)}`
      )}
    </Button>
  );
}