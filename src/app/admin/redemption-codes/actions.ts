'use server';

import { getDb } from '@/db';
import { plans, redemptionCodes, users } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { desc, eq, sql, isNull, and } from 'drizzle-orm';
import type { RedemptionCode as RedemptionCodeType } from '@/lib/types';
import { randomBytes } from 'crypto';
import { z } from 'zod';

type ActionResult = {
  success: boolean;
  message: string;
  codes?: string[];
};

export async function getPlansForCodes(): Promise<Pick<typeof plans.$inferSelect, 'id' | 'name'>[]> {
  const db = getDb();
  return db.query.plans.findMany({
    where: eq(plans.status, 'active'),
    columns: {
      id: true,
      name: true,
    },
  });
}

function generateUniqueCode(): string {
  // Generates a 12-character alphanumeric code.
  return randomBytes(6).toString('hex').toUpperCase();
}

const manualCodeSchema = z.object({
  planId: z.string({ required_error: '请选择一个套餐。' }),
  code: z
    .string()
    .min(4, '兑换码至少4位')
    .max(50, '兑换码最多50位')
    .refine((s) => !s.includes(' '), '兑换码不能包含空格'),
});

export async function createManualCodeAction(
  values: z.infer<typeof manualCodeSchema>
): Promise<ActionResult> {
  const db = getDb();
  const validatedFields = manualCodeSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      success: false,
      message:
        validatedFields.error.flatten().fieldErrors.code?.join(', ') ||
        validatedFields.error.flatten().fieldErrors.planId?.join(', ') ||
        '输入无效。',
    };
  }

  try {
    const existingCode = await db.query.redemptionCodes.findFirst({
      where: eq(redemptionCodes.code, validatedFields.data.code),
    });

    if (existingCode) {
      return { success: false, message: '该兑换码已存在。' };
    }

    const newCodeId = `code_${validatedFields.data.code}`;
    await db.insert(redemptionCodes).values({
      id: newCodeId,
      code: validatedFields.data.code,
      planId: validatedFields.data.planId,
      status: 'available',
      createdAt: new Date(),
    });

    revalidatePath('/admin/redemption-codes');
    return {
      success: true,
      message: `兑换码 ${validatedFields.data.code} 已成功创建。`,
      codes: [validatedFields.data.code],
    };
  } catch (error) {
    console.error('Failed to create manual code:', error);
    return { success: false, message: '创建失败，请稍后再试。' };
  }
}

const bulkCodeSchema = z.object({
  planId: z.string({ required_error: '请选择一个套餐。' }),
  quantity: z.coerce
    .number()
    .int()
    .min(1, '数量至少为1')
    .max(100, '一次最多生成100个'),
});


export async function createBulkCodesAction(
  values: z.infer<typeof bulkCodeSchema>
): Promise<ActionResult> {
  const db = getDb();
  const validatedFields = bulkCodeSchema.safeParse(values);
  if (!validatedFields.success) {
     return {
      success: false,
      message:
        validatedFields.error.flatten().fieldErrors.quantity?.join(', ') ||
        validatedFields.error.flatten().fieldErrors.planId?.join(', ') ||
        '输入无效。',
    };
  }
  
  const { planId, quantity } = validatedFields.data;

  try {
    const generatedCodes: { id: string; code: string }[] = [];
    const newDbEntries: (typeof redemptionCodes.$inferInsert)[] = [];

    // This loop is simplified for clarity. In a high-traffic production app, 
    // you'd want a more robust way to handle potential (though rare) collisions.
    while (generatedCodes.length < quantity) {
      const code = generateUniqueCode();
      const existingCode = await db.query.redemptionCodes.findFirst({
        where: eq(redemptionCodes.code, code)
      });
      
      if (!existingCode) {
        const newId = `code_${code}`;
        generatedCodes.push({ id: newId, code });
        newDbEntries.push({
          id: newId,
          code: code,
          planId: planId,
          status: 'available',
          createdAt: new Date(),
        });
      }
    }
    
    if (newDbEntries.length > 0) {
        await db.insert(redemptionCodes).values(newDbEntries);
    }
    
    revalidatePath('/admin/redemption-codes');
    return {
      success: true,
      message: `成功生成 ${quantity} 个兑换码。`,
      codes: generatedCodes.map((c) => c.code),
    };
  } catch (error) {
    console.error('Failed to create bulk codes:', error);
    return { success: false, message: '批量创建失败，数据库错误。' };
  }
}

type RedemptionCodeQuery = {
  id: string;
  code: string;
  status: 'available' | 'used';
  createdAt: Date;
  usedAt: Date | null;
  planName: string | null;
  usedByEmail: string | null;
};

export async function getRedemptionCodes({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<{ codes: RedemptionCodeType[]; totalCount: number }> {
  const db = getDb();
  const offset = (page - 1) * limit;

  // Drizzle doesn't have a direct count over partition, so we do two queries.
  // This is still very performant on indexed columns.
  const data: RedemptionCodeQuery[] = await db
    .select({
      id: redemptionCodes.id,
      code: redemptionCodes.code,
      status: redemptionCodes.status,
      createdAt: redemptionCodes.createdAt,
      usedAt: redemptionCodes.usedAt,
      planName: plans.name,
      usedByEmail: users.email,
    })
    .from(redemptionCodes)
    .leftJoin(plans, eq(redemptionCodes.planId, plans.id))
    .leftJoin(users, eq(redemptionCodes.usedById, users.id))
    .orderBy(desc(redemptionCodes.createdAt))
    .limit(limit)
    .offset(offset);

  const [total] = await db.select({ count: sql<number>`count(*)` }).from(redemptionCodes);

  const formattedCodes = data.map((row) => ({
    id: row.id,
    code: row.code,
    plan: row.planName || 'N/A',
    status: row.status,
    created_at: row.createdAt.toISOString().split('T')[0],
    used_at: row.usedAt ? row.usedAt.toISOString().split('T')[0] : null,
    used_by: row.usedByEmail,
  }));
  
  return { codes: formattedCodes, totalCount: total.count };
}
