import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateAuthToken } from '@/lib/auth-middleware';
import { validateAdminToken } from '@/lib/admin-middleware';

// 定义需要保护的路由
const protectedRoutes = [
  '/dashboard',
];

// 定义需要管理员权限的路由
const adminRoutes = [
  '/admin',
];

// 定义公共路由（不需要认证）
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/api/auth/login',
  // 注意：/api/auth/me 需要认证，所以不在公共路由中
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否为公共路由
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // 检查是否为管理员路由
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // 验证管理员权限
    return await validateAdminToken(request);
  }
  
  // 检查是否为受保护的路由
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // 验证认证令牌
    const validationResult = await validateAuthToken(request);
    
    if (!validationResult.success) {
      // 重定向到登录页面
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下路径：
     * - API路由
     * - 静态文件
     * - 图标和图片
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};