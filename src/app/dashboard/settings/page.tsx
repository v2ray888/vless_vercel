'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useTransition } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { updateProfile, changePassword } from './actions';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserSettingsPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  
  const [name, setName] = useState(user?.name ?? '');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startProfileTransition(async () => {
      const result = await updateProfile(name);
      toast({
        title: result.success ? '保存成功' : '保存失败',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '新密码和确认密码不匹配。',
      });
      return;
    }
    
    startPasswordTransition(async () => {
        const result = await changePassword(passwords);
        toast({
            title: result.success ? '修改成功' : '修改失败',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
        });
        if (result.success) {
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    });
  };
  
  const isLoading = loading;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">个人设置</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>个人资料</CardTitle>
            <CardDescription>更新您的个人信息。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-sm">
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                ) : (
                <>
                <div className="space-y-2">
                    <Label htmlFor="name">昵称</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isProfilePending} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                    id="email"
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    />
                </div>
                <Button type="submit" disabled={isProfilePending || name === user?.name}>
                    {isProfilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProfilePending ? "保存中..." : "保存更改"}
                </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>为了安全，请定期更换密码。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={isPasswordPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={isPasswordPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={isPasswordPending}
                />
              </div>
              <Button type="submit" disabled={isPasswordPending}>
                 {isPasswordPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {isPasswordPending ? "修改中..." : "修改密码"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}