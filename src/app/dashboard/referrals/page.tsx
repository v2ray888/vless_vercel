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
import { CopyButton } from './copy-button';
import { Skeleton } from '@/components/ui/skeleton';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { QRCodeComponent } from './qr-code';
import { PosterGenerator } from './poster-generator';

// 从JWT令牌中获取用户ID的函数
async function getUserIdFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secret);
    
    return payload.id as string;
  } catch (error) {
    console.error('解析JWT令牌时出错:', error);
    return null;
  }
}

export default async function ReferralsPage() {
  // 从JWT令牌中获取当前用户ID
  const userId = await getUserIdFromToken();
  
  // 获取推荐返利数据
  const referralData = await getReferralData(userId || '');

  // 从推广链接中提取推荐码
  const referralCode = referralData?.referralLink.split('=')[1] || '';

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
              <div className="space-y-4">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    type="text"
                    readOnly
                    value={referralData.referralLink}
                    className="font-mono"
                  />
                  <CopyButton textToCopy={referralData.referralLink} />
                </div>
                
                {/* 二维码展示区域 */}
                <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium">推广二维码</h3>
                  <QRCodeComponent value={referralData.referralLink} size={150} />
                  <p className="text-xs text-gray-500 text-center">
                    扫描二维码邀请好友注册
                  </p>
                </div>
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
      
      {/* 海报生成区域 */}
      <Card>
        <CardHeader>
          <CardTitle>推广海报</CardTitle>
          <CardDescription>
            生成专属推广海报，方便分享给更多好友
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralData ? (
            <PosterGenerator 
              referralLink={referralData.referralLink} 
              referralCode={referralCode} 
            />
          ) : (
            <Skeleton className="h-10 w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}