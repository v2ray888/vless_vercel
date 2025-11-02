'use server';

import { getDb } from '@/db';
import { tutorials } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import type { Tutorial } from '@/lib/types';

export async function getTutorials(): Promise<Tutorial[]> {
  const db = getDb();
  return await db.query.tutorials.findMany();
}

export async function createTutorial(formData: FormData) {
  const db = getDb();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  await db.insert(tutorials).values({
    id: `tut_${Date.now()}`,
    title,
    content,
  });

  revalidatePath('/admin/tutorials');
}

export async function updateTutorial(id: string, formData: FormData) {
  const db = getDb();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  await db.update(tutorials).set({ title, content }).where(eq(tutorials.id, id));

  revalidatePath('/admin/tutorials');
}

export async function deleteTutorial(id: string) {
  const db = getDb();
  await db.delete(tutorials).where(eq(tutorials.id, id));
  revalidatePath('/admin/tutorials');
}
