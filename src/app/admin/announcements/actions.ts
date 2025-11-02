'use server';

import { getDb } from '@/db';
import { announcements } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import type { Announcement } from '@/lib/types';
import { z } from 'zod';

export async function getAnnouncements(): Promise<Announcement[]> {
  const db = getDb();
  const result = await db.query.announcements.findMany({
    orderBy: [desc(announcements.date)],
  });
  return result.map((a) => ({
    ...a,
    id: String(a.id),
    date: new Date(a.date).toISOString().split('T')[0],
  }));
}

const announcementSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
});

export async function createAnnouncement(formData: FormData) {
  const db = getDb();
  const validatedFields = announcementSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.flatten().fieldErrors.title?.[0] || validatedFields.error.flatten().fieldErrors.content?.[0]);
  }

  await db.insert(announcements).values({
    id: `anno_${Date.now()}`,
    title: validatedFields.data.title,
    content: validatedFields.data.content,
    date: new Date(),
  });

  revalidatePath('/admin/announcements');
  revalidatePath('/dashboard');
}

export async function updateAnnouncement(id: string, formData: FormData) {
    const db = getDb();
    const validatedFields = announcementSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
    });

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.flatten().fieldErrors.title?.[0] || validatedFields.error.flatten().fieldErrors.content?.[0]);
    }

  await db
    .update(announcements)
    .set({
      title: validatedFields.data.title,
      content: validatedFields.data.content,
    })
    .where(eq(announcements.id, id));

  revalidatePath('/admin/announcements');
  revalidatePath('/dashboard');
}

export async function deleteAnnouncement(id: string) {
  const db = getDb();
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath('/admin/announcements');
  revalidatePath('/dashboard');
}
