import { AuthService } from '@/services/auth-service';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    console.log('Login API called');
    console.log('Runtime environment:', process.env.NEXT_RUNTIME || 'undefined');
    
    const { email, password } = await request.json();
    
    // 验证输入
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: '邮箱和密码是必填项' }, 
        { status: 400 }
      );
    }
    
    console.log('Login attempt for:', email);
    
    // 验证用户凭据
    console.log('Calling AuthService.validateCredentials...');
    const user = await AuthService.validateCredentials(email, password);
    console.log('AuthService result:', user ? 'User found' : 'User not found');
    
    if (!user) {
      console.log('Login failed for user:', email);
      return NextResponse.json(
        { error: '邮箱或密码不正确' }, 
        { status: 401 }
      );
    }
    
    console.log('Login successful for user:', email);
    
    // 创建JWT令牌
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback_secret');
    const token = await new SignJWT({ 
        id: user.id, 
        email: user.email,
        name: user.name,
        isAdmin: AuthService.isUserAdmin(user.email)
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
    
    // 设置HTTP-only cookie
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: AuthService.isUserAdmin(user.email)
      }
    });
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      path: '/',
      sameSite: 'lax',
      // 移除domain设置，让浏览器自动使用当前域名
    });
    
    console.log('Auth token set in cookie');
    
    return response;
  } catch (error) {
    console.error('登录过程中出错:', error);
    return NextResponse.json(
      { error: '登录过程中发生错误' }, 
      { status: 500 }
    );
  }
}