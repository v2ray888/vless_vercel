'use server';

import { getDb } from '@/db';
import { users, plans } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import type { User, Plan } from '@/lib/types';

export async function getUsers(): Promise<User[]> {
  const db = getDb();
  const allUsers = await db.query.users.findMany({
    with: {
      plan: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: [desc(users.id)],
  });

  return allUsers.map((u) => ({
    ...u,
    id: u.id,
    name: u.name ?? '',
    email: u.email ?? '',
    status: u.status as 'active' | 'inactive' | 'suspended',
    endDate: u.endDate ? new Date(u.endDate).toISOString().split('T')[0] : null,
    plan: u.plan ? { name: u.plan.name } : null,
  }));
}

export async function getPlansForUsers(): Promise<Pick<Plan, 'id' | 'name'>[]> {
    const db = getDb();
    return await db.query.plans.findMany({
        where: eq(plans.status, 'active'),
        columns: {
            id: true,
            name: true,
        }
    });
}

export async function createUser(formData: FormData) {
  const db = getDb();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const planId = formData.get('planId') as string;
  const password = formData.get('password') as string; // Note: In a real app, hash this password!

  await db.insert(users).values({
    id: `usr_${Date.now()}`,
    name,
    email,
    planId,
    status: 'active',
    // Set a default expiration date, e.g., 30 days from now
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  revalidatePath('/admin/users');
}

export async function updateUser(userId: string, formData: FormData) {
  const db = getDb();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const planId = formData.get('planId') as string;

  await db.update(users)
    .set({
      name,
      email,
      planId,
    })
    .where(eq(users.id, userId));

  revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
  const db = getDb();
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath('/admin/users');
}

export async function toggleUserStatus(userId: string, currentStatus: 'active' | 'inactive' | 'suspended') {
  const db = getDb();
  const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
  await db.update(users).set({ status: newStatus }).where(eq(users.id, userId));
  revalidatePath('/admin/users');
}
