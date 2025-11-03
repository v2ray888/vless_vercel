/**
 * V2Ray面板API客户端
 * 用于与外部V2Ray/X-UI面板进行通信
 */

interface V2RayPanelConfig {
  apiUrl: string; // 面板API地址
  apiKey: string; // API密钥
}

/**
 * 获取服务状态信息
 * @param config 面板配置
 * @returns 服务状态
 */
export async function getV2RayStatus(config: V2RayPanelConfig): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await fetch(`${config.apiUrl}/api/status`, {
      method: 'GET',
      headers: {
        'X-API-Key': config.apiKey
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message || '获取服务状态失败' };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '未知错误' };
  }
}

/**
 * 获取所有有效UUID列表
 * @param config 面板配置
 * @returns UUID列表
 */
export async function getV2RayUUIDs(config: V2RayPanelConfig): Promise<{ success: boolean; uuids?: string[]; message?: string }> {
  try {
    const response = await fetch(`${config.apiUrl}/api/uuids`, {
      method: 'GET',
      headers: {
        'X-API-Key': config.apiKey
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // 适配实际的响应格式
      if (data.success && data.data && data.data.uuids) {
        return { success: true, uuids: data.data.uuids };
      }
      return { success: true, uuids: data.uuids || data };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message || '获取UUID列表失败' };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '未知错误' };
  }
}

/**
 * 添加新的UUID
 * @param config 面板配置
 * @param uuid UUID
 * @returns 添加结果
 */
export async function addV2RayUUID(config: V2RayPanelConfig, uuid: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${config.apiUrl}/api/uuid/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey
      },
      body: JSON.stringify({ uuid })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.error || data.message || '添加UUID失败' };
      }
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.error || errorData.message || '添加UUID失败' };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '未知错误' };
  }
}

/**
 * 删除指定UUID
 * @param config 面板配置
 * @param uuid UUID
 * @returns 删除结果
 */
export async function removeV2RayUUID(config: V2RayPanelConfig, uuid: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${config.apiUrl}/api/uuid/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey
      },
      body: JSON.stringify({ uuid })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.error || data.message || '删除UUID失败' };
      }
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.error || errorData.message || '删除UUID失败' };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '未知错误' };
  }
}

/**
 * 验证UUID是否有效
 * @param config 面板配置
 * @param uuid UUID
 * @returns 验证结果
 */
export async function validateV2RayUUID(config: V2RayPanelConfig, uuid: string): Promise<{ success: boolean; valid?: boolean; message?: string }> {
  try {
    const response = await fetch(`${config.apiUrl}/api/uuid/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey
      },
      body: JSON.stringify({ uuid })
    });
    
    if (response.ok) {
      const data = await response.json();
      // 适配实际的响应格式
      if (data.success && data.data) {
        return { success: true, valid: data.data.valid };
      } else if (typeof data.valid === 'boolean') {
        return { success: true, valid: data.valid };
      } else {
        return { success: false, message: '无法解析验证结果' };
      }
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.error || errorData.message || '验证UUID失败' };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '未知错误' };
  }
}