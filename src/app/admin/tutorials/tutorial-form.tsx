'use client';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Tutorial } from '@/lib/types';

type TutorialFormProps = {
  tutorial?: Tutorial | null;
  onSubmit: (formData: FormData, tutorialId?: string) => void;
  isPending: boolean;
};

export const TutorialForm = ({ tutorial, onSubmit, isPending }: TutorialFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData, tutorial?.id);
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
            defaultValue={tutorial?.title}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="content" className="text-right pt-2">
            内容
          </Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={tutorial?.content}
            className="col-span-3"
            rows={8}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? '保存中...' : tutorial ? '保存更改' : '创建教程'}
        </Button>
      </DialogFooter>
    </form>
  );
};
