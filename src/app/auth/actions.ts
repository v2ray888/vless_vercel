'use server';

import { redirect } from 'next/navigation';
// 修复导入路径
import { getDb } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * 登录函数
 * @param prevState 前一个状态
 * @param formData 表单数据
 * @returns 登录结果
 */
export async function login(prevState: { message: string } | undefined, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // 验证输入
    if (!email || !password) {
      return { message: '邮箱和密码是必填项' };
    }
    
    // 调用自定义认证API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // 确保包含cookies
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { message: result.error || '登录失败' };
    }
    
    // 重定向到仪表板
    redirect('/dashboard');
  } catch (error: any) {
    // 检查是否为NEXT_REDIRECT错误，这是预期的重定向行为
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // 重新抛出重定向错误，让Next.js处理
      throw error;
    }
    
    console.error('登录过程中出错:', error);
    return { message: '登录过程中发生错误' };
  }
}

/**
 * 注册函数
 * @param prevState 前一个状态
 * @param formData 表单数据
 * @returns 注册结果
 */
export async function signup(prevState: { message: string } | undefined, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const refCode = formData.get('ref') as string;
    
    // 验证输入
    if (!name || !email || !password || !confirmPassword) {
      return { message: '所有字段都是必填项' };
    }
    
    if (password !== confirmPassword) {
      return { message: '密码和确认密码不匹配' };
    }
    
    if (password.length < 6) {
      return { message: '密码至少需要6位字符' };
    }
    
    // 获取数据库实例
    const db = getDb();
    
    // 检查邮箱是否已存在
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return { message: '该邮箱已被注册' };
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const newUser = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      // 添加status字段，设置为'active'以满足数据库约束
      status: 'active',
      // 注意：users表结构中没有createdAt, updatedAt字段，id字段有默认值函数所以不需要手动设置
      // refBy字段在数据库中是referredById
      referredById: refCode || null,
    }).returning();
    
    if (newUser.length === 0) {
      return { message: '注册失败，请稍后重试' };
    }
    
    // 注册成功
    return { message: 'success' };
  } catch (error: any) {
    console.error('注册过程中出错:', error);
    return { message: '注册过程中发生错误' };
  }
}

/**
 * 登出函数
 * @returns 登出结果
 */
export async function logout() {
  try {
    // 重定向到登录页面（客户端会处理cookie清除）
    redirect('/auth/login');
  } catch (error: any) {
    // 检查是否为NEXT_REDIRECT错误，这是预期的重定向行为
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // 重新抛出重定向错误，让Next.js处理
      throw error;
    }
    
    console.error('登出过程中出错:', error);
    return { message: '登出过程中发生错误' };
  }
}