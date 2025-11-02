'use server';

// 移除对@/auth的导入，使用自定义认证方法
import { getDb } from '@/db';
import { users, plans, serverGroups } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Node } from '@/lib/types';

// 修改函数签名，接收用户ID作为参数
export async function getNodesForUser(userId: string): Promise<Node[]> {
  const db = getDb();
  
  if (!userId) {
    return [];
  }
  
  try {
    // Step 1: Find the user to get their planId
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    const currentUser = userResult[0];

    if (!currentUser?.planId) {
        return [];
    }

    // Step 2: Find the plan and its associated server group
    const planResult = await db.select().from(plans).where(eq(plans.id, currentUser.planId));
    const currentPlan = planResult[0];

    if (!currentPlan) {
        return [];
    }

    // 查询server group
    const serverGroupResult = await db.select().from(serverGroups).where(eq(serverGroups.id, currentPlan.serverGroupId));
    const serverGroup = serverGroupResult[0];

    if (!serverGroup?.nodes) {
        return [];
    }

    // The nodes are stored as JSONB in the serverGroups table.
    return serverGroup.nodes as Node[];

  } catch (error) {
    console.error("Failed to get nodes for user:", error);
    return [];
  }
}