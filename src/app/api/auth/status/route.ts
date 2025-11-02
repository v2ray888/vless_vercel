import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  try {
    // 验证认证令牌
    const validationResult = await validateAuthToken(request as any);
    
    if (!validationResult.success) {
      return NextResponse.json({ authenticated: false });
    }
    
    return NextResponse.json({ 
      authenticated: true,
      user: validationResult.user
    });
  } catch (error) {
    console.error('检查认证状态时出错:', error);
    return NextResponse.json({ authenticated: false });
  }
}