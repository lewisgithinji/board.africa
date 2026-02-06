-- Migration: Create meetings table
-- Description: Stores board meeting information
-- Author: Board.Africa
-- Date: 2026-01-28

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_type VARCHAR(50) NOT NULL CHECK (meeting_type IN ('regular', 'special', 'emergency', 'annual')),
  meeting_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  location VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  agenda TEXT,
  minutes TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetings_organization ON meetings(organization_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_type ON meetings(meeting_type);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own organization meetings" ON meetings;
DROP POLICY IF EXISTS "Users can manage own organization meetings" ON meetings;

-- Create RLS policies
CREATE POLICY "Users can view own organization meetings"
  ON meetings FOR SELECT
  USING (organization_id = auth.uid());

CREATE POLICY "Users can manage own organization meetings"
  ON meetings FOR ALL
  USING (organization_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE meetings IS 'Stores board meeting information including agendas and minutes';
