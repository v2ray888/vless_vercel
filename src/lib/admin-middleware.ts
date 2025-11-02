import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken } from '@/lib/auth-middleware';

/**
 * 验证管理员权限的中间件
 * @param request Next.js请求对象
 * @returns 验证结果或重定向响应
 */
export async function validateAdminToken(request: NextRequest) {
  // 首先验证认证令牌
  const validationResult = await validateAuthToken(request);
  
  if (!validationResult.success) {
    // 认证失败，重定向到登录页面
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // 检查用户是否为管理员
  if (!validationResult.user?.isAdmin) {
    // 非管理员用户，重定向到用户仪表板或拒绝访问
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 管理员验证通过
  return NextResponse.next();
}