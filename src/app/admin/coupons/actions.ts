'use server';

import { getDb } from '@/db';
import { coupons } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import type { Coupon } from '@/lib/types';
import { z } from 'zod';

export async function getCoupons(): Promise<Coupon[]> {
  const db = getDb();
  const data = await db.query.coupons.findMany({
    orderBy: [desc(coupons.id)],
  });
  return data;
}

const couponSchema = z.object({
  code: z.string().min(1, '优惠码不能为空'),
  type: z.enum(['percentage', 'fixed'], { required_error: '请选择类型' }),
  value: z.coerce.number().positive('面值必须为正数'),
  usageLimit: z.coerce.number().int().positive('数量限制必须为正整数'),
});


export async function createCoupon(formData: FormData) {
  const db = getDb();
  const validatedFields = couponSchema.safeParse({
    code: formData.get('code'),
    type: formData.get('type'),
    value: formData.get('value'),
    usageLimit: formData.get('usageLimit'),
  });

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.flatten().fieldErrors.toString());
  }

  await db.insert(coupons).values({
    ...validatedFields.data,
    id: `coupon_${Date.now()}`,
    status: 'active',
  });

  revalidatePath('/admin/coupons');
}

export async function updateCoupon(id: string, formData: FormData) {
    const db = getDb();
    const validatedFields = couponSchema.safeParse({
        code: formData.get('code'),
        type: formData.get('type'),
        value: formData.get('value'),
        usageLimit: formData.get('usageLimit'),
    });

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.flatten().fieldErrors.toString());
    }

    await db.update(coupons).set(validatedFields.data).where(eq(coupons.id, id));
    revalidatePath('/admin/coupons');
}

export async function deleteCoupon(id: string) {
    const db = getDb();
    await db.delete(coupons).where(eq(coupons.id, id));
    revalidatePath('/admin/coupons');
}

export async function toggleCouponStatus(id: string, currentStatus: 'active' | 'expired') {
    const db = getDb();
    const newStatus = currentStatus === 'active' ? 'expired' : 'active';
    await db.update(coupons).set({ status: newStatus }).where(eq(coupons.id, id));
    revalidatePath('/admin/coupons');
}
