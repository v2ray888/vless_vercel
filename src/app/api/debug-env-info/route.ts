import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/url-utils';

export async function GET() {
  // 获取所有相关的环境变量
  const envVars = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SITE_URL: process.env.SITE_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  };
  
  // 获取计算出的基础URL
  const baseUrl = getBaseUrl();
  
  // 返回详细信息
  const debugInfo = {
    environment: process.env.NODE_ENV,
    calculatedBaseUrl: baseUrl,
    environmentVariables: envVars,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(debugInfo);
}