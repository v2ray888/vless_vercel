'use client';
import React, { useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Withdrawal } from '@/lib/types';
import { updateWithdrawalStatus } from './actions';
import { Loader2 } from 'lucide-react';

const statusText = {
  pending: '待处理',
  completed: '已完成',
  rejected: '已拒绝',
};

const statusVariant = {
  pending: 'secondary',
  completed: 'default',
  rejected: 'destructive',
} as const;

type WithdrawalsTableProps = {
  initialWithdrawals: Withdrawal[];
};

export function WithdrawalsTable({ initialWithdrawals }: WithdrawalsTableProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (
    id: string,
    newStatus: 'completed' | 'rejected'
  ) => {
    startTransition(async () => {
      try {
        await updateWithdrawalStatus(id, newStatus);
        toast({
          title: '操作成功',
          description: `提现请求已${
            newStatus === 'completed' ? '批准' : '拒绝'
          }。`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '操作失败',
          description: '更新提现状态时发生错误。',
        });
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>用户</TableHead>
          <TableHead>金额</TableHead>
          <TableHead>日期</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {initialWithdrawals.length > 0 ? (
          initialWithdrawals.map((w) => (
            <TableRow key={w.id}>
              <TableCell className="font-medium">{w.userName}</TableCell>
              <TableCell>¥{w.amount.toFixed(2)}</TableCell>
              <TableCell>{w.date}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    statusVariant[w.status as keyof typeof statusVariant]
                  }
                >
                  {statusText[w.status as keyof typeof statusText]}
                </Badge>
              </TableCell>
              <TableCell>
                {w.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(w.id, 'completed')}
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '批准'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" disabled={isPending}>
                          拒绝
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确定要拒绝吗？</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作将把提现请求标记为“已拒绝”。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStatusChange(w.id, 'rejected')}
                          >
                            确认拒绝
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-24 text-center text-muted-foreground"
            >
              暂无提现请求
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
