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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Plan, ServerGroup } from '@/lib/types';
import { PlanForm } from './plan-form';
import { createPlan, updatePlan, deletePlan, togglePlanStatus } from './actions';


type PackagesTableProps = {
  plans: Plan[];
  serverGroups: Pick<ServerGroup, 'id' | 'name'>[];
};

export function PackagesTable({ plans: initialPlans, serverGroups }: PackagesTableProps) {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFormSubmit = async (formData: FormData, planId?: string) => {
    startTransition(async () => {
        try {
            if (planId) {
                await updatePlan(planId, formData);
                toast({ title: '更新成功', description: '套餐已更新。' });
                setEditingPlan(null);
            } else {
                await createPlan(formData);
                toast({ title: '创建成功', description: '新套餐已创建。' });
                setIsNewDialogOpen(false);
            }
        } catch (error) {
            toast({ 
                variant: 'destructive', 
                title: '操作失败', 
                description: error instanceof Error ? error.message : '发生未知错误。' 
            });
        }
    });
  };

  const handleDelete = async (id: string) => {
     startTransition(async () => {
        try {
            await deletePlan(id);
            toast({ variant: 'destructive', title: '删除成功', description: '套餐已被删除。' });
        } catch (error) {
            toast({ variant: 'destructive', title: '删除失败', description: '该套餐可能正在被用户使用。' });
        }
    });
  };

  const handleToggleStatus = (id: string, status: 'active' | 'inactive') => {
    startTransition(async () => {
        try {
            await togglePlanStatus(id, status);
            toast({ title: '状态更新成功' });
        } catch (error) {
            toast({ variant: 'destructive', title: '操作失败', description: '更新套餐状态时出错。' });
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
              新建套餐
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建套餐</DialogTitle>
              <DialogDescription>创建一个新的订阅套餐。</DialogDescription>
            </DialogHeader>
            <PlanForm serverGroups={serverGroups} onSubmit={handleFormSubmit} isPending={isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>套餐名称</TableHead>
            <TableHead>价格 (月/季/年)</TableHead>
            <TableHead>服务器组</TableHead>
            <TableHead>状态</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialPlans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>
                {plan.price_monthly ? `¥${plan.price_monthly}/月 ` : ''}
                {plan.price_quarterly ? `¥${plan.price_quarterly}/季 ` : ''}
                {plan.price_yearly ? `¥${plan.price_yearly}/年` : ''}
              </TableCell>
              <TableCell>{plan.server_group}</TableCell>
              <TableCell>
                <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                  {plan.status === 'active' ? '启用' : '禁用'}
                </Badge>
              </TableCell>
              <TableCell>
                <Dialog open={!!editingPlan && editingPlan.id === plan.id} onOpenChange={(open) => !open && setEditingPlan(null)}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setEditingPlan(plan)}>编辑</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(plan.id, plan.status)}>
                        {plan.status === 'active' ? '禁用' : '启用'}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>删除</DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                            <AlertDialogDescription>这个操作无法撤销。此操作将永久删除该套餐。</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(plan.id)} disabled={isPending}>
                               {isPending ? '删除中...' : '继续删除'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                   <DialogContent>
                        <DialogHeader>
                        <DialogTitle>编辑套餐</DialogTitle>
                        <DialogDescription>修改套餐的详细信息。</DialogDescription>
                        </DialogHeader>
                        <PlanForm 
                            plan={editingPlan} 
                            serverGroups={serverGroups} 
                            onSubmit={(formData) => handleFormSubmit(formData, editingPlan?.id)}
                            isPending={isPending}
                        />
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
