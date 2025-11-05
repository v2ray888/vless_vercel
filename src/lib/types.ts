export interface Plan {
  id: string;
  name: string;
  price_monthly: number | null;
  price_quarterly: number | null;
  price_yearly: number | null;
  server_group: string;
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  user_name?: string;
  user_email?: string;
  plan_name: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  status: string | null;
  planId: string | null;
  endDate: string | null;
  referredById: string | null;
  subscriptionUrlToken: string | null;
}

export interface ServerGroup {
  id: string;
  name: string;
  apiUrl: string | null;
  apiKey: string | null;
  server_count: number;
  nodes: any[];
}

export interface RedemptionCode {
  id: string;
  code: string;
  planId: string;
  status: 'available' | 'used';
  createdAt: string;
  usedAt: string | null;
  usedById: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'expired';
}

export interface Affiliate {
  id: string;
  userId: string;
  referralCode: string;
  referralCount: number;
  totalCommission: number;
  pendingCommission: number;
}

export interface Withdrawal {
  id: string;
  affiliateId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'rejected';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface Tutorial {
  id: string;
  title: string;
  content: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  uuid: string;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate: string;
}