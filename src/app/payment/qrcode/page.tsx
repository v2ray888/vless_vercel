'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'react-qr-code';

function PaymentQRCodeContent() {
  const searchParams = useSearchParams();
  const qrCodeUrl = searchParams.get('url') || '';
  const orderId = searchParams.get('orderId') || '';
  
  const [isCopied, setIsCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCodeUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  if (!qrCodeUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>支付信息缺失</CardTitle>
            <CardDescription>无法生成支付二维码</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard">
                返回仪表板
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>扫码支付</CardTitle>
          <CardDescription>请使用手机扫描下方二维码完成支付</CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-lg">
            <QRCode value={qrCodeUrl} size={200} />
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            订单号: {orderId}
          </div>
          
          <div className="w-full">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={qrCodeUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              如果无法扫码，可以复制链接到手机浏览器打开
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              返回仪表板
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function PaymentQRCodeFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>加载中...</CardTitle>
          <CardDescription>正在加载支付信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentQRCodePage() {
  return (
    <Suspense fallback={<PaymentQRCodeFallback />}>
      <PaymentQRCodeContent />
    </Suspense>
  );
}