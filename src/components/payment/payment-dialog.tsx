'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierName: string;
  price: string;
  onPaymentSuccess: () => void;
}

export function PaymentDialog({ open, onOpenChange, tierName, price, onPaymentSuccess }: PaymentDialogProps) {
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'alipay' | 'wechat' | 'card'>('alipay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  // 生成模拟的付款二维码
  useEffect(() => {
    if (open) {
      // 重置状态
      setPaymentStatus('pending');
      setIsProcessing(false);
      
      // 生成模拟的付款链接
      const paymentLink = `https://payment.example.com/pay?amount=${price.replace('¥', '')}&item=${encodeURIComponent(tierName)}`;
      
      QRCode.toDataURL(paymentLink, { 
        width: 256, 
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => {
          console.error('生成二维码失败:', err);
          toast({
            title: '生成失败',
            description: '生成付款二维码时发生错误',
            variant: 'destructive'
          });
        });
    }
  }, [open, tierName, price, toast]);

  const handlePayment = () => {
    setIsProcessing(true);
    
    // 模拟支付处理过程
    setTimeout(() => {
      // 随机决定支付成功或失败（90%成功率）
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setPaymentStatus('success');
        toast({
          title: '支付成功',
          description: '您的套餐已成功激活',
        });
        // 延迟关闭对话框并触发成功回调
        setTimeout(() => {
          onPaymentSuccess();
          onOpenChange(false);
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast({
          title: '支付失败',
          description: '支付处理失败，请重试',
          variant: 'destructive'
        });
      }
      
      setIsProcessing(false);
    }, 3000);
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'alipay': return '支付宝';
      case 'wechat': return '微信支付';
      case 'card': return '银行卡';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>购买套餐</DialogTitle>
          <DialogDescription>
            选择支付方式并完成付款以激活 {tierName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{tierName}</h3>
              <p className="text-2xl font-bold text-primary">{price}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">选择支付方式</h4>
            <div className="grid grid-cols-3 gap-2">
              {(['alipay', 'wechat', 'card'] as const).map((method) => (
                <Button
                  key={method}
                  variant={selectedMethod === method ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-1 h-16"
                  onClick={() => setSelectedMethod(method)}
                >
                  <span className="text-xs">{getPaymentMethodName(method)}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {paymentStatus === 'pending' && (
            <div className="space-y-4">
              <h4 className="font-medium">扫描二维码支付</h4>
              <div className="flex justify-center">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="付款二维码" 
                    className="w-48 h-48 p-2 bg-white rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-gray-400">二维码生成中...</div>
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                请使用 {getPaymentMethodName(selectedMethod)} 扫描二维码完成支付
              </p>
              
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={isProcessing || !qrCodeDataUrl}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    支付处理中...
                  </>
                ) : (
                  '我已完成支付'
                )}
              </Button>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-semibold">支付成功！</h3>
              <p className="text-center text-muted-foreground">
                您的 {tierName} 套餐已成功激活
              </p>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <h3 className="text-xl font-semibold">支付失败</h3>
              <p className="text-center text-muted-foreground">
                支付处理失败，请重试
              </p>
              <Button onClick={() => setPaymentStatus('pending')} className="w-full">
                重新支付
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}