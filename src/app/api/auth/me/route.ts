import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AuthService } from '@/services/auth-service';

export async function GET(request: Request) {
  try {
    // 从请求头中获取cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: '未提供认证令牌' }, 
        { status: 401 }
      );
    }
    
    // 从cookie头中解析auth-token
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    let token = null;
    for (const cookie of cookies) {
      if (cookie.startsWith('auth-token=')) {
        token = cookie.substring('auth-token='.length);
        break;
      }
    }
    
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