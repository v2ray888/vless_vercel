import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getUserOrders } from './actions';

export default async function UserOrdersPage() {
  // 依赖中间件来保护路由，getUserOrders函数内部会处理用户ID获取
  // 为了修复静态生成问题，我们将用户ID作为参数传递给actions函数
  // 实际应用中，这个ID应该通过中间件或props传递
  const userOrders = await getUserOrders('');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">订单记录</h1>
      <Card>
        <CardHeader>
          <CardTitle>您的订单</CardTitle>
          <CardDescription>您所有的历史订单记录。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单ID</TableHead>
                <TableHead>套餐</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOrders.length > 0 ? (
                userOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.plan_name}</TableCell>
                    <TableCell>¥{order.amount}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status === 'completed' ? '已完成' : (order.status === 'pending' ? '待处理' : '失败')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">暂无订单记录</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}