'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, QrCode, CheckCircle, AlertCircle, Smartphone, Monitor } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useAuth } from '@/contexts/auth-context';
import { detectDeviceType, isWeChatBrowser, isAlipayBrowser } from '@/lib/device-detection';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  price: number;
  billingCycle: string;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  planId, 
  planName, 
  price,
  billingCycle
}: PaymentModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat'); // 默认微信支付
  const [error, setError] = useState<string | null>(null); // 添加错误状态
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop' | null>(null); // 设备类型
  const [isWeChatBrowser, setIsWeChatBrowser] = useState(false);
  const [isAlipayBrowser, setIsAlipayBrowser] = useState(false);

  // 检测设备类型和浏览器类型
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const detectedDeviceType = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ? 'mobile' : 'desktop';
    const weChatBrowser = /MicroMessenger/i.test(userAgent);
    const alipayBrowser = /AlipayClient/i.test(userAgent);
    
    setDeviceType(detectedDeviceType);
    setIsWeChatBrowser(weChatBrowser);
    setIsAlipayBrowser(alipayBrowser);
    
    // 如果在微信浏览器中，默认选择微信支付
    if (weChatBrowser) {
      setPaymentMethod('wechat');
    }
    // 如果在支付宝浏览器中，默认选择支付宝支付
    else if (alipayBrowser) {
      setPaymentMethod('alipay');
    }
  }, []);

  useEffect(() => {
    const createPaymentOrder = async () => {
      if (!isOpen || !user) return;
      
      // 重置状态
      setIsLoading(true);
      setPaymentUrl(null);
      setOrderId(null);
      setIsPaid(false);
      setError(null); // 重置错误状态
      
      try {
        // 生成简洁的订单号 - 使用时间戳和随机数确保唯一性
        const timestamp = Date.now().toString(36); // 转换为36进制缩短长度
        const randomStr = Math.random().toString(36).substring(2, 8); // 6位随机字符串
        const newOrderId = `ORD${timestamp}${randomStr}`.toUpperCase();
        setOrderId(newOrderId);
        
        // 生成简洁的商品名称
        const shortPlanName = planName.length > 20 ? planName.substring(0, 17) + '...' : planName;
        const billingCycleText = getBillingCycleText();
        const shortProductName = `${shortPlanName}(${billingCycleText})`;
        
        // 创建支付订单
        const response = await fetch('/api/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: newOrderId,
            amount: price,
            productName: shortProductName, // 使用优化后的商品名称
            paymentType: paymentMethod === 'wechat' ? 'wxpay' : 'alipay', // 根据选择的支付方式设置
            userAgent: navigator.userAgent, // 传递用户代理字符串用于设备检测
          }),
        });
        
        const result = await response.json();
        console.log('支付API响应:', result);
        
        if (result.code === 1) {
          // 根据设备类型决定如何处理支付
          if (result.payurl) {
            setPaymentUrl(result.payurl);
          } else if (result.qrcode) {
            setPaymentUrl(result.qrcode);
          } else {
            setError('支付信息不完整');
            toast({
              variant: 'destructive',
              title: '支付失败',
              description: '支付信息不完整，未返回支付URL或二维码',
            });
          }
          setError(null); // 清除错误
        } else {
          // 显示更详细的错误信息
          const errorMessage = result.msg || result.message || '创建支付订单失败';
          setError(errorMessage);
          toast({
            variant: 'destructive',
            title: '支付失败',
            description: errorMessage,
          });
        }
      } catch (error) {
        console.error('创建支付订单时出现错误:', error);
        const errorMessage = '创建支付订单时出现错误: ' + (error instanceof Error ? error.message : '未知错误');
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: '错误',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen && user && !paymentUrl && !isPaid && deviceType) {
      createPaymentOrder();
    }
  }, [isOpen, user, planId, planName, price, billingCycle, paymentUrl, toast, paymentMethod, isPaid, deviceType]);

  // 轮询支付状态
  useEffect(() => {
    if (!isOpen || !orderId || isPaid) return;
    
    const pollPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/check-payment-status?orderId=${orderId}`);
        const result = await response.json();
        
        // 只有当订单确实已支付时才更新状态
        if (result.paid === true) {
          setIsPaid(true);
          toast({
            title: '支付成功',
            description: '您的支付已完成，订阅即将生效',
          });
        }
        // 对于其他情况（订单不存在、错误等），我们不显示错误，继续轮询
      } catch (error) {
        console.error('检查支付状态时出错:', error);
        // 静默处理错误，继续轮询
      }
    };
    
    // 每5秒检查一次支付状态
    const interval = setInterval(pollPaymentStatus, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isOpen, orderId, isPaid, toast]);

  const getBillingCycleText = () => {
    switch (billingCycle) {
      case 'monthly': return '月付';
      case 'quarterly': return '季付';
      case 'yearly': return '年付';
      default: return '月付';
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handlePaymentMethodChange = (method: 'wechat' | 'alipay') => {
    setPaymentMethod(method);
    // 当支付方式改变时，重新生成支付二维码
    setPaymentUrl(null);
    setIsPaid(false);
    setError(null); // 清除错误状态
  };

  // 重新尝试创建支付订单
  const handleRetry = () => {
    setPaymentUrl(null);
    setIsPaid(false);
    setError(null);
  };

  // 直接跳转到支付页面
  const handleDirectPay = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };

  // 自动跳转到支付页面（适用于移动设备上的特定浏览器）
  const handleAutoRedirect = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>支付订单</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold">{planName}</h3>
              <p className="text-sm text-muted-foreground">{getBillingCycleText()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">¥{price.toFixed(2)}</p>
            </div>
          </div>
          
          {/* 设备类型提示 */}
          {deviceType && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm">
              {deviceType === 'mobile' ? (
                <>
                  <Smartphone className="h-4 w-4 text-blue-500" />
                  <span>检测到您正在使用移动设备</span>
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 text-blue-500" />
                  <span>检测到您正在使用桌面设备</span>
                </>
              )}
            </div>
          )}
          
          {/* 支付方式选择 */}
          <div className="space-y-2">
            <h3 className="font-semibold">选择支付方式</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={paymentMethod === 'wechat' ? 'default' : 'outline'}
                onClick={() => handlePaymentMethodChange('wechat')}
                className="flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">微</span>
                </div>
                微信支付
              </Button>
              <Button
                variant={paymentMethod === 'alipay' ? 'default' : 'outline'}
                onClick={() => handlePaymentMethodChange('alipay')}
                className="flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">支</span>
                </div>
                支付宝
              </Button>
            </div>
          </div>
          
          {isPaid ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">支付成功</h3>
              <p className="text-muted-foreground text-center">
                您的支付已完成，订阅即将生效
              </p>
              <Button className="mt-4" onClick={handleClose}>
                关闭
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="mt-2 text-sm text-muted-foreground">
                正在生成支付信息...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-600">支付创建失败</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {error}
              </p>
              <Button onClick={handleRetry} variant="outline">
                重新尝试
              </Button>
            </div>
          ) : paymentUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCode
                  value={paymentUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="L"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                请使用{paymentMethod === 'wechat' ? '微信' : '支付宝'}扫描二维码完成支付
              </p>
              
              {/* 根据设备类型显示不同的按钮 */}
              {deviceType === 'mobile' ? (
                <div className="w-full space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={handleDirectPay}
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    打开{paymentMethod === 'wechat' ? '微信' : '支付宝'}支付
                  </Button>
                  {(isWeChatBrowser && paymentMethod === 'wechat') || 
                   (isAlipayBrowser && paymentMethod === 'alipay') ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleAutoRedirect}
                    >
                      直接跳转到{paymentMethod === 'wechat' ? '微信' : '支付宝'}支付
                    </Button>
                  ) : null}
                  <p className="text-xs text-muted-foreground text-center">
                    移动设备用户建议在新窗口中完成支付
                  </p>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleDirectPay}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  {paymentMethod === 'wechat' ? '用微信扫二维码支付' : '打开支付宝支付'}
                </Button>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                正在初始化支付...
              </p>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="font-semibold">订单号:</span>
            <span className="font-mono text-xs">{orderId || '生成中...'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}