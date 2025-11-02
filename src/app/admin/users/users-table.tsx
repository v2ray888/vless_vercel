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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { User, Plan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { UserForm } from './user-form';
import { CardFooter } from '@/components/ui/card';
import {
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from './actions';

const ITEMS_PER_PAGE = 5;

type UsersTableProps = {
  users: User[];
  plans: Pick<Plan, 'id' | 'name'>[];
};

export function UsersTable({ users: initialUsers, plans }: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const statusVariant = {
    active: 'default',
    inactive: 'secondary',
    suspended: 'destructive',
  } as const;

  const statusText = {
    active: '活跃',
    inactive: '禁用',
    suspended: '暂停',
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteUser(id);
        toast({
          variant: 'destructive',
          title: '删除成功',
          description: '用户已被删除。',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '删除失败',
          description: '删除用户时发生错误。',
        });
      }
    });
  };

  const handleToggleSuspend = (
    id: string,
    status: 'active' | 'inactive' | 'suspended'
  ) => {
    startTransition(async () => {
      await toggleUserStatus(id, status);
      toast({
        title: '状态已更新',
        description: `用户状态已更新。`,
      });
    });
  };

  const totalPages = Math.ceil(initialUsers.length / ITEMS_PER_PAGE);
  const currentUsers = initialUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFormSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        if (editingUser) {
          await updateUser(editingUser.id, formData);
          toast({ title: '更新成功', description: '用户信息已更新。' });
          setEditingUser(null);
        } else {
          await createUser(formData);
          toast({ title: '创建成功', description: `新用户已创建。` });
          setIsNewUserDialogOpen(false);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '操作失败',
          description:
            error instanceof Error ? error.message : '发生未知错误。',
        });
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新建用户
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建用户</DialogTitle>
              <DialogDescription>手动添加一个新用户到系统中。</DialogDescription>
            </DialogHeader>
            <UserForm
              plans={plans}
              onFormSubmit={handleFormSubmit}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户</TableHead>
            <TableHead>套餐</TableHead>
            <TableHead>到期日</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
              </TableCell>
              <TableCell>{user.plan?.name || 'N/A'}</TableCell>
              <TableCell>{user.endDate || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[user.status]}>
                  {statusText[user.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Dialog
                  open={editingUser?.id === user.id}
                  onOpenChange={(open) => {
                    if (!open) setEditingUser(null);
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-haspopup="true"
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                          编辑
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DropdownMenuItem
                        onClick={() => handleToggleSuspend(user.id, user.status)}
                        disabled={isPending}
                      >
                        {user.status === 'suspended' ? '恢复账户' : '暂停账户'}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            删除
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                            <AlertDialogDescription>
                              这个操作无法撤销。此操作将永久删除用户及其所有数据。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              disabled={isPending}
                            >
                              {isPending ? '删除中...' : '继续删除'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>编辑用户</DialogTitle>
                      <DialogDescription>修改用户信息。</DialogDescription>
                    </DialogHeader>
                    <UserForm
                      user={editingUser}
                      plans={plans}
                      onFormSubmit={handleFormSubmit}
                      isPending={isPending}
                    />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CardFooter className="pt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => handlePageChange(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </>
  );
}
