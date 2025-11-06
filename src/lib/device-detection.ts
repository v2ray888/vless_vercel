/**
 * 检测设备类型
 * @param userAgent 用户代理字符串
 * @returns 设备类型
 */
export function detectDeviceType(userAgent: string): 'mobile' | 'desktop' {
  // 移动设备的正则表达式
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // 检查是否匹配移动设备
  if (mobileRegex.test(userAgent)) {
    return 'mobile';
  }
  
  // 默认为桌面设备
  return 'desktop';
}

/**
 * 检查是否为微信浏览器
 * @param userAgent 用户代理字符串
 * @returns 是否为微信浏览器
 */
export function isWeChatBrowser(userAgent: string): boolean {
  return /MicroMessenger/i.test(userAgent);
}

/**
 * 检查是否为支付宝浏览器
 * @param userAgent 用户代理字符串
 * @returns 是否为支付宝浏览器
 */
export function isAlipayBrowser(userAgent: string): boolean {
  return /AlipayClient/i.test(userAgent);
}