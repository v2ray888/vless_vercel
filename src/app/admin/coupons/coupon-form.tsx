'use client';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Coupon } from '@/lib/types';

type CouponFormProps = {
  coupon?: Coupon | null;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
};

export const CouponForm = ({ coupon, onSubmit, isPending }: CouponFormProps) => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="code" className="text-right">优惠码</Label>
          <Input id="code" name="code" defaultValue={coupon?.code} placeholder="例如：SPRING25" className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">类型</Label>
            <Select name="type" required defaultValue={coupon?.type}>
            <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="percentage">百分比折扣</SelectItem>
                <SelectItem value="fixed">固定金额</SelectItem>
            </SelectContent>
            </Select>
        </div>
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">面值</Label>
            <Input id="value" name="value" type="number" defaultValue={coupon?.value} placeholder="例如：25" className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="usageLimit" className="text-right">数量限制</Label>
            <Input id="usageLimit" name="usageLimit" type="number" defaultValue={coupon?.usageLimit} placeholder="总可用数量" className="col-span-3" required />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
            {isPending ? '保存中...' : coupon ? '保存更改' : '创建'}
        </Button>
      </DialogFooter>
    </form>
  );
};
