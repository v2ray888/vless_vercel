import { NextRequest } from 'next/server';

export async function GET() {
  try {
    // 返回环境变量信息用于调试
    const envInfo = {
      success: true,
      PAYMENT_PID: process.env.PAYMENT_PID ? '已设置' : '未设置',
      PAYMENT_KEY: process.env.PAYMENT_KEY ? `已设置(${process.env.PAYMENT_KEY.length}字符)` : '未设置',
      PAYMENT_API_URL: process.env.PAYMENT_API_URL || '未设置',
      DATABASE_URL: process.env.DATABASE_URL ? '已设置' : '未设置',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '未设置',
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(envInfo), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('获取环境变量信息时出错:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }
}