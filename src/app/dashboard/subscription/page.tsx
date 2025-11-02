'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Download, Gift, ShoppingCart } from "lucide-react";
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


export default function SubscriptionPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [subscriptionUrl, setSubscriptionUrl] = useState<string | null>(null);
  const [hasCheckedSub, setHasCheckedSub] = useState(false);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const clashImportUrl = subscriptionUrl ? `clash://install-config?url=${encodeURIComponent(subscriptionUrl)}` : '#';

  useEffect(() => {
    async function fetchData() {
        if (user?.id) {
            setHasCheckedSub(false);
            const [fetchedTutorials, subInfo] = await Promise.all([
                getTutorials(),
                getSubscriptionInfo()
            ]);
            setTutorials(fetchedTutorials);
            if (subInfo.success && subInfo.url) {
                setSubscriptionUrl(subInfo.url);
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
        const result = await resetSubscriptionUrl();
        if (result.success && result.newUrl) {
            setSubscriptionUrl(result.newUrl);
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
                    <Button asChild variant="secondary">
                        <a href={clashImportUrl}>
                            <Download className="mr-2 h-4 w-4" />
                            一键导入 Clash
                        </a>
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