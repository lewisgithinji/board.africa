-- Migration: Create signatures table for e-signatures
-- Description: Electronic signatures for passed resolutions
-- Author: Board.Africa
-- Date: 2026-01-29

-- ============================================
-- SIGNATURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id),
  signature_data TEXT NOT NULL,
  signature_type VARCHAR(20) DEFAULT 'drawn' CHECK (signature_type IN ('drawn', 'typed')),
  typed_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resolution_id, board_member_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_signatures_resolution ON signatures(resolution_id);
CREATE INDEX IF NOT EXISTS idx_signatures_board_member ON signatures(board_member_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view signatures for their org resolutions" ON signatures;
DROP POLICY IF EXISTS "Users can create signatures for their org resolutions" ON signatures;

-- View signatures for organization's resolutions
CREATE POLICY "Users can view signatures for their org resolutions"
  ON signatures FOR SELECT
  USING (
    resolution_id IN (
      SELECT id FROM resolutions WHERE organization_id = auth.uid()
    )
  );

-- Create signatures (board members can sign their org's resolutions)
CREATE POLICY "Users can create signatures for their org resolutions"
  ON signatures FOR INSERT
  WITH CHECK (
    resolution_id IN (
      SELECT id FROM resolutions WHERE organization_id = auth.uid()
    )
  );

-- Note: No UPDATE or DELETE policies - signatures are immutable once created

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE signatures IS 'Electronic signatures for passed resolutions';
COMMENT ON COLUMN signatures.signature_data IS 'Base64 encoded PNG image of signature';
COMMENT ON COLUMN signatures.signature_type IS 'drawn: canvas signature, typed: text-based signature';
COMMENT ON COLUMN signatures.ip_address IS 'IP address for audit trail';
COMMENT ON COLUMN signatures.user_agent IS 'Browser user agent for audit trail';
