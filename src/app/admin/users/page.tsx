import { getUsers, getPlansForUsers } from './actions';
import { UsersTable } from './users-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function AdminUsersPage() {
  const users = await getUsers();
  const plans = await getPlansForUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">用户管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>查看和管理所有系统用户。</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            plans={plans}
          />
        </CardContent>
      </Card>
    </div>
  );
}
