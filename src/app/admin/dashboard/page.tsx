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
import { Icons } from '@/components/icons';
import { getUsers } from '../users/actions';
import { getOrders } from '../orders/actions';

export default async function AdminDashboardPage() {
  const [users, orders] = await Promise.all([getUsers(), getOrders()]);

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.amount, 0);

  const activeSubscriptions = users.filter(u => u.status === 'active').length;
  
  const totalUsers = users.length;

  const recentOrders = orders.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  const kpiData = [
    { title: '总收入', value: `¥${totalRevenue.toFixed(2)}`, icon: 'wallet' as const, change: '来自所有已完成订单' },
    { title: '活跃订阅', value: `+${activeSubscriptions}`, icon: 'users' as const, change: '当前状态为活跃的用户' },
    { title: '总订单', value: `${orders.length}`, icon: 'orders' as const, change: '包含所有状态的订单' },
    { title: '总用户', value: `${totalUsers}`, icon: 'user' as const, change: '系统中的全部用户' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">仪表板</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => {
          const KpiIcon = Icons[kpi.icon];
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <KpiIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最新订单</CardTitle>
            <CardDescription>最近的5笔订单</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>套餐</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.user_name}</div>
                      <div className="text-sm text-muted-foreground">{order.user_email}</div>
                    </TableCell>
                    <TableCell>{order.plan_name}</TableCell>
                    <TableCell className="text-right">¥{order.amount}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status === 'completed' ? '已完成' : (order.status === 'pending' ? '待处理' : '失败')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近注册用户</CardTitle>
            <CardDescription>最近加入的5位用户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Icons.user className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{user.plan?.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
