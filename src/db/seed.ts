import 'dotenv/config';
import { getDb } from './index';
import * as schema from './schema';
import {
  mockUsers,
  mockPlans,
  mockServerGroups,
  mockOrders,
  mockRedemptionCodes,
  mockAnnouncements,
  mockTutorials,
  mockAffiliates,
} from '../lib/data';
// 动态导入bcryptjs以避免Edge Runtime问题
import { randomBytes } from 'crypto';
import { sql } from 'drizzle-orm';

async function seed() {
  const db = getDb();
  console.log('Seeding database...');

  // Clear existing data in the correct order to avoid foreign key violations
  await db.delete(schema.withdrawals);
  await db.delete(schema.settings);
  await db.delete(schema.orders);
  await db.delete(schema.redemptionCodes);
  await db.delete(schema.affiliates);
  await db.delete(schema.users);
  await db.delete(schema.plans);
  await db.delete(schema.serverGroups);
  await db.delete(schema.announcements);
  await db.delete(schema.tutorials);
  
  console.log('Cleared existing data.');

  // Ensure admin email from .env is included in the mock users if not already present
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  if (!mockUsers.some(u => (u as any).email === adminEmail)) {
    mockUsers.unshift({
        id: 'usr_admin',
        name: 'Admin',
        email: adminEmail,
        status: 'active',
        plan: '年度套餐',
        endDate: '2099-12-31'
    } as any);
  }


  // Seed Server Groups
  await db.insert(schema.serverGroups).values(
    mockServerGroups.map(sg => ({
      id: sg.id,
      name: sg.name,
      apiUrl: sg.api_url,
      apiKey: sg.api_key,
      server_count: sg.server_count,
      nodes: sg.nodes,
    }))
  );
  console.log('Seeded server groups.');

  // Seed Plans
  const seededPlans = await db.insert(schema.plans).values(
    mockPlans.map(p => ({
      id: (p as any).id,
      name: (p as any).name,
      price_monthly: p.price_monthly || null,
      price_quarterly: p.price_quarterly || null,
      price_yearly: p.price_yearly || null,
      serverGroupId: mockServerGroups.find(sg => sg.name === (p as any).server_group)!.id,
      status: (p as any).status,
    }))
  ).returning();
  console.log('Seeded plans.');

  // Seed Users
  // 动态导入bcryptjs
  const bcrypt = (await import('bcryptjs')).default;
  const hashedPassword = await bcrypt.hash('password', 10);
  const seededUsers = await db.insert(schema.users).values(
    mockUsers.map(u => ({
      id: (u as any).id,
      name: (u as any).name,
      email: (u as any).email,
      password: hashedPassword,
      status: (u as any).status,
      planId: seededPlans.find(p => p.name === u.plan)?.id || null,
      endDate: (u as any).endDate ? new Date((u as any).endDate) : null,
      subscriptionUrlToken: randomBytes(16).toString('hex'),
    }))
  ).returning();
  console.log('Seeded users.');
  
  // Seed Orders
  await db.insert(schema.orders).values(
    mockOrders.map(o => ({
      id: o.id,
      userId: seededUsers.find(u => u.email === (o as any).user_email)!.id,
      planId: seededPlans.find(p => p.name === (o as any).plan_name)!.id,
      amount: o.amount,
      date: new Date(o.date),
      status: o.status,
    }))
  );
  console.log('Seeded orders.');

  // Seed Redemption Codes
  await db.insert(schema.redemptionCodes).values(
    mockRedemptionCodes.map(rc => ({
        id: rc.id,
        code: rc.code,
        planId: seededPlans.find(p => p.name === (rc as any).plan)!.id,
        status: rc.status,
        createdAt: new Date(rc.created_at),
        usedAt: rc.used_at ? new Date(rc.used_at) : null,
        usedById: rc.used_by ? seededUsers.find(u => u.email === rc.used_by)?.id : null,
    }))
  );
  console.log('Seeded redemption codes.');

  // Seed Announcements
  await db.insert(schema.announcements).values(
      mockAnnouncements.map(a => ({
          id: String(a.id),
          title: a.title,
          content: a.content,
          date: new Date(a.date),
      }))
  );
  console.log('Seeded announcements.');

  // Seed Tutorials
  await db.insert(schema.tutorials).values(
      mockTutorials.map(t => ({
          id: t.id,
          title: t.title,
          content: t.content,
      }))
  );
  console.log('Seeded tutorials.');

  // Seed Affiliates
  const seededAffiliates = await db.insert(schema.affiliates).values(mockAffiliates.map(aff => ({
    id: (aff as any).id,
    userId: seededUsers.find(u => u.id === (aff as any).userId)!.id,
    referralCode: randomBytes(8).toString('hex'),
    referralCount: (aff as any).referralCount,
    totalCommission: (aff as any).totalCommission,
    pendingCommission: (aff as any).pendingCommission,
  }))).returning();
  console.log('Seeded affiliates.');

  // Seed Withdrawals
   await db.insert(schema.withdrawals).values([
    { id: 'wd_1', affiliateId: seededAffiliates[1].id, amount: 75.50, date: new Date('2024-06-27'), status: 'completed' },
    { id: 'wd_2', affiliateId: seededAffiliates[0].id, amount: 120.50, date: new Date('2024-07-02'), status: 'pending' },
  ]);
  console.log('Seeded withdrawals.');


  // Seed default settings
  await db.insert(schema.settings).values([
    { key: 'affiliate_commission_rate', value: { value: 20 } },
    { key: 'site_name', value: { value: 'Clash VLess VPN 官网' } },
    { key: 'site_url', value: { value: 'https://clash.cam' } },
    { key: 'site_description', value: { value: '高性能 VPN 工具 Clash 与 VLESS 协议结合，提供稳定、安全、快速的科学上网解决方案，支持 Windows、Mac、Android 等平台。' } },
    { key: 'site_keywords', value: { value: 'Clash VPN,VLESS VPN,科学上网,Clash配置教程,Clash客户端下载,Clash节点,Clash订阅,Clash for Windows,Clash for Android,Clash官网' } },
    { key: 'site_author', value: { value: 'Clash' } },
    { key: 'site_robots', value: { value: 'index, follow' } },
    { key: 'og_title', value: { value: 'Clash VLess VPN 官网' } },
    { key: 'og_description', value: { value: '高性能 VPN 工具 Clash 与 VLESS 协议结合，提供稳定、安全、快速的科学上网解决方案，支持 Windows、Mac、Android 等平台。' } },
    { key: 'og_image', value: { value: 'https://example.com/og-image.jpg' } },
    { key: 'og_type', value: { value: 'website' } },
    { key: 'twitter_card', value: { value: 'summary' } },
    { key: 'twitter_site', value: { value: '@clashvpn' } },
    { key: 'twitter_creator', value: { value: '@clashvpn' } },
  ]);
  console.log('Seeded default settings.');


  console.log('Database seeding complete!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});