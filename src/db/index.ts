import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use a singleton pattern to ensure we only have one database connection.
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  // 检查是否在服务器端运行
  if (typeof window === 'undefined') {
    // 检查是否在Edge Runtime中运行
    // 使用NEXT_RUNTIME环境变量来判断运行时环境，避免使用process.versions
    const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
    
    // 在Edge Runtime中不支持数据库操作，返回null或抛出错误
    if (isEdgeRuntime) {
      throw new Error('Database operations are not supported in Edge Runtime');
    }
    
    if (dbInstance) {
      return dbInstance;
    }

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }

    // 确保连接字符串包含正确的字符集设置
    const databaseUrl = process.env.DATABASE_URL.includes('?') 
      ? `${process.env.DATABASE_URL}&encoding=utf8`
      : `${process.env.DATABASE_URL}?encoding=utf8`;

    const client = postgres(databaseUrl);
    dbInstance = drizzle(client, { schema });
    
    return dbInstance;
  }
  
  // 在客户端抛出错误
  throw new Error('Database operations are not supported in browser');
}