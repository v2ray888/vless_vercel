import { pgTable, text, varchar, integer, real, timestamp, jsonb, boolean, pgEnum, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Main Application Tables
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'),
  status: text('status'), // 'active', 'inactive', 'suspended'
  planId: text('plan_id').references(() => plans.id),
  endDate: timestamp('end_date'),
  referredById: text('referred_by_id').references((): any => users.id),
  subscriptionUrlToken: text('subscription_url_token').unique(),
}, (table) => {
  return {
    emailIndex: index('users_email_idx').on(table.email),
    planIdIndex: index('users_plan_id_idx').on(table.planId),
  };
});

export const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  price_monthly: real('price_monthly'),
  price_quarterly: real('price_quarterly'),
  price_yearly: real('price_yearly'),
  serverGroupId: text('server_group_id').notNull().references(() => serverGroups.id),
  status: text('status').notNull(), // 'active', 'inactive'
}, (table) => {
  return {
    nameIndex: index('plans_name_idx').on(table.name),
    statusIndex: index('plans_status_idx').on(table.status),
  };
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull().references(() => plans.id),
  amount: real('amount').notNull(),
  date: timestamp('date').notNull(),
  status: text('status').notNull(), // 'completed', 'pending', 'failed'
}, (table) => {
  return {
    userIdIndex: index('orders_user_id_idx').on(table.userId),
    planIdIndex: index('orders_plan_id_idx').on(table.planId),
    statusIndex: index('orders_status_idx').on(table.status),
  };
});

export const serverGroups = pgTable('server_groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  apiUrl: text('api_url'),
  apiKey: text('api_key'),
  server_count: integer('server_count').notNull(),
  nodes: jsonb('nodes').default('[]'),
}, (table) => {
  return {
    nameIndex: index('server_groups_name_idx').on(table.name),
  };
});

export const redemptionCodes = pgTable('redemption_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  planId: text('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  status: text('status').notNull(), // 'available', 'used'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  usedAt: timestamp('used_at'),
  usedById: text('used_by_id').references(() => users.id, { onDelete: 'set null' }),
}, (table) => {
  return {
    codeIndex: index('redemption_codes_code_idx').on(table.code),
    planIdIndex: index('redemption_codes_plan_id_idx').on(table.planId),
    statusIndex: index('redemption_codes_status_idx').on(table.status),
    usedByIdIndex: index('redemption_codes_used_by_id_idx').on(table.usedById),
  };
});

export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // 'percentage', 'fixed'
  value: real('value').notNull(),
  usageLimit: integer('usage_limit').notNull(),
  usageCount: integer('usage_count').notNull().default(0),
  status: text('status').notNull(), // 'active', 'expired'
}, (table) => {
  return {
    codeIndex: index('coupons_code_idx').on(table.code),
    statusIndex: index('coupons_status_idx').on(table.status),
  };
});

export const affiliates = pgTable('affiliates', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  referralCode: text('referral_code').notNull().unique(),
  referralCount: integer('referral_count').notNull().default(0),
  totalCommission: real('total_commission').notNull().default(0),
  pendingCommission: real('pending_commission').notNull().default(0),
}, (table) => {
  return {
    userIdIndex: index('affiliates_user_id_idx').on(table.userId),
    referralCodeIndex: index('affiliates_referral_code_idx').on(table.referralCode),
  };
});

export const withdrawals = pgTable('withdrawals', {
  id: text('id').primaryKey(),
  affiliateId: text('affiliate_id').notNull().references(() => affiliates.id),
  amount: real('amount').notNull(),
  date: timestamp('date').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'rejected'
}, (table) => {
  return {
    affiliateIdIndex: index('withdrawals_affiliate_id_idx').on(table.affiliateId),
    statusIndex: index('withdrawals_status_idx').on(table.status),
  };
});

export const announcements = pgTable('announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  date: timestamp('date').notNull(),
}, (table) => {
  return {
    dateIndex: index('announcements_date_idx').on(table.date),
  };
});

export const tutorials = pgTable('tutorials', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
});

export const settings = pgTable('settings', {
    key: text('key').primaryKey(),
    value: jsonb('value'),
});


// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  plan: one(plans, {
    fields: [users.planId],
    references: [plans.id],
  }),
  orders: many(orders),
  redemptionCodesUsed: many(redemptionCodes),
  affiliateProfile: one(affiliates, {
    fields: [users.id],
    references: [affiliates.userId],
  }),
  referrer: one(users, {
    fields: [users.referredById],
    references: [users.id],
    relationName: 'referrer',
  }),
  referrals: many(users, {
    relationName: 'referrer',
  }),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
  serverGroup: one(serverGroups, {
    fields: [plans.serverGroupId],
    references: [serverGroups.id],
  }),
  orders: many(orders),
  redemptionCodes: many(redemptionCodes),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [orders.planId],
    references: [plans.id],
  }),
}));

export const serverGroupsRelations = relations(serverGroups, ({ many }) => ({
  plans: many(plans),
}));

export const redemptionCodesRelations = relations(redemptionCodes, ({ one }) => ({
  plan: one(plans, {
    fields: [redemptionCodes.planId],
    references: [plans.id],
  }),
  user: one(users, {
    fields: [redemptionCodes.usedById],
    references: [users.id],
  }),
}));

export const affiliatesRelations = relations(affiliates, ({ one, many }) => ({
  user: one(users, {
    fields: [affiliates.userId],
    references: [users.id],
  }),
  withdrawals: many(withdrawals),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [withdrawals.affiliateId],
    references: [affiliates.id],
  }),
}));