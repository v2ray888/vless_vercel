'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { getAnnouncements } from '../admin/announcements/actions';
import { getUserDashboardData } from './actions';
import { useEffect, useState } from 'react';
import type { Announcement } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift, ShoppingCart } from 'lucide-react';

// 添加无订阅卡片组件
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

// This component fetches client-side, but the page itself can be RSC
function DashboardContent({
  subscription,
  initialAnnouncements,
}: {
  subscription: Awaited<ReturnType<typeof getUserDashboardData>> | null;
  initialAnnouncements: Announcement[];
}) {
  const { planName, daysRemaining } = subscription || {
    planName: '加载中...',
    daysRemaining: null,
  };

  const renderContent = () => {
    if (!subscription) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between text-sm font-medium">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      );
    }

    // 如果用户没有有效的订阅，显示引导卡片
    if (!subscription.planName || subscription.planName === '无有效订阅') {
      return <NoSubscriptionCard />;
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-lg">{planName}</span>
          <span className="text-sm text-muted-foreground">
            {daysRemaining !== null ? `剩余 ${daysRemaining} 天` : '已过期'}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>已用流量 (仅为示例)</span>
            <span>总流量</span>
          </div>
          <Progress value={33} aria-label="33% of data used" />
          <div className="flex justify-between text-sm font-medium">
            <span>66 GB</span>
            <span>200 GB</span>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button asChild>
            <Link href="/#pricing">续订套餐</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/subscription">订阅详情</Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">仪表板</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>我的订阅</CardTitle>
            <CardDescription>您的当前套餐信息。</CardDescription>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最新公告</CardTitle>
            <CardDescription>系统的重要通知和更新。</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {initialAnnouncements.map((announcement, index) => (
                <li key={announcement.id}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {announcement.content}
                      </p>
                    </div>
                    <time className="text-sm text-muted-foreground shrink-0 pl-4">
                      {announcement.date}
                    </time>
                  </div>
                  {index < initialAnnouncements.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </li>
              ))}
              {initialAnnouncements.length === 0 && (
                <li className="text-center text-muted-foreground py-4">
                  暂无公告
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速访问</CardTitle>
            <CardDescription>常用功能。</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/subscription"
              className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Icons.link className="h-8 w-8 text-primary" />
              <span className="font-semibold text-sm">订阅地址</span>
            </Link>
            <Link
              href="/dashboard/nodes"
              className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Icons.server className="h-8 w-8 text-primary" />
              <span className="font-semibold text-sm">节点信息</span>
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Icons.orders className="h-8 w-8 text-primary" />
              <span className="font-semibold text-sm">订单记录</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Icons.userCog className="h-8 w-8 text-primary" />
              <span className="font-semibold text-sm">个人设置</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Awaited<
    ReturnType<typeof getUserDashboardData>
  > | null>(null);

  useEffect(() => {
    async function fetchData() {
      const fetchedAnnouncements = await getAnnouncements();
      // Add a check to ensure fetchedAnnouncements is an array before calling slice
      if (Array.isArray(fetchedAnnouncements)) {
        setAnnouncements(fetchedAnnouncements.slice(0, 3));
      } else {
        setAnnouncements([]);
      }

      if (user?.id) {
        const fetchedSubscription = await getUserDashboardData(user.id);
        setSubscription(fetchedSubscription);
      }
    }
    fetchData();
  }, [user]);

  return (
    <DashboardContent
      initialAnnouncements={announcements}
      subscription={subscription}
    />
  );
}