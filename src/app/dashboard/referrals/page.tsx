import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';
import { getReferralData } from './actions';
// 移除对@/auth的导入，使用中间件保护路由
import { CopyButton } from './copy-button';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ReferralsPage() {
  // 依赖中间件来保护路由
  const referralData = await getReferralData();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">推广中心</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>您的推广链接</CardTitle>
            <CardDescription>
              分享您的链接，邀请好友加入，您将获得佣金奖励。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralData ? (
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  readOnly
                  value={referralData.referralLink}
                  className="font-mono"
                />
                <CopyButton textToCopy={referralData.referralLink} />
              </div>
            ) : (
                <Skeleton className="h-10 w-full" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>推广统计</CardTitle>
            <CardDescription>您的推广成果概览。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
             {referralData ? (
              <>
                <div className="flex justify-between">
                  <span>已邀请用户:</span> <span className="font-medium">{referralData.referralCount} 人</span>
                </div>
                <div className="flex justify-between">
                  <span>累计佣金:</span> <span className="font-medium">¥{referralData.totalCommission.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                  <span>待提现佣金:</span> <span className="font-medium">¥{referralData.pendingCommission.toFixed(2)}</span>
                </div>
                <Button disabled={referralData.pendingCommission <= 0} className="mt-2">申请提现</Button>
              </>
            ) : (
                <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}