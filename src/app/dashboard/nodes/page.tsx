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
import { getNodesForUser } from './actions';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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

export default async function NodesPage() {
  // 从JWT令牌中获取当前用户ID
  const userId = await getUserIdFromToken();
  
  // 获取用户节点信息
  const nodes = await getNodesForUser(userId || '');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">节点信息</h1>
      <Card>
        <CardHeader>
          <CardTitle>可用节点列表</CardTitle>
          <CardDescription>您的订阅中包含的所有可用节点。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>节点名称</TableHead>
                <TableHead>地区</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>延迟</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodes.length > 0 ? (
                nodes.map((node) => (
                  <TableRow key={node.id}>
                    <TableCell className="font-medium">{node.name}</TableCell>
                    <TableCell>{node.location}</TableCell>
                    <TableCell>
                      <Badge variant={node.status === 'online' ? 'default' : 'destructive'}>
                        {node.status === 'online' ? '在线' : '维护中'}
                      </Badge>
                    </TableCell>
                    <TableCell>{node.speed}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        您的套餐暂无可用节点。
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}