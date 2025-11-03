-- Fix subscriptions table structure
-- Add status column and remove updated_at column

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE subscriptions DROP COLUMN IF EXISTS updated_at;