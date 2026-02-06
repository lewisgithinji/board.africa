-- Migration: Create organizations table
-- Description: Extends profiles table with organization-specific data
-- Created: 2026-01-23

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT,
  tagline TEXT,
  description TEXT,
  
  -- Logo/Branding
  logo_url TEXT,
  cover_image_url TEXT,
  brand_color TEXT DEFAULT '#1a1a1a',
  
  -- Company Details (from onboarding)
  company_name TEXT NOT NULL,
  website TEXT,
  company_size TEXT,
  industry TEXT,
  country TEXT,
  
  -- Contact Information
  contact_email TEXT,
  contact_phone TEXT,
  headquarters_address TEXT,
  
  -- Business Information
  registration_number TEXT,
  tax_id TEXT,
  year_founded INTEGER,
  
  -- Settings
  is_public BOOLEAN DEFAULT false,
  allow_member_directory BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT valid_website CHECK (website IS NULL OR website ~ '^https?://'),
  CONSTRAINT valid_year CHECK (year_founded IS NULL OR (year_founded >= 1800 AND year_founded <= EXTRACT(YEAR FROM now())))
);

-- Create index for slug lookups (public profile pages)
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- Create index for public organizations
CREATE INDEX IF NOT EXISTS idx_organizations_public ON public.organizations(is_public) WHERE is_public = true;

-- Add RLS policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own organization
CREATE POLICY "Users can read own organization"
  ON public.organizations
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own organization
CREATE POLICY "Users can update own organization"
  ON public.organizations
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own organization (during onboarding)
CREATE POLICY "Users can insert own organization"
  ON public.organizations
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Anyone can read public organizations
CREATE POLICY "Public organizations are viewable by everyone"
  ON public.organizations
  FOR SELECT
  USING (is_public = true);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row modification
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organizations_updated_at();

-- Function to generate slug from company name
CREATE OR REPLACE FUNCTION generate_org_slug(company_name TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  -- Limit length
  base_slug := substring(base_slug from 1 for 50);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = final_slug AND id != user_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.organizations IS 'Extended organization profile data for company/board accounts';
COMMENT ON COLUMN public.organizations.slug IS 'URL-friendly unique identifier for public profile pages';
COMMENT ON COLUMN public.organizations.is_public IS 'Whether the organization profile is publicly visible';
