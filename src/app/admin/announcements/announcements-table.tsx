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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Announcement } from '@/lib/types';
import { AnnouncementForm } from './announcement-form';
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from './actions';

type AnnouncementsTableProps = {
  initialAnnouncements: Announcement[];
};

export function AnnouncementsTable({ initialAnnouncements }: AnnouncementsTableProps) {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (editingAnnouncement) {
          await updateAnnouncement(editingAnnouncement.id, formData);
          toast({ title: '更新成功', description: '公告已更新。' });
          setEditingAnnouncement(null);
        } else {
          await createAnnouncement(formData);
          toast({ title: '创建成功', description: '新公告已发布。' });
          setIsNewDialogOpen(false);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '操作失败',
          description: error instanceof Error ? error.message : '发生未知错误。',
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteAnnouncement(id);
        toast({
          variant: 'destructive',
          title: '删除成功',
          description: '公告已被删除。',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '删除失败',
          description: '删除公告时发生错误。',
        });
      }
    });
  };
  
  const closeEditDialog = () => setEditingAnnouncement(null);

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新建公告
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建公告</DialogTitle>
              <DialogDescription>创建一则新的公告，发布后将对所有用户可见。</DialogDescription>
            </DialogHeader>
            <AnnouncementForm onSubmit={handleFormSubmit} isPending={isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead>发布日期</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialAnnouncements.map((announcement) => (
            <TableRow key={announcement.id}>
              <TableCell className="font-medium">{announcement.title}</TableCell>
              <TableCell>{announcement.date}</TableCell>
              <TableCell className="text-right">
                 <Dialog open={!!editingAnnouncement && editingAnnouncement.id === announcement.id} onOpenChange={(open) => !open && closeEditDialog()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setEditingAnnouncement(announcement)}>
                          编辑
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              删除
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                              <AlertDialogDescription>
                                这个操作无法撤销。此操作将永久删除公告。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(String(announcement.id))} disabled={isPending}>
                                {isPending ? '删除中...' : '继续删除'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>编辑公告</DialogTitle>
                        </DialogHeader>
                        <AnnouncementForm
                            announcement={editingAnnouncement}
                            onSubmit={handleFormSubmit}
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
