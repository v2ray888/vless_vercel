import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getOrders } from './actions';
import { OrdersTable } from './orders-table';

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">订单管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>订单列表</CardTitle>
          <CardDescription>跟踪和管理所有用户订单。</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable initialOrders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
