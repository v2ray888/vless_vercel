'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Download, Gift, ShoppingCart, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect, useState, useTransition } from "react";
import { getTutorials } from "@/app/admin/tutorials/actions";
import { getSubscriptionInfo, resetSubscriptionUrl } from "./actions";
import type { Tutorial } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function NoSubscriptionCard() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 bg-muted/50 p-8 rounded-lg">
      <Gift className="w-12 h-12 text-primary" />
      <h3 className="text-xl font-semibold font-headline">您还没有有效的订阅</h3>
      <p className="text-muted-foreground">
        请先购买套餐或使用兑换码来激活您的订阅。
      </p>
      <div className="flex gap-4 mt-2">
        <Button asChild>
          <Link href="/#pricing">
            <ShoppingCart className="mr-2 h-4 w-4" />
            选择套餐
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/redeem">
            <Gift className="mr-2 h-4 w-4" />
            使用兑换码
          </Link>
        </Button>
      </div>
    </div>
  )
}

// 添加UUID验证失败的组件
function UuidValidationFailedCard({ token }: { token: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 bg-destructive/10 p-8 rounded-lg border border-destructive/30">
      <AlertCircle className="w-12 h-12 text-destructive" />
      <h3 className="text-xl font-semibold font-headline">UUID验证失败</h3>
      <p className="text-muted-foreground">
        订阅的UUID未在V2Ray面板中找到或已被禁用。
      </p>
      <Button asChild>
        <Link href={`/dashboard/subscription/add-uuid?token=${token}`}>
          <AlertCircle className="mr-2 h-4 w-4" />
          添加UUID到V2Ray面板
        </Link>
      </Button>
    </div>
  )
}

export default function SubscriptionPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [subscriptionUrl, setSubscriptionUrl] = useState<string | null>(null);
  const [hasCheckedSub, setHasCheckedSub] = useState(false);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [uuidValidationError, setUuidValidationError] = useState(false);
  const [subscriptionToken, setSubscriptionToken] = useState<string | null>(null);
  const clashImportUrl = subscriptionUrl ? `${subscriptionUrl}&format=clash` : '#';

  // 为不同客户端生成导入URL
  const getClientImportUrl = (client: string) => {
    if (!subscriptionUrl) return '#';
    switch (client) {
      case 'clash':
        return `${subscriptionUrl}&format=clash`;
      case 'surfboard':
        return `${subscriptionUrl}&format=surfboard`;
      case 'shadowrocket':
        return `shadowrocket://add/sub://${btoa(subscriptionUrl)}?remarks=${encodeURIComponent('我的订阅')}`;
      default:
        return subscriptionUrl;
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (user?.id) {
        setHasCheckedSub(false);
        setUuidValidationError(false);
        const [fetchedTutorials, subInfo] = await Promise.all([
          getTutorials(),
          getSubscriptionInfo(user.id)
        ]);
        setTutorials(fetchedTutorials);
        if (subInfo.success && subInfo.url) {
          setSubscriptionUrl(subInfo.url);
          // 从URL中提取token
          const url = new URL(subInfo.url);
          const token = url.searchParams.get('token');
          setSubscriptionToken(token);
        }
        setHasCheckedSub(true);
      }
    }
    fetchData();
  }, [user]);

  const copyToClipboard = () => {
    if (!subscriptionUrl) return;
    navigator.clipboard.writeText(subscriptionUrl);
    toast({
      title: "已复制",
      description: "订阅地址已成功复制到剪贴板。",
    });
  };

  const handleResetUrl = () => {
    startTransition(async () => {
      if (!user?.id) return;
      const result = await resetSubscriptionUrl(user.id);
      if (result.success && result.newUrl) {
        setSubscriptionUrl(result.newUrl);
        // 从新URL中提取token
        const url = new URL(result.newUrl);
        const token = url.searchParams.get('token');
        setSubscriptionToken(token);
        toast({
          title: "操作成功",
          description: "订阅地址已重置，请在客户端更新订阅。",
        });
      } else {
        toast({
          variant: 'destructive',
          title: "操作失败",
          description: result.message || "无法重置订阅地址。",
        });
      }
    });
  }

  // 添加处理UUID验证的函数
  const handleAddUuid = async () => {
    if (!subscriptionToken) {
      toast({
        variant: 'destructive',
        title: "错误",
        description: "未找到订阅令牌",
      });
      return;
    }

    try {
      const response = await fetch('/api/add-uuid-to-v2ray', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: subscriptionToken }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "成功",
          description: "UUID已成功添加到V2Ray面板，请重新尝试获取订阅。",
        });
        setUuidValidationError(false);
        // 重新检查订阅信息
        if (user?.id) {
          const subInfo = await getSubscriptionInfo(user.id);
          if (subInfo.success && subInfo.url) {
            setSubscriptionUrl(subInfo.url);
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: "失败",
          description: result.error || result.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "错误",
        description: "请求失败",
      });
    }
  };

  const handleClientImport = async (client: string) => {
    const importUrl = getClientImportUrl(client);
    if (!importUrl || importUrl === '#') return;

    try {
      switch (client) {
        case 'clash':
          // 使用Clash的URL Scheme协议来直接唤醒Clash客户端
          const encodedUrl = encodeURIComponent(importUrl);
          const clashSchemeUrl = `clash://install-config?url=${encodedUrl}&name=我的Clash配置`;
          window.location.href = clashSchemeUrl;
          
          // 检测是否唤起成功
          const startTime = Date.now();
          setTimeout(() => {
            if (Date.now() - startTime < 1500) {
              // 如果页面仍在（未跳走/未唤起成功），提示用户
              const link = document.createElement('a');
              link.href = importUrl;
              link.download = 'clash-config.yaml';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }, 1000);
          break;
          
        case 'shadowrocket':
          // Shadowrocket使用自定义URL Scheme
          window.location.href = importUrl;
          break;
          
        default:
          // 对于其他客户端，直接复制链接
          navigator.clipboard.writeText(subscriptionUrl || '');
          toast({
            title: "已复制",
            description: "订阅地址已成功复制到剪贴板。",
          });
          break;
      }
    } catch (error) {
      console.error(`Error importing to ${client}:`, error);
      // 回退到复制链接
      navigator.clipboard.writeText(subscriptionUrl || '');
      toast({
        title: "已复制",
        description: "订阅地址已成功复制到剪贴板。",
      });
    }
  };

  const isLoading = loading || !hasCheckedSub;

  const renderSubscriptionContent = () => {
    if (isLoading) {
      return (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold">订阅地址</h3>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 bg-white p-4 rounded-lg self-center">
            <h3 className="font-semibold">订阅二维码</h3>
            <Skeleton className="h-40 w-40" />
          </div>
        </div>
      )
    }

    if (!subscriptionUrl) {
      return <NoSubscriptionCard />;
    }

    // 如果之前有UUID验证错误，显示特殊卡片
    if (uuidValidationError) {
      return <UuidValidationFailedCard token={subscriptionToken || ''} />;
    }

    return (
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold">订阅地址</h3>
            <div className="flex w-full items-center space-x-2">
              <Input type="text" readOnly value={subscriptionUrl} className="font-mono" />
              <Button type="button" size="icon" variant="outline" onClick={copyToClipboard} disabled={!subscriptionUrl}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              注意：请勿与他人分享您的订阅地址，这可能会导致您的账户被盗用。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleResetUrl} disabled={isPending}>
              {isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              更新订阅地址
            </Button>
            <Button onClick={() => handleClientImport('clash')} variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              一键导入 Clash
            </Button>
            {/* 添加处理UUID验证失败的按钮 */}
            <Button onClick={handleAddUuid} variant="destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              UUID验证失败？点击修复
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 bg-white p-4 rounded-lg self-center">
          <h3 className="font-semibold">订阅二维码</h3>
          <QRCode
            value={subscriptionUrl}
            size={160}
            bgColor="#ffffff"
            fgColor="#000000"
            level="L"
          />
          <p className="text-sm text-muted-foreground">使用兼容的客户端扫描</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">订阅管理</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>我的订阅</CardTitle>
          <CardDescription>管理您的专属订阅信息，轻松同步至各类客户端。</CardDescription>
        </CardHeader>
        <CardContent>
          {renderSubscriptionContent()}
        </CardContent>
      </Card>

      {/* 添加客户端支持说明卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>客户端支持</CardTitle>
          <CardDescription>支持多种主流客户端，一键导入配置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-blue-600 mb-2">Clash</div>
              <p className="text-sm text-muted-foreground text-center mb-3">支持Clash for Windows/macOS</p>
              <Button 
                onClick={() => handleClientImport('clash')} 
                variant="secondary" 
                className="w-full bg-blue-50 hover:bg-blue-100"
                disabled={!subscriptionUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                一键导入
              </Button>
            </div>
            
            <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-purple-600 mb-2">Shadowrocket</div>
              <p className="text-sm text-muted-foreground text-center mb-3">支持iOS设备</p>
              <Button 
                onClick={() => handleClientImport('shadowrocket')} 
                variant="secondary" 
                className="w-full bg-purple-50 hover:bg-purple-100"
                disabled={!subscriptionUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                一键导入
              </Button>
            </div>
            
            <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-green-600 mb-2">Surfboard</div>
              <p className="text-sm text-muted-foreground text-center mb-3">支持Android设备</p>
              <Button 
                onClick={() => handleClientImport('surfboard')} 
                variant="secondary" 
                className="w-full bg-green-50 hover:bg-green-100"
                disabled={!subscriptionUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                一键导入
              </Button>
            </div>
            
            <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-orange-600 mb-2">其他客户端</div>
              <p className="text-sm text-muted-foreground text-center mb-3">V2RayN, Qv2ray等</p>
              <Button 
                onClick={() => handleClientImport('other')} 
                variant="secondary" 
                className="w-full bg-orange-50 hover:bg-orange-100"
                disabled={!subscriptionUrl}
              >
                <Copy className="mr-2 h-4 w-4" />
                复制链接
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">使用说明</h3>
            <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
              <li>Clash客户端：点击"一键导入"可直接唤醒Clash并导入配置</li>
              <li>Shadowrocket：点击"一键导入"可直接在iOS设备上添加订阅</li>
              <li>Surfboard：点击"一键导入"可直接在Android设备上添加订阅</li>
              <li>其他客户端：点击"复制链接"后粘贴到客户端订阅设置中</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>客户端使用教程</CardTitle>
          <CardDescription>常用客户端的订阅配置教程。</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {tutorials.length === 0 && !isLoading ? (
              <p className="text-muted-foreground text-sm">暂无教程。</p>
            ) : (
              tutorials.map((tutorial) => (
                <AccordionItem value={`item-${tutorial.id}`} key={tutorial.id}>
                  <AccordionTrigger>{tutorial.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm text-foreground whitespace-pre-wrap">
                      {tutorial.content}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}