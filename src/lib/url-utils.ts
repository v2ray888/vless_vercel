/**
 * 获取应用的基础URL，自动适配不同环境
 * @returns 基础URL字符串
 */
export function getBaseUrl(): string {
  // Vercel环境变量
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  // 显式设置的环境变量
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // 传统的Vercel环境变量
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // 自定义域名环境变量
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }
  
  // 本地开发环境
  if (process.env.NODE_ENV === 'development') {
    // 检查常见的开发端口
    const port = process.env.PORT || '3000';
    return `http://localhost:${port}`;
  }
  
  // 默认值
  return 'http://localhost:3000';
}

/**
 * 获取API的基础URL
 * @returns API基础URL字符串
 */
export function getApiBaseUrl(): string {
  return getBaseUrl();
}