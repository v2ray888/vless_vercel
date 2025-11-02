'use client';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Announcement } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type AnnouncementFormProps = {
  announcement?: Announcement | null;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
};

export const AnnouncementForm = ({ announcement, onSubmit, isPending }: AnnouncementFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            标题
          </Label>
          <Input
            id="title"
            name="title"
            defaultValue={announcement?.title}
            className="col-span-3"
            required
            disabled={isPending}
          />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="content" className="text-right pt-2">
            内容
          </Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={announcement?.content}
            className="col-span-3"
            rows={8}
            required
            disabled={isPending}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? '保存中...' : announcement ? '保存更改' : '立即发布'}
        </Button>
      </DialogFooter>
    </form>
  );
};
