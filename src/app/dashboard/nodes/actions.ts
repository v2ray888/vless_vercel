'use server';

// 移除对@/auth的导入，使用自定义认证方法
import { getDb } from '@/db';
import { users, plans, serverGroups } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Node } from '@/lib/types';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// 自定义认证函数
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    // 验证JWT令牌
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secret);
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string | null,
      isAdmin: payload.isAdmin as boolean
    };
  } catch (error) {
    console.error('验证认证令牌时出错:', error);
    return null;
  }
}

export async function getNodesForUser(): Promise<Node[]> {
  const db = getDb();
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return [];
  }
  
  try {
    // Step 1: Find the user to get their planId
    const userResult = await db.select().from(users).where(eq(users.id, user.id));
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