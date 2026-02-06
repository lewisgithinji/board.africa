-- Migration 002: Add profile fields for onboarding
-- This migration adds fields needed for organization and professional profiles

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- Create index on onboarding_completed for quick queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);

-- Create index on country for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- Create index on industry for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON profiles(industry);

-- Add comment to table
COMMENT ON TABLE profiles IS 'User profiles with role-specific fields for organizations and professionals';

-- Add comments to new columns
COMMENT ON COLUMN profiles.company_name IS 'Organization name (for organization role)';
COMMENT ON COLUMN profiles.company_website IS 'Organization website URL (for organization role)';
COMMENT ON COLUMN profiles.company_size IS 'Number of employees (for organization role)';
COMMENT ON COLUMN profiles.industry IS 'Industry/sector (for both roles)';
COMMENT ON COLUMN profiles.country IS 'Country of operation/residence';
COMMENT ON COLUMN profiles.job_title IS 'Current job title (for professional role)';
COMMENT ON COLUMN profiles.bio IS 'Professional biography (for professional role)';
COMMENT ON COLUMN profiles.linkedin_url IS 'LinkedIn profile URL (for professional role)';
COMMENT ON COLUMN profiles.years_experience IS 'Years of board experience (for professional role)';
