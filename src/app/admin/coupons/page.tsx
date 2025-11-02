import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCoupons } from './actions';
import { CouponsTable } from './coupons-table';

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">优惠码管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>优惠码列表</CardTitle>
          <CardDescription>创建和管理适用于您套餐的优惠码。</CardDescription>
        </CardHeader>
        <CardContent>
          <CouponsTable initialCoupons={coupons} />
        </CardContent>
      </Card>
    </div>
  );
}
