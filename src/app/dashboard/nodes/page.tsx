'use client';

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
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getNodesForUser } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function NodesPage() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNodes() {
      if (user?.id) {
        try {
          const userNodes = await getNodesForUser(user.id);
          setNodes(userNodes);
        } catch (error) {
          console.error('获取节点信息失败:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchNodes();
  }, [user?.id]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">节点信息</h1>
      <Card>
        <CardHeader>
          <CardTitle>可用节点列表</CardTitle>
          <CardDescription>您的订阅中包含的所有可用节点。</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}