'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import type { User, Plan } from '@/lib/types';
import { useTransition } from 'react';

type UserFormProps = {
  user?: User | null;
  plans: Pick<Plan, 'id' | 'name'>[];
  onFormSubmit: (formData: FormData) => void;
  isPending: boolean;
};

export const UserForm = ({
  user,
  plans,
  onFormSubmit,
  isPending,
}: UserFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onFormSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            昵称
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={user?.name}
            className="col-span-3"
            required
            disabled={isPending}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            邮箱
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email}
            className="col-span-3"
            required
            disabled={isPending}
          />
        </div>
        {!user && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              密码
            </Label>
            <Input id="password" name="password" type="password" className="col-span-3" required disabled={isPending} />
          </div>
        )}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="planId" className="text-right">
            订阅套餐
          </Label>
          <Select name="planId" defaultValue={plans.find(p => p.name === user?.plan?.name)?.id} required disabled={isPending}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="选择套餐" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? (user ? '保存中...' : '创建中...') : (user ? '保存更改' : '创建用户')}
        </Button>
      </DialogFooter>
    </form>
  );
};
