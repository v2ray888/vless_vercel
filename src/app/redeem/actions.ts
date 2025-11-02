'use server';

import { getDb } from '@/db';
import { redemptionCodes, users, plans } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { addMonths, addYears } from 'date-fns';

type ActionResult = {
  success: boolean;
  message: string;
};

function getNewEndDate(planName: string): Date {
    const now = new Date();
    if (planName.includes('月')) {
        return addMonths(now, 1);
    }
    if (planName.includes('季')) {
        return addMonths(now, 3);
    }
    if (planName.includes('年')) {
        return addYears(now, 1);
    }
    // Default to 1 month if no match
    return addMonths(now, 1);
}

export async function redeemCode(
  code: string,
  userId: string
): Promise<ActionResult> {
  const db = getDb();
  if (!code || !userId) {
    return { success: false, message: '兑换码和用户ID不能为空。' };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Find the redemption code and its associated plan
      const codeData = await tx.query.redemptionCodes.findFirst({
        where: and(
          eq(redemptionCodes.code, code),
          eq(redemptionCodes.status, 'available')
        ),
        with: {
          plan: true,
        },
      });

      if (!codeData || !codeData.plan) {
        return { success: false, message: '兑换码无效或已被使用。' };
      }

      // 2. Update the user's plan and end date
      const newEndDate = getNewEndDate(codeData.plan.name);

      await tx
        .update(users)
        .set({
          planId: codeData.planId,
          endDate: newEndDate,
          status: 'active',
        })
        .where(eq(users.id, userId));

      // 3. Mark the redemption code as used
      await tx
        .update(redemptionCodes)
        .set({
          status: 'used',
          usedById: userId,
          usedAt: new Date(),
        })
        .where(eq(redemptionCodes.id, codeData.id));
      
      return { success: true, message: `兑换成功！您的 '${codeData.plan.name}' 已激活。` };
    });

    return result;

  } catch (error) {
    console.error('Redemption failed:', error);
    return { success: false, message: '服务器发生错误，请稍后再试。' };
  }
}
