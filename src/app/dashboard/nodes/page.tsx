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

export default async function NodesPage() {
  // 由于这是服务端组件，我们不能直接使用context
  // 我们需要通过API调用来获取用户信息
  
  // 为了修复静态生成问题，我们将用户ID作为参数传递给actions函数
  // 实际应用中，这个ID应该通过中间件或props传递
  
  // 暂时返回空数组，实际应用中应该通过API获取用户ID
  const nodes = await getNodesForUser('');

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