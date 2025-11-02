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
import { useToast } from '@/hooks/use-toast';
import type { Tutorial } from '@/lib/types';
import { TutorialForm } from './tutorial-form';
import { createTutorial, updateTutorial, deleteTutorial } from './actions';

type TutorialsTableProps = {
  initialTutorials: Tutorial[];
};

export function TutorialsTable({ initialTutorials }: TutorialsTableProps) {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFormSubmit = async (
    formData: FormData,
    tutorialId?: string
  ) => {
    startTransition(async () => {
      try {
        if (tutorialId) {
          await updateTutorial(tutorialId, formData);
          toast({ title: '更新成功', description: '教程已更新。' });
          setEditingTutorial(null);
        } else {
          await createTutorial(formData);
          toast({ title: '创建成功', description: '新教程已添加。' });
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
        await deleteTutorial(id);
        toast({
          variant: 'destructive',
          title: '删除成功',
          description: '教程已被删除。',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '删除失败',
          description: '删除教程时发生错误。',
        });
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
              新建教程
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建教程</DialogTitle>
              <DialogDescription>
                为客户端或其他功能创建图文教程。
              </DialogDescription>
            </DialogHeader>
            <TutorialForm
              onSubmit={handleFormSubmit}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialTutorials.map((tutorial) => (
            <TableRow key={tutorial.id}>
              <TableCell className="font-medium">{tutorial.title}</TableCell>
              <TableCell className="text-right">
                <Dialog
                  open={!!editingTutorial && editingTutorial.id === tutorial.id}
                  onOpenChange={(open) => !open && setEditingTutorial(null)}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem
                        onSelect={() => setEditingTutorial(tutorial)}
                      >
                        编辑
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
                              这个操作无法撤销。此操作将永久删除该教程。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(tutorial.id)}
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
                      <DialogTitle>编辑教程</DialogTitle>
                    </DialogHeader>
                    <TutorialForm
                      tutorial={editingTutorial}
                      onSubmit={(formData) => handleFormSubmit(formData, editingTutorial?.id)}
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
