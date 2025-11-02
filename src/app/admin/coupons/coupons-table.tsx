'use client';
import React, { useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Coupon } from '@/lib/types';
import { createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } from './actions';
import { CouponForm } from './coupon-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type CouponsTableProps = {
  initialCoupons: Coupon[];
};

export function CouponsTable({ initialCoupons }: CouponsTableProps) {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFormSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        if (editingCoupon) {
          await updateCoupon(editingCoupon.id, formData);
          toast({ title: '更新成功', description: `优惠码 ${formData.get('code')} 已更新。` });
          setEditingCoupon(null);
        } else {
          await createCoupon(formData);
          toast({ title: '创建成功', description: `优惠码 ${formData.get('code')} 已创建。` });
          setIsNewDialogOpen(false);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '操作失败',
          description: error instanceof Error ? error.message : '发生未知错误。',
        });
      }
    });
  };
  
  const handleToggleStatus = (id: string, status: 'active' | 'expired') => {
    startTransition(async () => {
      try {
        await toggleCouponStatus(id, status);
        toast({ title: '状态已更新' });
      } catch(error) {
        toast({
            variant: 'destructive',
            title: '操作失败',
            description: '更新状态时发生错误。',
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteCoupon(id);
        toast({ title: '删除成功', variant: 'destructive' });
      } catch (error) {
         toast({
            variant: 'destructive',
            title: '删除失败',
            description: '删除优惠码时发生错误。',
        });
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新建优惠码
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建优惠码</DialogTitle>
              <DialogDescription>创建一个新的优惠码。</DialogDescription>
            </DialogHeader>
            <CouponForm onSubmit={handleFormSubmit} isPending={isPending} />
          </DialogContent>
        </Dialog>
      </div>

       <Table>
        <TableHeader>
          <TableRow>
            <TableHead>优惠码</TableHead>
            <TableHead>折扣</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>使用情况</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialCoupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-medium">{coupon.code}</TableCell>
              <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `¥${coupon.value}`}</TableCell>
              <TableCell>
                <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                  {coupon.status === 'active' ? '有效' : '已失效'}
                </Badge>
              </TableCell>
              <TableCell>{coupon.usageCount}/{coupon.usageLimit}</TableCell>
               <TableCell>
                 <Dialog open={!!editingCoupon && editingCoupon.id === coupon.id} onOpenChange={(open) => !open && setEditingCoupon(null)}>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setEditingCoupon(coupon)}>编辑</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(coupon.id, coupon.status)}>
                        {coupon.status === 'active' ? '禁用' : '启用'}
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">删除</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                              <AlertDialogDescription>
                                这个操作无法撤销。此操作将永久删除该优惠码。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(coupon.id)} disabled={isPending}>
                                {isPending ? '删除中...' : '继续删除'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                    </DropdownMenu>
                     <DialogContent>
                        <DialogHeader>
                          <DialogTitle>编辑优惠码</DialogTitle>
                          <DialogDescription>修改优惠码的详细信息。</DialogDescription>
                        </DialogHeader>
                        <CouponForm coupon={editingCoupon} onSubmit={handleFormSubmit} isPending={isPending} />
                    </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
