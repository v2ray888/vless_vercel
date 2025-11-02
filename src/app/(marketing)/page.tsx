'use client';

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
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const features = [
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
  },
  {
    name: '季度套餐',
    price: '¥68',
    period: '/季',
    features: ['200GB 流量', '高速节点', '全平台支持', '优先工单支持'],
    isPopular: true,
  },
  {
    name: '年度套餐',
    price: '¥240',
    period: '/年',
    features: ['1TB 流量', '顶级高速节点', '全平台支持', '专属客户支持'],
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const heroImage = placeholderImages.find(p => p.id === 'hero-network');

  const handleGetStarted = () => {
    if (user) {
      // 如果用户已登录，跳转到仪表板
      router.push('/dashboard');
    } else {
      // 如果用户未登录，跳转到登录页面
      router.push('/auth/login');
    }
  };

  return (
    <div className="flex flex-col">
      <section className="relative w-full py-20 md:py-32 lg:py-40">
        <div className="container mx-auto max-w-5xl px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-foreground">
              VLess Manager Pro
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
                onClick={handleGetStarted}
                disabled={loading && isClient}
              >
                {loading && isClient ? '加载中...' : '开始使用'}
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
              <Card
                key={tier.name}
                className={tier.isPopular ? 'border-primary shadow-lg relative transition-all hover:shadow-xl hover:-translate-y-1' : 'transition-all hover:shadow-lg hover:-translate-y-1'}
              >
                {tier.isPopular && (
                  <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold font-headline">
                      热门推荐
                    </div>
                  </div>
                )}
                <CardHeader className="pt-12">
                  <CardTitle className="font-headline">{tier.name}</CardTitle>
                  <CardDescription className='pt-2'>
                    <span className="text-4xl font-bold font-headline text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 font-body">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full font-headline" variant={tier.isPopular ? 'default' : 'outline'} size="lg">
                    立即购买
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}