'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { PaymentModal } from '@/components/payment/payment-modal';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  planId: string;
}

interface PricingCardProps {
  tier: PricingTier;
}

export function PricingCard({ tier }: PricingCardProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handlePurchase = () => {
    if (!user) {
      // 如果用户未登录，跳转到登录页面
      window.location.href = '/auth/login';
      return;
    }
    
    setIsModalOpen(true);
  };
  
  // 解析计费周期
  const parseBillingCycle = () => {
    if (tier.period.includes('月')) return 'monthly';
    if (tier.period.includes('季')) return 'quarterly';
    if (tier.period.includes('年')) return 'yearly';
    return 'monthly';
  };
  
  return (
    <>
      <Card
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
          <Button 
            className="w-full font-headline" 
            variant={tier.isPopular ? 'default' : 'outline'} 
            size="lg"
            onClick={handlePurchase}
          >
            立即购买
          </Button>
        </CardFooter>
      </Card>
      
      {user && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          planId={tier.planId}
          planName={tier.name}
          price={parseFloat(tier.price.replace('¥', '')) || 0}
          billingCycle={parseBillingCycle()}
        />
      )}
    </>
  );
}