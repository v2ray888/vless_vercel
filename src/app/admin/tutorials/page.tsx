import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTutorials } from './actions';
import { TutorialsTable } from './tutorials-table';

export default async function AdminTutorialsPage() {
  const tutorials = await getTutorials();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">教程管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>教程列表</CardTitle>
          <CardDescription>管理将在用户端显示的教程。</CardDescription>
        </CardHeader>
        <CardContent>
          <TutorialsTable initialTutorials={tutorials} />
        </CardContent>
      </Card>
    </div>
  );
}
