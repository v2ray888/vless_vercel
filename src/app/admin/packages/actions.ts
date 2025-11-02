'use server';

import { getDb } from '@/db';
import { plans, serverGroups } from '@/db/schema';
import type { Plan, ServerGroup } from '@/lib/types';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getPlans(): Promise<Plan[]> {
  const db = getDb();
  const allPlans = await db.query.plans.findMany({
    orderBy: [desc(plans.id)],
    with: {
      serverGroup: {
        columns: {
          name: true,
        },
      },
    },
  });

  return allPlans.map((p) => ({
    id: p.id,
    name: p.name,
    price_monthly: p.price_monthly ?? null,
    price_quarterly: p.price_quarterly ?? null,
    price_yearly: p.price_yearly ?? null,
    server_group: p.serverGroup.name,
    status: p.status as 'active' | 'inactive',
  }));
}

export async function getServerGroups(): Promise<Pick<ServerGroup, 'id' | 'name'>[]> {
    const db = getDb();
    return await db.query.serverGroups.findMany({
        columns: {
            id: true,
            name: true,
        }
    });
}

export async function createPlan(formData: FormData) {
  const db = getDb();
  const name = formData.get('name') as string;
  const price_monthly = Number(formData.get('price_monthly')) || null;
  const price_quarterly = Number(formData.get('price_quarterly')) || null;
  const price_yearly = Number(formData.get('price_yearly')) || null;
  const serverGroupId = formData.get('serverGroupId') as string;
  
  if (!name || !serverGroupId) {
    throw new Error('套餐名称和服务器组为必填项');
  }

  await db.insert(plans).values({
    id: `plan_${Date.now()}`,
    name,
    price_monthly,
    price_quarterly,
    price_yearly,
    serverGroupId,
    status: 'active',
  });

  revalidatePath('/admin/packages');
}

export async function updatePlan(planId: string, formData: FormData) {
  const db = getDb();
  const name = formData.get('name') as string;
  const price_monthly = Number(formData.get('price_monthly')) || null;
  const price_quarterly = Number(formData.get('price_quarterly')) || null;
  const price_yearly = Number(formData.get('price_yearly')) || null;
  const serverGroupId = formData.get('serverGroupId') as string;

  if (!name || !serverGroupId) {
    throw new Error('套餐名称和服务器组为必填项');
  }

  await db.update(plans).set({
    name,
    price_monthly,
    price_quarterly,
    price_yearly,
    serverGroupId,
  }).where(eq(plans.id, planId));

  revalidatePath('/admin/packages');
}

export async function deletePlan(planId: string) {
    const db = getDb();
    await db.delete(plans).where(eq(plans.id, planId));
    revalidatePath('/admin/packages');
}

export async function togglePlanStatus(planId: string, currentStatus: 'active' | 'inactive') {
    const db = getDb();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await db.update(plans).set({ status: newStatus }).where(eq(plans.id, planId));
    revalidatePath('/admin/packages');
}
