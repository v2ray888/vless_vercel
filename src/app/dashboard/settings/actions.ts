'use server';

// 移除对@/auth的导入，使用自定义认证方法
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

type ActionResult = {
  success: boolean;
  message: string;
};

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

// 自定义登出函数
async function signOut() {
  // 注意：在Server Action中我们无法直接操作cookies，需要通过API端点
  // 这里我们只返回一个标识，让客户端处理登出逻辑
  return { success: true };
}

export async function updateProfile(name: string): Promise<ActionResult> {
  const db = getDb();
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return { success: false, message: '用户未登录。' };
  }

  if (!name || name.length < 2) {
    return { success: false, message: '昵称至少需要2个字符。' };
  }

  try {
    await db
      .update(users)
      .set({ name })
      .where(eq(users.id, user.id));
    return { success: true, message: '您的个人资料已更新。' };
  } catch (error) {
    return { success: false, message: '更新失败，请稍后再试。' };
  }
}

const passwordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6, '新密码至少需要6位。'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: '新密码和确认密码不匹配。',
    path: ['confirmPassword'],
});

export async function changePassword(
  values: z.infer<typeof passwordSchema>
): Promise<ActionResult> {
  const db = getDb();
  const user = await getCurrentUser();
  
  if (!user?.id) {
    return { success: false, message: '用户未登录。' };
  }

  const validatedFields = passwordSchema.safeParse(values);
  if (!validatedFields.success) {
      return { success: false, message: validatedFields.error.flatten().fieldErrors.newPassword?.[0] || validatedFields.error.flatten().fieldErrors.confirmPassword?.[0] || "输入无效。" };
  }
  
  const { currentPassword, newPassword } = validatedFields.data;

  try {
    // 查询用户信息
    const userResult = await db.select().from(users).where(eq(users.id, user.id));
    const currentUser = userResult[0];

    if (!currentUser?.password) {
        return { success: false, message: '无法验证当前用户。' };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, currentUser.password);

    if (!passwordsMatch) {
        return { success: false, message: '当前密码不正确。' };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users).set({ password: hashedNewPassword }).where(eq(users.id, user.id));
    
    // 返回成功标识，让客户端处理登出逻辑
    return { success: true, message: '密码修改成功，请重新登录。' };

  } catch (error) {
    return { success: false, message: '服务器错误，请稍后再试。' };
  }
}