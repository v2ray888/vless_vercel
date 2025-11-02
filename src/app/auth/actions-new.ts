'use server';

import { redirect } from 'next/navigation';

/**
 * 新的登录函数，使用自定义API端点
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
  } catch (error) {
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
 * 登出函数
 * @returns 登出结果
 */
export async function logout() {
  try {
    // 重定向到登录页面（客户端会处理cookie清除）
    redirect('/auth/login');
  } catch (error) {
    // 检查是否为NEXT_REDIRECT错误，这是预期的重定向行为
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // 重新抛出重定向错误，让Next.js处理
      throw error;
    }
    
    console.error('登出过程中出错:', error);
    return { message: '登出过程中发生错误' };
  }
}