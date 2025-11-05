import React from 'react';
import { SeoSettings } from '@/types/seo';

// 定义SEO设置的默认值
const DEFAULT_SEO_SETTINGS: SeoSettings = {
  site_name: 'VLess Manager Pro',
  site_description: 'Advanced VLess Subscription Management System',
  site_keywords: 'vless,subscription,management',
  site_author: 'VLess Manager Team',
  site_robots: 'index, follow',
  og_title: 'VLess Manager Pro',
  og_description: 'Advanced VLess Subscription Management System',
  og_image: '',
  og_type: 'website',
  twitter_card: 'summary',
  twitter_site: '',
  twitter_creator: '',
};

// 服务器端获取SEO设置的函数
async function getSeoSettings(): Promise<SeoSettings> {
  try {
    // 注意：在实际部署时，您需要使用正确的API URL
    const response = await fetch('http://localhost:9102/api/seo-settings', {
      next: { revalidate: 3600 } // 每小时重新验证一次
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch SEO settings: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return { ...DEFAULT_SEO_SETTINGS, ...result.data };
    }
  } catch (error) {
    console.error('Failed to fetch SEO settings:', error);
  }
  
  // 返回默认设置
  return DEFAULT_SEO_SETTINGS;
}

export async function ServerSeoHead() {
  const settings = await getSeoSettings();
  
  return (
    <>
      <title>{settings.site_name}</title>
      <meta name="description" content={settings.site_description} />
      {settings.site_keywords && <meta name="keywords" content={settings.site_keywords} />}
      <meta name="author" content={settings.site_author} />
      <meta name="robots" content={settings.site_robots} />
      
      {/* Open Graph */}
      <meta property="og:title" content={settings.og_title} />
      <meta property="og:description" content={settings.og_description} />
      {settings.og_image && <meta property="og:image" content={settings.og_image} />}
      <meta property="og:type" content={settings.og_type} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={settings.twitter_card} />
      {settings.twitter_site && <meta name="twitter:site" content={settings.twitter_site} />}
      {settings.twitter_creator && <meta name="twitter:creator" content={settings.twitter_creator} />}
      <meta name="twitter:title" content={settings.og_title} />
      <meta name="twitter:description" content={settings.og_description} />
      {settings.og_image && <meta name="twitter:image" content={settings.og_image} />}
    </>
  );
}