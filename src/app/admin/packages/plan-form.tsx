'use client';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Plan, ServerGroup } from '@/lib/types';
import { useTransition } from 'react';

type PlanFormProps = {
  plan?: Plan | null;
  serverGroups: Pick<ServerGroup, 'id' | 'name'>[];
  onSubmit: (formData: FormData, planId?: string) => void;
  isPending: boolean;
};

export const PlanForm = ({ plan, serverGroups, onSubmit, isPending }: PlanFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData, plan?.id);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">名称</Label>
          <Input id="name" name="name" defaultValue={plan?.name} placeholder="例如：季度套餐" className="col-span-3" required disabled={isPending} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price_monthly" className="text-right">月付价格</Label>
          <Input id="price_monthly" name="price_monthly" defaultValue={plan?.price_monthly || ""} type="number" placeholder="¥" className="col-span-3" disabled={isPending} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price_quarterly" className="text-right">季付价格</Label>
          <Input id="price_quarterly" name="price_quarterly" defaultValue={plan?.price_quarterly || ""} type="number" placeholder="¥" className="col-span-3" disabled={isPending} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price_yearly" className="text-right">年付价格</Label>
          <Input id="price_yearly" name="price_yearly" defaultValue={plan?.price_yearly || ""} type="number" placeholder="¥" className="col-span-3" disabled={isPending} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="serverGroupId" className="text-right">服务器组</Label>
          <Select name="serverGroupId" defaultValue={serverGroups.find(sg => sg.name === plan?.server_group)?.id} required disabled={isPending}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="选择服务器组" />
            </SelectTrigger>
            <SelectContent>
              {serverGroups.map(group => (
                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
            {isPending ? '保存中...' : (plan ? '保存更改' : '创建套餐')}
        </Button>
      </DialogFooter>
    </form>
  );
};
