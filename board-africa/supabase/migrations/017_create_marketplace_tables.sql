-- Migration 017: Board Positions and Applications
-- This migration sets up the marketplace data structures for Phase 11: Marketplace

-- 1. Create board_positions table
CREATE TABLE IF NOT EXISTS board_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  is_remunerated BOOLEAN DEFAULT FALSE,
  compensation_details TEXT,
  location TEXT,
  position_type VARCHAR(50) DEFAULT 'Non-Executive Director' CHECK (position_type IN ('Executive Director', 'Non-Executive Director', 'Independent Director', 'Chairman', 'Board Observer', 'Advisory Board Member')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'filled')),
  closing_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES board_positions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'interviewing', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  notes TEXT, -- Private notes for the organization
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position_id, profile_id)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_board_pos_org ON board_positions(organization_id);
CREATE INDEX IF NOT EXISTS idx_board_pos_status ON board_positions(status);
CREATE INDEX IF NOT EXISTS idx_apps_position ON applications(position_id);
CREATE INDEX IF NOT EXISTS idx_apps_profile ON applications(profile_id);

-- 4. Enable RLS
ALTER TABLE board_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

DO $$ 
BEGIN
    -- Board Positions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view open board positions') THEN
        CREATE POLICY "Anyone can view open board positions"
          ON board_positions FOR SELECT
          USING (status = 'open' OR auth.uid() = created_by OR organization_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Organizations can manage own board positions') THEN
        CREATE POLICY "Organizations can manage own board positions"
          ON board_positions FOR ALL
          USING (organization_id = auth.uid() OR auth.uid() = created_by);
    END IF;

    -- Applications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Applicants can view and manage own applications') THEN
        CREATE POLICY "Applicants can view and manage own applications"
          ON applications FOR ALL
          USING (auth.uid() = profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Organizations can view applications for their positions') THEN
        CREATE POLICY "Organizations can view applications for their positions"
          ON applications FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM board_positions
              WHERE board_positions.id = applications.position_id
              AND (board_positions.organization_id = auth.uid() OR board_positions.created_by = auth.uid())
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Organizations can update application status') THEN
        CREATE POLICY "Organizations can update application status"
          ON applications FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM board_positions
              WHERE board_positions.id = applications.position_id
              AND (board_positions.organization_id = auth.uid() OR board_positions.created_by = auth.uid())
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM board_positions
              WHERE board_positions.id = applications.position_id
              AND (board_positions.organization_id = auth.uid() OR board_positions.created_by = auth.uid())
            )
          );
    END IF;
END $$;

-- 6. Updated At Triggers
DROP TRIGGER IF EXISTS update_board_positions_updated_at ON board_positions;
CREATE TRIGGER update_board_positions_updated_at
  BEFORE UPDATE ON board_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
