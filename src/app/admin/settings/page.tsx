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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from './actions';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SettingsState = {
  'site_name': string;
  'site_url': string;
  'site_description': string;
  'site_keywords': string;
  'site_author': string;
  'site_robots': string;
  'og_title': string;
  'og_description': string;
  'og_image': string;
  'og_type': string;
  'twitter_card': string;
  'twitter_site': string;
  'twitter_creator': string;
  'payment_gateway_apikey': string;
  'smtp_host': string;
  'smtp_user': string;
  'smtp_pass': string;
};

const initialSettingsState: SettingsState = {
  'site_name': '',
  'site_url': '',
  'site_description': '',
  'site_keywords': '',
  'site_author': '',
  'site_robots': 'index, follow',
  'og_title': '',
  'og_description': '',
  'og_image': '',
  'og_type': 'website',
  'twitter_card': 'summary',
  'twitter_site': '',
  'twitter_creator': '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof SettingsState, value: string) => {
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
      if (keysToUpdate.includes('site_description')) payload.site_description = settings.site_description;
      if (keysToUpdate.includes('site_keywords')) payload.site_keywords = settings.site_keywords;
      if (keysToUpdate.includes('site_author')) payload.site_author = settings.site_author;
      if (keysToUpdate.includes('site_robots')) payload.site_robots = settings.site_robots;
      if (keysToUpdate.includes('og_title')) payload.og_title = settings.og_title;
      if (keysToUpdate.includes('og_description')) payload.og_description = settings.og_description;
      if (keysToUpdate.includes('og_image')) payload.og_image = settings.og_image;
      if (keysToUpdate.includes('og_type')) payload.og_type = settings.og_type;
      if (keysToUpdate.includes('twitter_card')) payload.twitter_card = settings.twitter_card;
      if (keysToUpdate.includes('twitter_site')) payload.twitter_site = settings.twitter_site;
      if (keysToUpdate.includes('twitter_creator')) payload.twitter_creator = settings.twitter_creator;
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">通用设置</TabsTrigger>
          <TabsTrigger value="seo">SEO设置</TabsTrigger>
          <TabsTrigger value="payment">支付设置</TabsTrigger>
          <TabsTrigger value="email">邮件设置</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <form onSubmit={(e) => handleSubmit(e, ['site_name', 'site_url', 'site_description', 'site_keywords', 'site_author'])}>
              <CardHeader>
                <CardTitle>通用设置</CardTitle>
                <CardDescription>管理系统级配置。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? renderSkeleton(5) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="site_name">网站名称</Label>
                      <Input name="site_name" value={settings.site_name} onChange={handleInputChange} disabled={isSaving}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_url">网站地址</Label>
                      <Input name="site_url" value={settings.site_url} onChange={handleInputChange} disabled={isSaving}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_description">网站描述 (SEO)</Label>
                      <Textarea name="site_description" value={settings.site_description} onChange={handleInputChange} disabled={isSaving} placeholder="网站的简短描述，用于SEO优化" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_keywords">关键字 (SEO)</Label>
                      <Textarea name="site_keywords" value={settings.site_keywords} onChange={handleInputChange} disabled={isSaving} placeholder="关键词用逗号分隔，用于SEO优化" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_author">网站作者</Label>
                      <Input name="site_author" value={settings.site_author} onChange={handleInputChange} disabled={isSaving} placeholder="网站作者或公司名称" />
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
        <TabsContent value="seo">
          <Card>
            <form onSubmit={(e) => handleSubmit(e, ['site_robots', 'og_title', 'og_description', 'og_image', 'og_type', 'twitter_card', 'twitter_site', 'twitter_creator'])}>
              <CardHeader>
                <CardTitle>SEO设置</CardTitle>
                <CardDescription>配置搜索引擎优化相关设置。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? renderSkeleton(8) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="site_robots">Robots标签</Label>
                      <Select name="site_robots" value={settings.site_robots} onValueChange={(value) => handleSelectChange('site_robots', value)} disabled={isSaving}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择Robots设置" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="index, follow">允许索引和跟踪链接</SelectItem>
                          <SelectItem value="noindex, follow">禁止索引但允许跟踪链接</SelectItem>
                          <SelectItem value="index, nofollow">允许索引但禁止跟踪链接</SelectItem>
                          <SelectItem value="noindex, nofollow">禁止索引和跟踪链接</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="og_title">Open Graph标题</Label>
                      <Input name="og_title" value={settings.og_title} onChange={handleInputChange} disabled={isSaving} placeholder="社交媒体分享时显示的标题" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="og_description">Open Graph描述</Label>
                      <Textarea name="og_description" value={settings.og_description} onChange={handleInputChange} disabled={isSaving} placeholder="社交媒体分享时显示的描述" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="og_image">Open Graph图片URL</Label>
                      <Input name="og_image" value={settings.og_image} onChange={handleInputChange} disabled={isSaving} placeholder="社交媒体分享时显示的图片URL" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="og_type">Open Graph类型</Label>
                      <Select name="og_type" value={settings.og_type} onValueChange={(value) => handleSelectChange('og_type', value)} disabled={isSaving}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择内容类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">网站</SelectItem>
                          <SelectItem value="article">文章</SelectItem>
                          <SelectItem value="profile">个人资料</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter_card">Twitter卡片类型</Label>
                      <Select name="twitter_card" value={settings.twitter_card} onValueChange={(value) => handleSelectChange('twitter_card', value)} disabled={isSaving}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择Twitter卡片类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">摘要卡片</SelectItem>
                          <SelectItem value="summary_large_image">大图摘要卡片</SelectItem>
                          <SelectItem value="app">应用卡片</SelectItem>
                          <SelectItem value="player">播放器卡片</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter_site">Twitter站点账号</Label>
                      <Input name="twitter_site" value={settings.twitter_site} onChange={handleInputChange} disabled={isSaving} placeholder="@站点Twitter账号" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter_creator">Twitter创作者账号</Label>
                      <Input name="twitter_creator" value={settings.twitter_creator} onChange={handleInputChange} disabled={isSaving} placeholder="@创作者Twitter账号" />
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