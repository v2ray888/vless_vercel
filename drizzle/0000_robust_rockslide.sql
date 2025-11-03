CREATE TABLE IF NOT EXISTS "affiliates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"referral_code" text NOT NULL,
	"referral_count" integer DEFAULT 0 NOT NULL,
	"total_commission" real DEFAULT 0 NOT NULL,
	"pending_commission" real DEFAULT 0 NOT NULL,
	CONSTRAINT "affiliates_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" real NOT NULL,
	"usage_limit" integer NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"amount" real NOT NULL,
	"date" timestamp NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_monthly" real,
	"price_quarterly" real,
	"price_yearly" real,
	"server_group_id" text NOT NULL,
	"status" text NOT NULL,
	CONSTRAINT "plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "redemption_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp,
	"used_by_id" text,
	CONSTRAINT "redemption_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "server_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"api_url" text,
	"api_key" text,
	"server_count" integer NOT NULL,
	"nodes" jsonb DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"user_uuid" text NOT NULL,
	"subscription_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"traffic_total" integer NOT NULL,
	"traffic_used" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	CONSTRAINT "subscriptions_user_uuid_unique" UNIQUE("user_uuid"),
	CONSTRAINT "subscriptions_subscription_token_unique" UNIQUE("subscription_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tutorials" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password" text,
	"status" text,
	"plan_id" text,
	"end_date" timestamp,
	"referred_by_id" text,
	"subscription_url_token" text,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_subscription_url_token_unique" UNIQUE("subscription_url_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "withdrawals" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"amount" real NOT NULL,
	"date" timestamp NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plans" ADD CONSTRAINT "plans_server_group_id_server_groups_id_fk" FOREIGN KEY ("server_group_id") REFERENCES "public"."server_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "redemption_codes" ADD CONSTRAINT "redemption_codes_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "redemption_codes" ADD CONSTRAINT "redemption_codes_used_by_id_users_id_fk" FOREIGN KEY ("used_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_users_id_fk" FOREIGN KEY ("referred_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "affiliates_user_id_idx" ON "affiliates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "affiliates_referral_code_idx" ON "affiliates" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "announcements_date_idx" ON "announcements" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupons_status_idx" ON "coupons" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_plan_id_idx" ON "orders" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plans_name_idx" ON "plans" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plans_status_idx" ON "plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "redemption_codes_code_idx" ON "redemption_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "redemption_codes_plan_id_idx" ON "redemption_codes" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "redemption_codes_status_idx" ON "redemption_codes" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "redemption_codes_used_by_id_idx" ON "redemption_codes" USING btree ("used_by_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "server_groups_name_idx" ON "server_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_plan_id_idx" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_user_uuid_idx" ON "subscriptions" USING btree ("user_uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_token_idx" ON "subscriptions" USING btree ("subscription_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_plan_id_idx" ON "users" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "withdrawals_affiliate_id_idx" ON "withdrawals" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "withdrawals_status_idx" ON "withdrawals" USING btree ("status");