import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core';

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(), // references to users.id
  planId: text('plan_id').notNull(), // references to plans.id
  userUUID: text('user_uuid').notNull().unique(), // V2Ray面板中的用户UUID
  subscriptionToken: text('subscription_token').notNull().unique(), // 用于生成订阅地址的专属令牌
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  trafficTotal: integer('traffic_total').notNull(), // 总流量（单位：bytes）
  trafficUsed: integer('traffic_used').notNull().default(0), // 已用流量（单位：bytes）
  status: text('status').notNull(), // 'active', 'expired', 'suspended'
}, (table) => {
  return {
    userIdIndex: index('subscriptions_user_id_idx').on(table.userId),
    planIdIndex: index('subscriptions_plan_id_idx').on(table.planId),
    userUUIDIndex: index('subscriptions_user_uuid_idx').on(table.userUUID),
    subscriptionTokenIndex: index('subscriptions_token_idx').on(table.subscriptionToken),
    statusIndex: index('subscriptions_status_idx').on(table.status),
  };
});