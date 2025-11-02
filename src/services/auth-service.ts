import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  status: string | null;
  planId: string | null;
  endDate: Date | null;
  referredById: string | null;
  subscriptionUrlToken: string | null;
}

export class AuthService {
  /**
   * 验证用户凭据
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 验证成功的用户信息或null
   */
  static async validateCredentials(email: string, password: string): Promise<User | null> {
    try {
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
        const db = getDb();
        const userResult = await db.select().from(users).where(eq(users.id, userId));
        return userResult[0] || null;
      }
      
      // 在Edge Runtime中通过API获取用户信息
      // 注意：这种方法在中间件中可能不适用，因为中间件不能发起fetch请求
      // 我们需要在中间件中直接返回错误，让客户端重新获取用户信息
      return null;
    } catch (error) {
      console.error('根据ID获取用户时出错:', error);
      return null;
    }
  }
}