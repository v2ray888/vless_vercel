/**
 * 获取应用的基础URL，自动适配不同环境
 * @returns 基础URL字符串
 */
export function getBaseUrl(): string {
  // 检查显式设置的环境变量（优先级最高）
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    console.log('Using NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // 检查自定义域名环境变量
  if (process.env.SITE_URL) {
    console.log('Using SITE_URL:', process.env.SITE_URL);
    return process.env.SITE_URL;
  }
  
  // Vercel环境变量（处理Vercel自动分配的域名）
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    // 确保URL以https://开头
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
    const fullUrl = vercelUrl.startsWith('https://') ? vercelUrl : `https://${vercelUrl}`;
    console.log('Using NEXT_PUBLIC_VERCEL_URL:', fullUrl);
    return fullUrl;
  }
  
  // 传统的Vercel环境变量
  if (process.env.VERCEL_URL) {
    // 确保URL以https://开头
    const vercelUrl = process.env.VERCEL_URL;
    const fullUrl = vercelUrl.startsWith('https://') ? vercelUrl : `https://${vercelUrl}`;
    console.log('Using VERCEL_URL:', fullUrl);
    return fullUrl;
  }
  
  // 本地开发环境
  if (process.env.NODE_ENV === 'development') {
    // 检查常见的开发端口
    const port = process.env.PORT || '3000';
    const localUrl = `http://localhost:${port}`;
    console.log('Using local development URL:', localUrl);
    return localUrl;
  }
  
  // 默认值
  console.log('Using default URL: http://localhost:3000');
  return 'http://localhost:3000';
}

/**
 * 获取API的基础URL
 * @returns API基础URL字符串
 */
export function getApiBaseUrl(): string {
  return getBaseUrl();
}