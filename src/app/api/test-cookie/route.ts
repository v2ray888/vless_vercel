import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const headers = new Headers(request.headers);
  const cookieHeader = headers.get('cookie');
  
  return NextResponse.json({
    message: 'Cookie测试',
    cookieHeader: cookieHeader,
    allHeaders: Object.fromEntries(headers.entries())
  });
}

export async function POST(request: Request) {
  const response = NextResponse.json({ 
    message: '设置测试cookie',
    success: true
  });
  
  response.cookies.set('test-token', 'test-value', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1天
    path: '/',
  });
  
  return response;
}