import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getWithdrawals } from './actions';
import { WithdrawalsTable } from './withdrawals-table';

export default async function AdminWithdrawalsPage() {
  const withdrawals = await getWithdrawals();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">提现管理</h1>
      <Card>
        <CardHeader>
          <CardTitle>提现请求</CardTitle>
          <CardDescription>处理用户的提现请求。</CardDescription>
        </CardHeader>
        <CardContent>
          <WithdrawalsTable initialWithdrawals={withdrawals} />
        </CardContent>
      </Card>
    </div>
  );
}
