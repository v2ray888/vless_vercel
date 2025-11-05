import React from 'react';
import { getSettings } from '@/app/admin/settings/actions';

type SeoHeadProps = {
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

export async function SeoHead({
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
}: SeoHeadProps) {
  // 获取默认SEO设置
  const settingKeys = [
    'site_name',
    'site_description',
    'site_keywords',
    'site_author',
    'site_robots',
    'og_title',
    'og_description',
    'og_image',
    'og_type',
    'twitter_card',
    'twitter_site',
    'twitter_creator',
  ] as const;
  
  const settings = await getSettings([...settingKeys]);
  
  // 使用传入的值或默认设置
  const siteTitle = title || `${settings.site_name || 'Clash VLess VPN 官网'}`;
  const siteDescription = description || (settings.site_description as string) || '';
  const siteKeywords = keywords || (settings.site_keywords as string) || '';
  const siteAuthor = author || (settings.site_author as string) || '';
  const siteRobots = (settings.site_robots as string) || 'index, follow';
  
  // Open Graph 设置
  const openGraphTitle = ogTitle || (settings.og_title as string) || siteTitle;
  const openGraphDescription = ogDescription || (settings.og_description as string) || siteDescription;
  const openGraphImage = ogImage || (settings.og_image as string) || '';
  const openGraphType = ogType || (settings.og_type as string) || 'website';
  
  // Twitter 设置
  const twitterCardType = twitterCard || (settings.twitter_card as string) || 'summary';
  const twitterSiteHandle = twitterSite || (settings.twitter_site as string) || '';
  const twitterCreatorHandle = twitterCreator || (settings.twitter_creator as string) || '';

  return (
    <>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
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
    </>
  );
}