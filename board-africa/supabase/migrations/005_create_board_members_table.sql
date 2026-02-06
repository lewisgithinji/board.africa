-- Migration: Create board_members table
-- Description: Manages board/committee members for organizations
-- Created: 2026-01-23

-- Create enum for member status
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'pending');

-- Create enum for member role/position
CREATE TYPE member_position AS ENUM (
  'chairman',
  'vice_chairman', 
  'ceo',
  'cfo',
  'director',
  'independent_director',
  'executive_director',
  'non_executive_director',
  'secretary',
  'member',
  'observer',
  'other'
);

-- Create board_members table
CREATE TABLE IF NOT EXISTS public.board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Member Information
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- Position Details
  position member_position NOT NULL DEFAULT 'member',
  custom_position TEXT, -- For 'other' position type
  department TEXT,
  
  -- Professional Information
  bio TEXT,
  linkedin_url TEXT,
  qualifications TEXT[], -- Array of degrees, certifications
  
  -- Membership Details
  status member_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE,
  term_length INTEGER, -- In months
  is_independent BOOLEAN DEFAULT false,
  
  -- Committee Assignments (for future milestone)
  committees TEXT[], -- Array of committee names
  
  -- Display Settings
  display_order INTEGER DEFAULT 0,
  show_on_public_profile BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~ '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT valid_linkedin CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://'),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT custom_position_required CHECK (
    position != 'other' OR custom_position IS NOT NULL
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_board_members_org ON public.board_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_board_members_status ON public.board_members(status);
CREATE INDEX IF NOT EXISTS idx_board_members_display_order ON public.board_members(organization_id, display_order);
CREATE INDEX IF NOT EXISTS idx_board_members_public ON public.board_members(organization_id, show_on_public_profile) 
  WHERE show_on_public_profile = true AND status = 'active';

-- Add RLS policies
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

-- Policy: Organization owners can read their board members
CREATE POLICY "Organization owners can read board members"
  ON public.board_members
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE id = auth.uid()
    )
  );

-- Policy: Organization owners can insert board members
CREATE POLICY "Organization owners can insert board members"
  ON public.board_members
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE id = auth.uid()
    )
  );

-- Policy: Organization owners can update their board members
CREATE POLICY "Organization owners can update board members"
  ON public.board_members
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE id = auth.uid()
    )
  );

-- Policy: Organization owners can delete their board members
CREATE POLICY "Organization owners can delete board members"
  ON public.board_members
  FOR DELETE
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE id = auth.uid()
    )
  );

-- Policy: Public can view board members of public organizations
CREATE POLICY "Public can view board members of public organizations"
  ON public.board_members
  FOR SELECT
  USING (
    show_on_public_profile = true 
    AND status = 'active'
    AND organization_id IN (
      SELECT id FROM public.organizations WHERE is_public = true
    )
  );

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_board_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row modification
CREATE TRIGGER board_members_updated_at
  BEFORE UPDATE ON public.board_members
  FOR EACH ROW
  EXECUTE FUNCTION update_board_members_updated_at();

-- Function to get active board members count
CREATE OR REPLACE FUNCTION get_active_board_members_count(org_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.board_members 
    WHERE organization_id = org_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reorder board members
CREATE OR REPLACE FUNCTION reorder_board_members(
  org_id UUID,
  member_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
  member_id UUID;
  idx INTEGER := 0;
BEGIN
  -- Verify the user owns the organization
  IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to reorder board members for this organization';
  END IF;
  
  -- Update display_order for each member
  FOREACH member_id IN ARRAY member_ids LOOP
    UPDATE public.board_members
    SET display_order = idx
    WHERE id = member_id AND organization_id = org_id;
    idx := idx + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.board_members IS 'Board and committee members for organizations';
COMMENT ON COLUMN public.board_members.position IS 'Standardized board position/role';
COMMENT ON COLUMN public.board_members.is_independent IS 'Whether this is an independent/non-executive director';
COMMENT ON COLUMN public.board_members.display_order IS 'Order for displaying members (lower = first)';
