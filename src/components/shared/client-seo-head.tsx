'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

type SeoSettings = {
  site_name?: string;
  site_description?: string;
  site_keywords?: string;
  site_author?: string;
  site_robots?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_site?: string;
  twitter_creator?: string;
};

type ClientSeoHeadProps = {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
};

export function ClientSeoHead({
  title,
  description,
  keywords,
  author,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
  twitterCard,
  twitterSite,
  twitterCreator,
}: ClientSeoHeadProps) {
  const [settings, setSettings] = useState<SeoSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/seo-settings');
        const result = await response.json();
        
        if (result.success) {
          setSettings(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch SEO settings');
        }
      } catch (error) {
        console.error('Failed to fetch SEO settings:', error);
        // 使用默认设置
        setSettings({
          site_name: 'Clash VLess VPN 官网',
          site_description: '高性能 VPN 工具 Clash 与 VLESS 协议结合，提供稳定、安全、快速的科学上网解决方案，支持 Windows、Mac、Android 等平台。',
          site_keywords: 'Clash VPN,VLESS VPN,科学上网,Clash配置教程,Clash客户端下载,Clash节点,Clash订阅,Clash for Windows,Clash for Android,Clash官网',
          site_author: 'Clash',
          site_robots: 'index, follow',
          og_title: 'Clash VLess VPN 官网',
          og_description: '高性能 VPN 工具 Clash 与 VLESS 协议结合，提供稳定、安全、快速的科学上网解决方案，支持 Windows、Mac、Android 等平台。',
          og_image: '',
          og_type: 'website',
          twitter_card: 'summary',
          twitter_site: '',
          twitter_creator: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 使用传入的值或默认设置
  const siteTitle = title || settings.site_name || 'VLess Manager Pro';
  const siteDescription = description || settings.site_description || 'Advanced VLess Subscription Management System';
  const siteKeywords = keywords || settings.site_keywords || 'vless,subscription,management';
  const siteAuthor = author || settings.site_author || 'VLess Manager Team';
  const siteRobots = settings.site_robots || 'index, follow';
  
  // Open Graph 设置
  const openGraphTitle = ogTitle || settings.og_title || siteTitle;
  const openGraphDescription = ogDescription || settings.og_description || siteDescription;
  const openGraphImage = ogImage || settings.og_image || '';
  const openGraphType = ogType || settings.og_type || 'website';
  
  // Twitter 设置
  const twitterCardType = twitterCard || settings.twitter_card || 'summary';
  const twitterSiteHandle = twitterSite || settings.twitter_site || '';
  const twitterCreatorHandle = twitterCreator || settings.twitter_creator || '';

  // 如果仍在加载，不渲染任何内容
  if (loading) {
    return null;
  }

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      {siteKeywords && <meta name="keywords" content={siteKeywords} />}
      <meta name="author" content={siteAuthor} />
      <meta name="robots" content={siteRobots} />
      
      {/* Open Graph */}
      <meta property="og:title" content={openGraphTitle} />
      <meta property="og:description" content={openGraphDescription} />
      {openGraphImage && <meta property="og:image" content={openGraphImage} />}
      <meta property="og:type" content={openGraphType} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCardType} />
      {twitterSiteHandle && <meta name="twitter:site" content={twitterSiteHandle} />}
      {twitterCreatorHandle && <meta name="twitter:creator" content={twitterCreatorHandle} />}
      <meta name="twitter:title" content={openGraphTitle} />
      <meta name="twitter:description" content={openGraphDescription} />
      {openGraphImage && <meta name="twitter:image" content={openGraphImage} />}
    </Head>
  );
}