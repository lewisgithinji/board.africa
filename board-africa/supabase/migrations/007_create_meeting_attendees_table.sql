-- Migration: Create meeting_attendees table
-- Description: Tracks board member attendance at meetings
-- Author: Board.Africa
-- Date: 2026-01-28

-- Create meeting_attendees table
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id) ON DELETE CASCADE,
  attendance_status VARCHAR(50) NOT NULL DEFAULT 'invited' CHECK (attendance_status IN ('invited', 'attending', 'absent', 'excused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, board_member_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_member ON meeting_attendees(board_member_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_status ON meeting_attendees(attendance_status);

-- Enable Row Level Security
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own organization meeting attendees" ON meeting_attendees;
DROP POLICY IF EXISTS "Users can manage own organization meeting attendees" ON meeting_attendees;

-- Create RLS policies
CREATE POLICY "Users can view own organization meeting attendees"
  ON meeting_attendees FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own organization meeting attendees"
  ON meeting_attendees FOR ALL
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_meeting_attendees_updated_at
  BEFORE UPDATE ON meeting_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE meeting_attendees IS 'Tracks which board members attended which meetings';
