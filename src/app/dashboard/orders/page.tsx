'use client';

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
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getUserOrders } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (user?.id) {
        try {
          const userOrders = await getUserOrders(user.id);
          setOrders(userOrders);
        } catch (error) {
          console.error('获取订单信息失败:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchOrders();
  }, [user?.id]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">订单记录</h1>
      <Card>
        <CardHeader>
          <CardTitle>您的订单</CardTitle>
          <CardDescription>您所有的历史订单记录。</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单ID</TableHead>
                  <TableHead>套餐</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.plan_name}</TableCell>
                      <TableCell>¥{order.amount}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status === 'completed' ? '已完成' : (order.status === 'pending' ? '待处理' : '失败')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">暂无订单记录</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}