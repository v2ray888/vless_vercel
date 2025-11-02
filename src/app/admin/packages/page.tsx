import { getPlans, getServerGroups } from './actions';
import { PackagesTable } from './packages-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function AdminPackagesPage() {
  const plans = await getPlans();
  const serverGroups = await getServerGroups();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">套餐管理</h1>
      <Card>
        <CardHeader>
          <CardTitle>套餐列表</CardTitle>
          <CardDescription>管理订阅套餐（包月、包季、包年）。</CardDescription>
        </CardHeader>
        <CardContent>
          <PackagesTable plans={plans} serverGroups={serverGroups} />
        </CardContent>
      </Card>
    </div>
  );
}
