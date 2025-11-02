import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 创建一个响应并清除auth-token cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // 立即过期
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('退出登录时出错:', error);
    return NextResponse.json(
      { error: '退出登录过程中发生错误' }, 
      { status: 500 }
    );
  }
}