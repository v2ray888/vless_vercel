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
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { signup } from '@/app/auth/actions';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Suspense } from 'react';

function SignupButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full font-headline" type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      创建账户
    </Button>
  );
}

function SignupFormContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const [state, formAction] = useActionState(signup, { message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: '注册成功',
        description: '您的账户已创建，请登录。',
      });
      router.push('/auth/login');
    }
  }, [state, router, toast]);

  return (
    <form action={formAction}>
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">创建新账户</CardTitle>
        <CardDescription>只需几步，即可开始您的体验。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {state.message && state.message !== 'success' && (
           <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-2">
          <Label htmlFor="name">昵称</Label>
          <Input id="name" name="name" placeholder="您的昵称" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">密码</Label>
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? 'text' : 'password'} 
              required 
              aria-describedby="password-hint"
            />
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showPassword ? '隐藏密码' : '显示密码'}</span>
            </Button>
          </div>
          <p id="password-hint" className="text-sm text-muted-foreground">密码至少需要6位字符。</p>
        </div>
         <div className="grid gap-2">
          <Label htmlFor="confirmPassword">确认密码</Label>
           <div className="relative">
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type={showConfirmPassword ? 'text' : 'password'} 
              required 
            />
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
              onClick={() => setShowConfirmPassword(prev => !prev)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
               <span className="sr-only">{showConfirmPassword ? '隐藏密码' : '显示密码'}</span>
            </Button>
          </div>
        </div>
        {refCode && <input type="hidden" name="ref" value={refCode} />}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <SignupButton />
        <div className="text-center text-sm">
          已经有账户了?{' '}
          <Link href="/auth/login" className="underline">
            登录
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}

export default function SignupPage() {
  return (
    <div className="container flex min-h-[calc(100dvh-10rem)] items-center justify-center py-20">
      <Card className="w-full max-w-md mx-auto">
        <Suspense fallback={<div>加载中...</div>}>
          <SignupFormContent />
        </Suspense>
      </Card>
    </div>
  );
}