# SEO设置使用指南

## 概述

本指南将帮助您理解和使用系统中的SEO设置功能。SEO（搜索引擎优化）设置允许您优化网站在搜索引擎中的表现，提高网站的可见性和排名。

## SEO设置选项

### 1. 通用SEO设置

#### 网站名称 (site_name)
- **用途**: 网站的显示名称
- **建议**: 使用简洁、易记的名称

#### 网站地址 (site_url)
- **用途**: 网站的主URL
- **建议**: 确保URL正确无误

#### 网站描述 (site_description)
- **用途**: 网站的简短描述，用于SEO优化和社交媒体分享
- **建议**: 
  - 长度控制在150-160个字符以内
  - 准确描述网站的主要功能和服务
  - 包含相关关键词

#### 关键字 (site_keywords)
- **用途**: 用于SEO优化的关键词
- **建议**: 
  - 使用逗号分隔多个关键词
  - 选择与网站内容相关的关键词
  - 避免关键词堆砌

#### 网站作者 (site_author)
- **用途**: 网站作者或公司名称
- **建议**: 填写真实的作者或公司名称

#### Robots标签 (site_robots)
- **用途**: 控制搜索引擎爬虫的行为
- **选项**:
  - `index, follow`: 允许索引和跟踪链接（推荐）
  - `noindex, follow`: 禁止索引但允许跟踪链接
  - `index, nofollow`: 允许索引但禁止跟踪链接
  - `noindex, nofollow`: 禁止索引和跟踪链接

### 2. Open Graph设置

Open Graph协议允许您的网站在社交媒体平台上更好地展示。

#### Open Graph标题 (og_title)
- **用途**: 社交媒体分享时显示的标题
- **建议**: 与页面标题保持一致或更具吸引力

#### Open Graph描述 (og_description)
- **用途**: 社交媒体分享时显示的描述
- **建议**: 简洁明了，吸引用户点击

#### Open Graph图片URL (og_image)
- **用途**: 社交媒体分享时显示的图片
- **建议**: 
  - 使用1200x630像素的图片
  - 确保图片URL可访问
  - 图片应与内容相关

#### Open Graph类型 (og_type)
- **用途**: 指定内容类型
- **选项**:
  - `website`: 网站
  - `article`: 文章
  - `profile`: 个人资料

### 3. Twitter卡片设置

Twitter卡片允许您的网站内容在Twitter上更好地展示。

#### Twitter卡片类型 (twitter_card)
- **用途**: 指定Twitter卡片类型
- **选项**:
  - `summary`: 摘要卡片
  - `summary_large_image`: 大图摘要卡片
  - `app`: 应用卡片
  - `player`: 播放器卡片

#### Twitter站点账号 (twitter_site)
- **用途**: 站点的Twitter账号
- **格式**: @站点Twitter账号

#### Twitter创作者账号 (twitter_creator)
- **用途**: 内容创作者的Twitter账号
- **格式**: @创作者Twitter账号

## 最佳实践

### 1. 内容优化
- 确保标题和描述准确反映页面内容
- 使用相关关键词，但避免过度使用
- 定期更新SEO设置以反映网站内容的变化

### 2. 图片优化
- 为Open Graph和Twitter卡片使用高质量图片
- 确保图片URL稳定，避免失效
- 为图片添加适当的alt文本

### 3. 社交媒体优化
- 填写Twitter账号信息以增强社交媒体存在感
- 根据内容类型选择合适的卡片类型

## 常见问题

### 1. SEO设置保存后没有立即生效怎么办？
搜索引擎需要时间来重新抓取和索引您的网站。通常需要几天到几周的时间才能看到效果。

### 2. 如何测试Open Graph和Twitter卡片设置？
- 使用Facebook的[Sharing Debugger](https://developers.facebook.com/tools/debug/)测试Open Graph设置
- 使用Twitter的[Card Validator](https://cards-dev.twitter.com/validator)测试Twitter卡片设置

### 3. 关键词应该如何选择？
- 选择与您的业务和内容相关的关键词
- 使用工具如Google关键词规划师来研究关键词
- 关注长尾关键词，它们通常竞争较小但更具体

## 技术实现

### 在页面中使用SEO设置

系统提供了`SeoHead`组件，可以轻松在页面中使用SEO设置：

```tsx
import { SeoHead } from '@/components/shared/seo-head';
import Head from 'next/head';

export default function MyPage() {
  return (
    <>
      <Head>
        <SeoHead 
          title="页面标题"
          description="页面描述"
          keywords="关键词1,关键词2"
        />
      </Head>
      <div>
        {/* 页面内容 */}
      </div>
    </>
  );
}
```

### 自定义SEO设置

您还可以为特定页面自定义SEO设置：

```tsx
<SeoHead 
  title="自定义页面标题"
  description="自定义页面描述"
  ogTitle="社交媒体分享标题"
  ogImage="https://example.com/custom-image.jpg"
/>
```

## 结论

通过合理配置SEO设置，您可以显著提高网站在搜索引擎中的表现，吸引更多访问者。建议定期检查和更新SEO设置，以确保它们与网站内容保持一致。