'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useTransition } from 'react';
import { redeemCode } from './actions';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import AuthLayout from '../auth/layout';
import { MainNav } from '@/components/shared/main-nav';
import { Footer } from '@/components/shared/footer';

export default function RedeemPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [code, setCode] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleRedeem = () => {
    if (!isAuthenticated) {
        toast({
            variant: 'destructive',
            title: '请先登录',
            description: '您需要登录才能兑换套餐。',
        });
        router.push('/auth/login');
        return;
    }

    if (!code.trim()) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '请输入有效的兑换码。',
      });
      return;
    }
    
    if (!user?.id) {
        toast({ variant: 'destructive', title: '错误', description: '无法获取用户信息，请重新登录。' });
        return;
    }

    startTransition(async () => {
      const result = await redeemCode(code, user.id);

      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? '兑换成功' : '兑换失败',
        description: result.message,
      });

      if (result.success) {
        setCode('');
        router.push('/dashboard'); // Redirect to dashboard on success
      }
    });
  };
  
  if (loading) {
    return (
       <div className="container flex min-h-dvh items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
       </div>
    )
  }

  // Since this page is accessible to non-logged-in users, we wrap it in a marketing-style layout
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <MainNav />
      <main className="flex-1">
        <div className="container flex min-h-[calc(100dvh-10rem)] items-center justify-center py-20">
          <Card className="w-full max-w-md mx-auto">
              <CardHeader>
              <CardTitle className="font-headline text-2xl">兑换订阅</CardTitle>
              <CardDescription>
                  请输入您的兑换码以激活或续订您的套餐。
              </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="code">兑换码</Label>
                  <Input
                      id="code"
                      placeholder="请输入您的兑换码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isPending}
                  />
                  </div>
              </div>
              </CardContent>
              <CardFooter>
              <Button className="w-full font-headline" onClick={handleRedeem} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? '正在兑换...' : '立即兑换'}
              </Button>
              </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}