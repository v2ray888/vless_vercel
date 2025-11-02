import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use a singleton pattern to ensure we only have one database connection.
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  // 在Edge Runtime中不初始化数据库连接
  // 使用NEXT_RUNTIME环境变量来检测运行时环境
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (dbInstance) {
      return dbInstance;
    }

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }

    const client = postgres(process.env.DATABASE_URL);
    dbInstance = drizzle(client, { schema });
    
    return dbInstance;
  }
  
  // 在Edge Runtime中抛出错误
  throw new Error('Database operations are not supported in Edge Runtime');
}
