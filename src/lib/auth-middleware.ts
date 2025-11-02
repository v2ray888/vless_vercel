import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AuthService } from '@/services/auth-service';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string | null;
    isAdmin: boolean;
  };
}

/**
 * 验证认证令牌的中间件
 * @param request Next.js请求对象
 * @returns 验证结果或错误响应
 */
export async function validateAuthToken(request: NextRequest) {
  try {
    // 从cookie中获取令牌
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { 
        success: false, 
        error: '未提供认证令牌'
      };
    }
    
    // 验证JWT令牌
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secret);
    
    // 验证用户是否存在
    // 在Edge Runtime中，我们不能直接查询数据库
    // 但我们可以验证JWT令牌的有效性，假设令牌有效则用户存在
    try {
      const user = await AuthService.getUserById(payload.id as string);
      if (user) {
        // 添加用户信息到请求对象
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: AuthService.isUserAdmin(user.email)
        };
        
        return { 
          success: true, 
          user: authenticatedRequest.user 
        };
      }
      
      // 如果在Node.js环境中查询失败，但在Edge Runtime中我们可以信任JWT令牌
      if (process.env.NEXT_RUNTIME === 'edge') {
        // 创建一个基本的用户对象
        const basicUser = {
          id: payload.id as string,
          email: payload.email as string,
          name: payload.name as string | null,
          isAdmin: payload.isAdmin as boolean
        };
        
        // 添加用户信息到请求对象
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = basicUser;
        
        return { 
          success: true, 
          user: basicUser
        };
      }
    } catch (dbError) {
      // 在Edge Runtime中数据库查询会失败，但我们仍然可以信任JWT令牌
      if (process.env.NEXT_RUNTIME === 'edge') {
        // 创建一个基本的用户对象
        const basicUser = {
          id: payload.id as string,
          email: payload.email as string,
          name: payload.name as string | null,
          isAdmin: payload.isAdmin as boolean
        };
        
        // 添加用户信息到请求对象
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = basicUser;
        
        return { 
          success: true, 
          user: basicUser
        };
      }
      
      console.error('验证用户时出错:', dbError);
    }
    
    return { 
      success: false, 
      error: '用户不存在'
    };

  } catch (error) {
    console.error('验证认证令牌时出错:', error);
    return { 
      success: false, 
      error: '无效的认证令牌'
    };
  }
}