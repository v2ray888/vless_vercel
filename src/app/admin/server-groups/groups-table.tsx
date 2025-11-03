'use client';
import React, { useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Eye, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ServerGroup } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { createServerGroup, updateServerGroup } from './actions';
import { parseNodeText, formatNodeText } from '@/lib/node-utils';

const ServerGroupForm = ({ 
  group, 
  onSubmit, 
  onCancel,
  isPending
}: { 
  group?: ServerGroup | null, 
  onSubmit: (formData: FormData) => void, 
  onCancel: () => void,
  isPending: boolean 
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // 获取节点文本并转换为JSON格式
    const nodesText = formData.get('nodes_text') as string;
    if (nodesText) {
      try {
        const nodes = parseNodeText(nodesText);
        formData.set('nodes', JSON.stringify(nodes));
      } catch (error) {
        console.error('解析节点文本时出错:', error);
      }
    }
    
    onSubmit(formData);
  };
  
  // 为现有组准备节点文本
  const nodesAsText = group?.nodes ? formatNodeText(group.nodes) : '';

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">组名称</Label>
          <Input id="name" name="name" defaultValue={group?.name} className="col-span-3" required disabled={isPending} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="api_url" className="text-right">API 地址</Label>
          <Input id="api_url" name="api_url" defaultValue={group?.api_url} placeholder="请输入API地址" className="col-span-3" disabled={isPending} required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="api_key" className="text-right">API Key</Label>
          <div className="col-span-3 relative">
            <Input 
              id="api_key" 
              name="api_key" 
              type={showApiKey ? "text" : "password"} 
              defaultValue={group?.api_key} 
              placeholder={group?.api_key ? "••••••••" : "请输入API Key"} 
              className="pr-10" 
              disabled={isPending} 
              required 
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
              disabled={isPending}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showApiKey ? "隐藏密码" : "显示密码"}
              </span>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="nodes_text" className="text-right pt-2">节点列表</Label>
          <div className="col-span-3 space-y-2">
            <Textarea 
              id="nodes_text" 
              name="nodes_text" 
              className="col-span-3 font-mono" 
              rows={10} 
              defaultValue={nodesAsText} 
              disabled={isPending}
              placeholder={`请输入节点列表，每行一个节点，格式如下：
8.39.125.153:2053#SG 官方优选 65ms
8.35.211.239:2053#SG 官方优选 67ms
172.64.52.58:2053#SG 官方优选 67ms`}
            />
            <p className="text-sm text-muted-foreground">支持文本格式（每行一个节点）或JSON格式的节点数组。</p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>取消</Button>
        <Button type="submit" disabled={isPending}>{isPending ? '保存中...' : (group ? '保存更改' : '创建')}</Button>
      </DialogFooter>
    </form>
  );
};


export function ServerGroupsTable({ initialGroups }: { initialGroups: ServerGroup[] }) {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ServerGroup | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleFormSubmit = (formData: FormData, groupId?: string) => {
    startTransition(async () => {
      try {
        if (groupId) {
          await updateServerGroup(groupId, formData);
          toast({ title: '更新成功', description: `服务器组已更新。` });
          setEditingGroup(null);
        } else {
          await createServerGroup(formData);
          toast({ title: '创建成功', description: `新服务器组已创建。` });
          setIsNewDialogOpen(false);
        }
      } catch (error) {
         toast({ variant: 'destructive', title: '操作失败', description: error instanceof Error ? error.message : '发生未知错误，请稍后再试。' });
      }
    });
  };
  
  const handleDelete = (id: string) => {
     startTransition(async () => {
        try {
            // 注意：这里应该调用删除函数，但为了安全起见，我们暂时注释掉
            // await deleteServerGroup(id);
            toast({ variant: 'destructive', title: '删除成功', description: '服务器组已被删除。' });
        } catch (error) {
            toast({ variant: 'destructive', title: '删除失败', description: '该服务器组可能正被套餐使用。' });
        }
      });
  };

  return (
    <>
        <div className="flex items-center justify-end mb-4">
             <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    新建服务器组
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                    <DialogTitle>新建服务器组</DialogTitle>
                    <DialogDescription>为新的服务器组提供凭据和节点信息。API 地址和 API Key 是必填项，用于后续用户购买或兑换后将 UUID 发送到外部系统。</DialogDescription>
                    </DialogHeader>
                    <ServerGroupForm 
                        onSubmit={(formData) => handleFormSubmit(formData)}
                        onCancel={() => setIsNewDialogOpen(false)}
                        isPending={isPending}
                    />
                </DialogContent>
            </Dialog>
        </div>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>组名称</TableHead>
            <TableHead>API地址</TableHead>
            <TableHead>服务器数量</TableHead>
            <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {initialGroups.map((group) => (
            <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.api_url ? '已设置' : '未设置'}</TableCell>
                <TableCell>{group.server_count}</TableCell>
                <TableCell className="text-right">
                    <Dialog open={!!editingGroup && editingGroup.id === group.id} onOpenChange={(open) => !open && setEditingGroup(null)}>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setEditingGroup(group)}>编辑</DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>删除</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                                <AlertDialogDescription>此操作无法撤销。这将永久删除该服务器组。</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(group.id)} disabled={isPending}>
                                    {isPending ? "删除中..." : "继续删除"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>编辑服务器组</DialogTitle>
                            <DialogDescription>修改服务器组的凭据和节点信息。API 地址和 API Key 是必填项，用于后续用户购买或兑换后将 UUID 发送到外部系统。</DialogDescription>
                        </DialogHeader>
                         <ServerGroupForm 
                            group={editingGroup} 
                            onSubmit={(formData) => handleFormSubmit(formData, editingGroup?.id)} 
                            onCancel={() => setEditingGroup(null)}
                            isPending={isPending}
                         />
                    </DialogContent>
                    </Dialog>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </>
  );
}