'use client';
import React, { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from './actions';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type SettingsState = {
  'site_name': string;
  'site_url': string;
  'payment_gateway_apikey': string;
  'smtp_host': string;
  'smtp_user': string;
  'smtp_pass': string;
};

const initialSettingsState: SettingsState = {
  'site_name': '',
  'site_url': '',
  'payment_gateway_apikey': '',
  'smtp_host': '',
  'smtp_user': '',
  'smtp_pass': '',
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsState>(initialSettingsState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      const settingKeys = Object.keys(initialSettingsState) as (keyof SettingsState)[];
      try {
        const fetchedSettings = await getSettings(settingKeys);
        setSettings(prev => ({ ...prev, ...fetchedSettings }));
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '加载失败',
          description: '无法获取系统设置。',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent, category: keyof SettingsState | (keyof SettingsState)[]) => {
    e.preventDefault();
    startTransition(async () => {
      const keysToUpdate = Array.isArray(category) ? category : [category];
      const payload: Partial<SettingsState> = {};
      
      // A bit verbose, but maps form fields to settings keys correctly
      if (keysToUpdate.includes('site_name')) payload.site_name = settings.site_name;
      if (keysToUpdate.includes('site_url')) payload.site_url = settings.site_url;
      if (keysToUpdate.includes('payment_gateway_apikey')) payload.payment_gateway_apikey = settings.payment_gateway_apikey;
      if (keysToUpdate.includes('smtp_host')) payload.smtp_host = settings.smtp_host;
      if (keysToUpdate.includes('smtp_user')) payload.smtp_user = settings.smtp_user;
      if (keysToUpdate.includes('smtp_pass')) payload.smtp_pass = settings.smtp_pass;
      
      const result = await updateSettings(payload);
      toast({
        title: result.success ? '保存成功' : '保存失败',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      // Clear password field after submission attempt for security
      if (payload.smtp_pass) {
        setSettings(prev => ({ ...prev, smtp_pass: '' }));
      }
    });
  };

  const renderSkeleton = (count: number) => (
    Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">系统设置</h1>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">通用设置</TabsTrigger>
          <TabsTrigger value="payment">支付设置</TabsTrigger>
          <TabsTrigger value="email">邮件设置</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <form onSubmit={(e) => handleSubmit(e, ['site_name', 'site_url'])}>
              <CardHeader>
                <CardTitle>通用设置</CardTitle>
                <CardDescription>管理系统级配置。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? renderSkeleton(2) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="site_name">网站名称</Label>
                      <Input name="site_name" value={settings.site_name} onChange={handleInputChange} disabled={isSaving}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_url">网站地址</Label>
                      <Input name="site_url" value={settings.site_url} onChange={handleInputChange} disabled={isSaving}/>
                    </div>
                  </>
                )}
                <Button type="submit" disabled={isSaving || isLoading}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? '保存中...' : '保存更改'}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="payment">
          <Card>
             <form onSubmit={(e) => handleSubmit(e, 'payment_gateway_apikey')}>
              <CardHeader>
                <CardTitle>支付设置</CardTitle>
                <CardDescription>配置支付网关信息。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? renderSkeleton(1) : (
                  <div className="space-y-2">
                    <Label htmlFor="payment_gateway_apikey">支付网关 API Key</Label>
                    <Input name="payment_gateway_apikey" type="password" value={settings.payment_gateway_apikey} onChange={handleInputChange} disabled={isSaving}/>
                  </div>
                )}
                <Button type="submit" disabled={isSaving || isLoading}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? '保存中...' : '保存更改'}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="email">
           <Card>
             <form onSubmit={(e) => handleSubmit(e, ['smtp_host', 'smtp_user', 'smtp_pass'])}>
              <CardHeader>
                <CardTitle>邮件设置</CardTitle>
                <CardDescription>配置SMTP服务器用于发送邮件。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? renderSkeleton(3) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">SMTP 主机</Label>
                      <Input name="smtp_host" placeholder="smtp.example.com" value={settings.smtp_host} onChange={handleInputChange} disabled={isSaving} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_user">SMTP 用户</Label>
                      <Input name="smtp_user" placeholder="user@example.com" value={settings.smtp_user} onChange={handleInputChange} disabled={isSaving} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_pass">SMTP 密码</Label>
                      <Input name="smtp_pass" type="password" placeholder="留空则不修改" value={settings.smtp_pass} onChange={handleInputChange} disabled={isSaving} />
                    </div>
                  </>
                )}
                <Button type="submit" disabled={isSaving || isLoading}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? '保存中...' : '保存更改'}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
