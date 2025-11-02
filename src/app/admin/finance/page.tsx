'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import {
  getFinanceStats,
  getMonthlyRevenueChartData,
  getRecentTransactions,
} from './actions';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type FinanceStats = Awaited<ReturnType<typeof getFinanceStats>>;
type ChartData = Awaited<ReturnType<typeof getMonthlyRevenueChartData>>;
type RecentTransaction = Awaited<
  ReturnType<typeof getRecentTransactions>
>[number];

export default function AdminFinancePage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [chartData, setChartData] = useState<ChartData>([]);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [statsData, chartData, transactionsData] = await Promise.all([
        getFinanceStats(),
        getMonthlyRevenueChartData(),
        getRecentTransactions(),
      ]);
      setStats(statsData);
      setChartData(chartData);
      setTransactions(transactionsData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const financeData = [
    {
      title: '总收入',
      value: `¥${stats?.totalRevenue.toFixed(2) ?? '0.00'}`,
      icon: 'wallet' as const,
      description: '所有成功订单的总金额',
    },
    {
      title: '本月收入',
      value: `¥${stats?.monthlyRevenue.toFixed(2) ?? '0.00'}`,
      icon: 'wallet' as const,
      description: '当前自然月的收入',
    },
    {
      title: '待提现佣金',
      value: `¥${stats?.pendingCommission.toFixed(2) ?? '0.00'}`,
      icon: 'landmark' as const,
      description: '推广人员的待处理佣金',
    },
    {
      title: '净利润 (估算)',
      value: `¥${stats?.netProfit.toFixed(2) ?? '0.00'}`,
      icon: 'gauge' as const,
      description: '总收入减去总佣金',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">财务管理</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financeData.map((item) => {
          const ItemIcon = Icons[item.icon];
          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <ItemIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>收入概览</CardTitle>
            <CardDescription>过去12个月的收入趋势</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
               <div className="w-full h-[350px] flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
               </div>
            ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `¥${value}`}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>最近交易</CardTitle>
            <CardDescription>最近的收入和支出记录。</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>关联ID</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={4}><Skeleton className="h-5 w-full" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium font-mono text-xs">
                      {transaction.referenceId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === '收入'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        {transaction.date}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.type === '收入' ? '+' : '-'}¥{Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                 {!isLoading && transactions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">暂无交易记录</TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
