/**
 * 解析节点文本格式为系统使用的JSON格式
 * 输入格式示例:
 * 8.39.125.153:2053#SG 官方优选 65ms
 * 8.35.211.239:2053#SG 官方优选 67ms
 * 
 * @param nodeText 节点文本字符串
 * @returns 解析后的节点对象数组
 */
export function parseNodeText(nodeText: string): any[] {
  if (!nodeText || !nodeText.trim()) {
    return [];
  }

  const lines = nodeText.trim().split('\n');
  const nodes = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      // 解析格式: IP:端口#地区代码 节点名称 延迟
      const match = line.match(/^([^:]+):(\d+)#(\w+)\s+(.+?)\s+(\d+)ms$/);
      
      if (match) {
        const [, ip, port, locationCode, name, speed] = match;
        
        // 根据地区代码确定完整地区名称
        const locationMap: Record<string, string> = {
          'SG': '新加坡',
          'US': '美国',
          'HK': '香港',
          'JP': '日本',
          'KR': '韩国',
          'TW': '台湾',
          'CN': '中国',
          'UK': '英国',
          'DE': '德国',
          'FR': '法国',
        };
        
        const location = locationMap[locationCode] || locationCode;
        
        nodes.push({
          id: i + 1,
          name: name,
          location: location,
          status: 'online', // 默认为在线状态
          speed: `${speed}ms`,
          ip: ip,
          port: parseInt(port),
          locationCode: locationCode
        });
      }
    } catch (error) {
      console.warn(`解析节点行时出错: ${line}`, error);
      // 即使某行解析失败，也继续处理其他行
    }
  }

  return nodes;
}

/**
 * 将节点数组转换为文本格式
 * @param nodes 节点对象数组
 * @returns 节点文本字符串
 */
export function formatNodeText(nodes: any[]): string {
  if (!nodes || nodes.length === 0) {
    return '';
  }

  // 地区代码映射
  const locationCodeMap: Record<string, string> = {
    '新加坡': 'SG',
    '美国': 'US',
    '香港': 'HK',
    '日本': 'JP',
    '韩国': 'KR',
    '台湾': 'TW',
    '中国': 'CN',
    '英国': 'UK',
    '德国': 'DE',
    '法国': 'FR',
  };

  return nodes.map(node => {
    const locationCode = locationCodeMap[node.location] || node.locationCode || 'SG';
    const ip = node.ip || '0.0.0.0';
    const port = node.port || 2053;
    const name = node.name || '未知节点';
    const speed = node.speed ? parseInt(node.speed) : 0;
    
    return `${ip}:${port}#${locationCode} ${name} ${speed}ms`;
  }).join('\n');
}

/**
 * 从文本区域内容创建节点数组
 * @param textAreaValue 文本区域的值
 * @returns 节点对象数组
 */
export function createNodesFromTextArea(textAreaValue: string): any[] {
  // 如果文本区域内容是JSON格式，直接解析
  if (textAreaValue.trim().startsWith('[') || textAreaValue.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(textAreaValue);
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        return [parsed];
      }
    } catch (e) {
      // 如果JSON解析失败，继续尝试文本解析
    }
  }
  
  // 否则使用文本解析
  return parseNodeText(textAreaValue);
}