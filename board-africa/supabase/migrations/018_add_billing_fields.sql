-- Migration: Add billing fields to organizations table
-- Created: 2026-01-30

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'tier-starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Add index for stripe_customer_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON public.organizations(stripe_customer_id);
