'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const message = searchParams.get('message') || '';
  const order = searchParams.get('order') || '';
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 模拟加载状态
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">正在处理支付结果...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {success ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            )}
          </div>
          <CardTitle>
            {success ? '支付成功' : '支付失败'}
          </CardTitle>
          <CardDescription>
            {message || (success ? '您的支付已完成' : '支付过程中出现问题')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {order && (
            <div className="text-center text-sm text-muted-foreground">
              订单号: {order}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              返回仪表板
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/orders">
              查看订单
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function PaymentResultFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>加载中...</CardTitle>
          <CardDescription>正在加载支付结果</CardDescription>
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

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultFallback />}>
      <PaymentResultContent />
    </Suspense>
  );
}