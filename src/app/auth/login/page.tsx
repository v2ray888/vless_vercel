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
import { useAuth } from '@/contexts/auth-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // 验证输入
    if (!email || !password) {
      setError('邮箱和密码是必填项');
      return;
    }
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || '登录失败');
    } else {
      // 登录成功，重定向到仪表板
      router.push('/dashboard');
    }
  };

  return (
    <div className="container flex min-h-[calc(100dvh-10rem)] items-center justify-center py-20">
      <Card className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">登录您的账户</CardTitle>
            <CardDescription>欢迎回来！请输入您的凭据以继续。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">密码</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  忘记密码?
                </Link>
              </div>
               <div className="relative">
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required />
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
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full font-headline" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登录
            </Button>
            <div className="text-center text-sm">
              还没有账户?{' '}
              <Link href="/auth/signup" className="underline">
                注册
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}