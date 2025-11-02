'use server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getRedemptionCodes, getPlansForCodes } from './actions';
import { RedemptionCodesTable } from './codes-table';
import { GenerateCodeForm } from './generate-code-form';

const ITEMS_PER_PAGE = 10;

export default async function AdminRedemptionCodesPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = Number(searchParams?.page) || 1;
  const { codes, totalCount } = await getRedemptionCodes({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
  const plans = await getPlansForCodes();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">兑换码管理</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新建兑换码
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>新建兑换码</DialogTitle>
              <DialogDescription>
                手动创建单个兑换码，或批量生成多个。
              </DialogDescription>
            </DialogHeader>
            <GenerateCodeForm plans={plans} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>已生成兑换码</CardTitle>
          <CardDescription>
            管理和跟踪所有兑换码的使用情况。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RedemptionCodesTable
            initialCodes={codes}
            totalCount={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </CardContent>
      </Card>
    </div>
  );
}
