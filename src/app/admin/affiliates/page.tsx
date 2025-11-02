'use client';
import React, { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getAffiliatesData,
  getAffiliateStats,
  getAffiliateSettings,
  updateAffiliateSettings,
} from './actions';
import type { Affiliate, AffiliateStats } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

function KPICard({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value: string;
  icon: keyof typeof Icons;
  isLoading: boolean;
}) {
  const KpiIcon = Icons[icon];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {KpiIcon && <KpiIcon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-2/3" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminAffiliatesPage() {
  const { toast } = useToast();
  const [rate, setRate] = useState(20);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, affiliatesData, settingsData] = await Promise.all([
          getAffiliateStats(),
          getAffiliatesData(),
          getAffiliateSettings(),
        ]);
        setStats(statsData);
        setAffiliates(affiliatesData);
        setRate(settingsData.commissionRate);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '加载失败',
          description: '无法获取推广数据。',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);


  const handleSaveSettings = async () => {
    startTransition(async () => {
      try {
        await updateAffiliateSettings({ commissionRate: rate });
        toast({
          title: '设置已保存',
          description: `佣金比例已更新为 ${rate}%。`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '保存失败',
          description:
            error instanceof Error ? error.message : '发生一个未知错误。',
        });
      }
    });
  };

  const kpiData = [
    {
      title: '总推广数',
      value: `${stats?.totalAffiliates ?? 0}`,
      icon: 'users' as const,
    },
    {
      title: '总佣金',
      value: `¥${(stats?.totalCommission ?? 0).toFixed(2)}`,
      icon: 'wallet' as const,
    },
    {
      title: '待支付佣金',
      value: `¥${(stats?.pendingCommission ?? 0).toFixed(2)}`,
      icon: 'landmark' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">推广管理</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>推广排行榜</CardTitle>
              <CardDescription>管理您的推广联盟并跟踪佣金。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>推广人员</TableHead>
                    <TableHead>邀请人数</TableHead>
                    <TableHead className="text-right">佣金总额</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-12" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-20 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isLoading && affiliates?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="h-24 text-center text-muted-foreground"
                      >
                        暂无推广数据
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading &&
                    affiliates?.map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell className="font-medium">
                          {affiliate.name}
                        </TableCell>
                        <TableCell>{affiliate.referralCount} 人</TableCell>
                        <TableCell className="text-right">
                          ¥{affiliate.totalCommission.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>推广设置</CardTitle>
              <CardDescription>配置推广佣金等相关参数。</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSettings();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="commission-rate">佣金比例 (%)</Label>
                  <Input
                    id="commission-rate"
                    type="number"
                    placeholder="例如：20"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    disabled={isSaving || isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    设置新用户通过推广链接完成支付后，推广人员获得的佣金比例。
                  </p>
                </div>
                <Button type="submit" disabled={isSaving || isLoading}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? '保存中...' : '保存设置'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
