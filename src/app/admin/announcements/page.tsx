import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAnnouncements } from './actions';
import { AnnouncementsTable } from './announcements-table';

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">公告管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>历史公告</CardTitle>
          <CardDescription>管理已发布的公告。</CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementsTable initialAnnouncements={announcements} />
        </CardContent>
      </Card>
    </div>
  );
}
