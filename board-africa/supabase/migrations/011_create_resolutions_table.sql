-- Migration: Create resolutions and votes tables
-- Description: Resolution voting system for board meetings
-- Author: Board.Africa
-- Date: 2026-01-29

-- ============================================
-- RESOLUTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'passed', 'failed')),
  voting_type VARCHAR(20) DEFAULT 'simple_majority' CHECK (voting_type IN ('simple_majority', 'two_thirds', 'unanimous')),
  quorum_required INTEGER DEFAULT 0,
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id),
  vote VARCHAR(20) NOT NULL CHECK (vote IN ('approve', 'reject', 'abstain')),
  comment TEXT,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resolution_id, board_member_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_resolutions_meeting ON resolutions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_org ON resolutions(organization_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_status ON resolutions(status);
CREATE INDEX IF NOT EXISTS idx_votes_resolution ON votes(resolution_id);
CREATE INDEX IF NOT EXISTS idx_votes_board_member ON votes(board_member_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view resolutions for their org" ON resolutions;
DROP POLICY IF EXISTS "Users can create resolutions for their org" ON resolutions;
DROP POLICY IF EXISTS "Users can update their org resolutions" ON resolutions;
DROP POLICY IF EXISTS "Users can delete draft resolutions" ON resolutions;
DROP POLICY IF EXISTS "Users can view votes for their org resolutions" ON votes;
DROP POLICY IF EXISTS "Users can cast votes" ON votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;

-- Resolutions policies
CREATE POLICY "Users can view resolutions for their org"
  ON resolutions FOR SELECT
  USING (organization_id = auth.uid());

CREATE POLICY "Users can create resolutions for their org"
  ON resolutions FOR INSERT
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can update their org resolutions"
  ON resolutions FOR UPDATE
  USING (organization_id = auth.uid());

CREATE POLICY "Users can delete draft resolutions"
  ON resolutions FOR DELETE
  USING (organization_id = auth.uid() AND status = 'draft');

-- Votes policies
CREATE POLICY "Users can view votes for their org resolutions"
  ON votes FOR SELECT
  USING (
    resolution_id IN (
      SELECT id FROM resolutions WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can cast votes"
  ON votes FOR INSERT
  WITH CHECK (
    resolution_id IN (
      SELECT id FROM resolutions WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  USING (
    resolution_id IN (
      SELECT id FROM resolutions WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  USING (
    resolution_id IN (
      SELECT id FROM resolutions WHERE organization_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================
-- Trigger for updated_at on resolutions
CREATE TRIGGER update_resolutions_updated_at
  BEFORE UPDATE ON resolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE resolutions IS 'Board resolutions with voting tracking';
COMMENT ON TABLE votes IS 'Individual votes cast by board members on resolutions';
COMMENT ON COLUMN resolutions.voting_type IS 'simple_majority: >50%, two_thirds: >=67%, unanimous: 100%';
COMMENT ON COLUMN resolutions.quorum_required IS 'Minimum number of votes required (informational)';
