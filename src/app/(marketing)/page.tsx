import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { placeholderImages } from '@/lib/placeholder-images';
import { SeoSettings } from '@/types/seo';
import { Metadata } from 'next';
import { PricingCard } from '@/components/payment/pricing-card';

// 定义SEO设置的默认值
const DEFAULT_SEO_SETTINGS: SeoSettings = {
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
};

// 服务器端获取SEO设置的函数
async function getSeoSettings(): Promise<SeoSettings> {
  // 在构建时避免连接到本地API
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return DEFAULT_SEO_SETTINGS;
  }
  
  try {
    // 在服务器端获取SEO设置
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9102'}/api/seo-settings`, {
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

// 生成页面元数据
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();
  
  return {
    title: settings.site_name,
    description: settings.site_description,
    keywords: settings.site_keywords?.split(','),
    authors: settings.site_author ? [{ name: settings.site_author }] : [],
    robots: settings.site_robots,
    openGraph: {
      title: settings.og_title || settings.site_name,
      description: settings.og_description || settings.site_description,
      images: settings.og_image ? [settings.og_image] : [],
      type: settings.og_type as any,
    },
    twitter: {
      card: settings.twitter_card as any,
      site: settings.twitter_site,
      creator: settings.twitter_creator,
      title: settings.og_title || settings.site_name,
      description: settings.og_description || settings.site_description,
      images: settings.og_image ? [settings.og_image] : [],
    },
  };
}

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: 'userCog',
    title: '用户管理',
    description: '创建、更新和删除用户账户，轻松管理用户角色。',
  },
  {
    icon: 'package',
    title: '套餐管理',
    description: '定义和管理订阅套餐（包月、包季、包年）。',
  },
  {
    icon: 'server',
    title: '服务器组管理',
    description: '通过外部API和批量IP配置，轻松管理服务器组。',
  },
  {
    icon: 'receipt',
    title: '订单管理',
    description: '跟踪和管理所有用户订单，一目了然。',
  },
  {
    icon: 'ticket',
    title: '兑换码管理',
    description: '使用AI生成和管理订阅兑换码，安全高效。',
  },
  {
    icon: 'layout-dashboard',
    title: '用户仪表板',
    description: '用户可以查看订阅详情、节点信息和订单历史。',
  },
];

const pricingTiers = [
  {
    name: '月度套餐',
    price: '¥25',
    period: '/月',
    features: ['50GB 流量', '高速节点', '全平台支持', '工单支持'],
    planId: 'plan_monthly'
  },
  {
    name: '季度套餐',
    price: '¥68',
    period: '/季',
    features: ['200GB 流量', '高速节点', '全平台支持', '优先工单支持'],
    isPopular: true,
    planId: 'plan_quarterly'
  },
  {
    name: '年度套餐',
    price: '¥240',
    period: '/年',
    features: ['1TB 流量', '顶级高速节点', '全平台支持', '专属客户支持'],
    planId: 'plan_yearly'
  },
];

export default async function Home() {
  // 获取SEO设置和主页背景图片
  const settings = await getSeoSettings();
  const heroImage = placeholderImages.find(p => p.id === 'hero-network');

  return (
    <div className="flex flex-col">
      <section className="relative w-full py-20 md:py-32 lg:py-40">
        <div className="container mx-auto max-w-5xl px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-foreground">
              {settings.site_name}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground font-body">
              专业、稳定、高效的VLess订阅管理系统，为您提供极致的网络体验。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="font-headline">
                <Link href="#pricing">选择套餐</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-headline"
                asChild
              >
                <Link href="/auth/login">开始使用</Link>
              </Button>
            </div>
          </div>
        </div>
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover -z-10 opacity-5"
            data-ai-hint={heroImage.imageHint}
          />
        )}
      </section>

      <section id="features" className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">
              核心功能
            </h2>
            <p className="mt-4 text-muted-foreground font-body">
              我们提供一整套强大的工具来管理您的订阅服务。
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const LucideIcon = Icons[feature.icon as keyof typeof Icons] || ArrowRight;
              return (
                <Card key={feature.title} className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <LucideIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-headline font-semibold">{feature.title}</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground font-body">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="w-full py-16 md:py-24 bg-card/50">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">
              服务套餐
            </h2>
            <p className="mt-4 text-muted-foreground font-body">
              选择最适合您的套餐，立即开始。
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-start">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}