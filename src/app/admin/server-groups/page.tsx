import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getServerGroups } from './actions';
import { ServerGroupsTable } from './groups-table';

export default async function AdminServerGroupsPage() {
  const groups = await getServerGroups();
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">服务器组管理</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>服务器组列表</CardTitle>
          <CardDescription>管理所有服务器组及其节点信息。</CardDescription>
        </CardHeader>
        <CardContent>
          <ServerGroupsTable initialGroups={groups} />
        </CardContent>
      </Card>
    </div>
  );
}
