import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AuthService } from '@/services/auth-service';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 从cookie中获取令牌
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: '未提供认证令牌' }, 
        { status: 401 }
      );
    }
    
    // 验证JWT令牌
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secret);
    
    // 验证用户是否存在
    const user = await AuthService.getUserById(payload.id as string);
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' }, 
        { status: 401 }
      );
    }
    
    // 返回用户信息
    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: AuthService.isUserAdmin(user.email)
      }
    });
  } catch (error) {
    console.error('获取用户信息时出错:', error);
    return NextResponse.json(
      { error: '无效的认证令牌' }, 
      { status: 401 }
    );
  }
}