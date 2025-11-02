import { SignJWT, jwtVerify } from 'jose';
import type { users } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof users>;

// 注意：我们移除了bcryptjs和数据库导入，因为它们在Edge Runtime中不兼容
// 这些功能应该只在服务器端使用

export class AuthService {
  /**
   * 检查用户是否为管理员
   * @param email 用户邮箱
   * @returns 是否为管理员
   */
  static isUserAdmin(email: string): boolean {
    return email === (process.env.ADMIN_EMAIL || 'admin@example.com');
  }
  
  /**
   * 根据用户ID获取用户信息
   * @param userId 用户ID
   * @returns 用户信息或null
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      // 在服务器环境中直接查询数据库
      if (process.env.NEXT_RUNTIME === 'nodejs') {
        // 只有在Node.js环境中才导入数据库相关模块
        const { getDb } = await import('@/db');
        const { users } = await import('@/db/schema');
        const { eq } = await import('drizzle-orm');
        
        const db = getDb();
        const userResult = await db.select().from(users).where(eq(users.id, userId));
        return userResult[0] || null;
      }
      
      // 在Edge Runtime中直接返回null，让调用者处理
      return null;
    } catch (error) {
      console.error('根据ID获取用户时出错:', error);
      return null;
    }
  }
  
  /**
   * 验证用户凭据（仅在服务器端使用）
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 验证成功的用户信息或null
   */
  static async validateCredentials(email: string, password: string): Promise<User | null> {
    // 确保只在Node.js环境中运行
    if (process.env.NEXT_RUNTIME !== 'nodejs') {
      throw new Error('validateCredentials只能在Node.js环境中调用');
    }
    
    try {
      // 动态导入bcryptjs和数据库模块
      const { getDb } = await import('@/db');
      const { users } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');
      const bcrypt = (await import('bcryptjs')).default;
      
      const db = getDb();
      
      // 查询用户
      const userResult = await db.select().from(users).where(eq(users.email, email));
      const user = userResult[0];
      
      // 检查用户是否存在以及是否有密码
      if (!user || !user.password) {
        return null;
      }
      
      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('验证用户凭据时出错:', error);
      return null;
    }
  }
  
  /**
   * 生成JWT令牌
   * @param user 用户信息
   * @returns JWT令牌
   */
  static async generateToken(user: User): Promise<string> {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback_secret');
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 24 * 7; // 7天过期
    
    return new SignJWT({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      isAdmin: this.isUserAdmin(user.email)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(secret);
  }
  
  /**
   * 验证JWT令牌
   * @param token JWT令牌
   * @returns 验证结果
   */
  static async verifyToken(token: string): Promise<{ payload: any } | null> {
    try {
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback_secret');
      const { payload } = await jwtVerify(token, secret);
      return { payload };
    } catch (error) {
      console.error('验证JWT令牌时出错:', error);
      return null;
    }
  }
}