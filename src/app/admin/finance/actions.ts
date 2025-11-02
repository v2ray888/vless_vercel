'use server';

import { getDb } from '@/db';
import { affiliates, orders, withdrawals } from '@/db/schema';
import { sql, desc, and, gte } from 'drizzle-orm';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function getFinanceStats() {
  const db = getDb();
  // 总收入
  const totalRevenueResult = await db
    .select({
      total: sql<number>`sum(${orders.amount})`.mapWith(Number),
    })
    .from(orders)
    .where(sql`${orders.status} = 'completed'`);

  // 本月收入
  const startOfCurrentMonth = startOfMonth(new Date());
  const monthlyRevenueResult = await db
    .select({
      total: sql<number>`sum(${orders.amount})`.mapWith(Number),
    })
    .from(orders)
    .where(
      and(
        sql`${orders.status} = 'completed'`,
        gte(orders.date, startOfCurrentMonth)
      )
    );

  // 待提现佣金 & 总佣金
  const commissionResult = await db
    .select({
      pending: sql<number>`sum(${affiliates.pendingCommission})`.mapWith(Number),
      total: sql<number>`sum(${affiliates.totalCommission})`.mapWith(Number),
    })
    .from(affiliates);

  const totalRevenue = totalRevenueResult[0].total ?? 0;
  const totalCommission = commissionResult[0].total ?? 0;
  const netProfit = totalRevenue - totalCommission;

  return {
    totalRevenue,
    monthlyRevenue: monthlyRevenueResult[0].total ?? 0,
    pendingCommission: commissionResult[0].pending ?? 0,
    netProfit,
  };
}

export async function getMonthlyRevenueChartData() {
  const db = getDb();
  const last12Months: { name: string; total: number }[] = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = subMonths(today, i);
    last12Months.push({
      name: format(date, 'M月'),
      total: 0,
    });
  }

  const startDate = subMonths(startOfMonth(today), 11);
  const revenueData = await db
    .select({
      month: sql<string>`to_char(${orders.date}, 'YYYY-MM')`,
      total: sql<number>`sum(${orders.amount})`.mapWith(Number),
    })
    .from(orders)
    .where(
      and(
        sql`${orders.status} = 'completed'`,
        gte(orders.date, startDate)
      )
    )
    .groupBy(sql`1`);

  const revenueMap = new Map(revenueData.map(r => [r.month, r.total]));

  const chartData = last12Months.map(monthData => {
    const date = subMonths(today, 11 - last12Months.indexOf(monthData));
    const monthKey = format(date, 'yyyy-MM');
    return {
      ...monthData,
      total: revenueMap.get(monthKey) ?? 0,
    };
  });
  
  // Format month name to be "X月"
  return chartData.map(d => ({
      name: format(subMonths(today, 11 - chartData.indexOf(d)), "M'月'"),
      total: d.total
  }));
}


export async function getRecentTransactions() {
  const db = getDb();
  const recentOrders = await db.query.orders.findMany({
    where: sql`${orders.status} = 'completed'`,
    limit: 5,
    orderBy: [desc(orders.date)],
  });

  const recentWithdrawals = await db.query.withdrawals.findMany({
    limit: 5,
    orderBy: [desc(withdrawals.date)],
  });

  const incomeTransactions = recentOrders.map(o => ({
    id: o.id,
    type: '收入' as const,
    amount: o.amount,
    date: o.date,
    referenceId: o.id,
  }));

  const expenseTransactions = recentWithdrawals.map(w => ({
    id: w.id,
    type: '支出' as const,
    amount: -w.amount, //支出为负数
    date: w.date,
    referenceId: w.id,
  }));

  const allTransactions = [...incomeTransactions, ...expenseTransactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)
    .map(t => ({...t, date: t.date.toISOString().split('T')[0]}));

  return allTransactions;
}
