-- Migration: Create action_items table
-- Description: Tracks action items and tasks from board meetings
-- Author: Board.Africa
-- Date: 2026-01-28

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES board_members(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_action_items_meeting ON action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_assigned ON action_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON action_items(due_date);

-- Enable Row Level Security
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own organization action items" ON action_items;
DROP POLICY IF EXISTS "Users can manage own organization action items" ON action_items;

-- Create RLS policies
CREATE POLICY "Users can view own organization action items"
  ON action_items FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own organization action items"
  ON action_items FOR ALL
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically set completed_at when status becomes 'completed'
CREATE OR REPLACE FUNCTION set_action_item_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER action_item_completed_trigger
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION set_action_item_completed_at();

-- Add comment
COMMENT ON TABLE action_items IS 'Tracks action items and tasks assigned during board meetings';
