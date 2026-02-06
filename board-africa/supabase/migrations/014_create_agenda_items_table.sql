-- Migration 014: Create agenda_items table
CREATE TABLE IF NOT EXISTS agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES agenda_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 1),
  description TEXT,
  duration_minutes INTEGER DEFAULT 5,
  order_index INTEGER NOT NULL DEFAULT 0,
  item_type VARCHAR(20) DEFAULT 'regular' CHECK (item_type IN ('regular', 'consent', 'presentation', 'vote', 'break')),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  resolution_id UUID REFERENCES resolutions(id) ON DELETE SET NULL,
  presenter_id UUID REFERENCES board_members(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agenda_meeting ON agenda_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_agenda_parent ON agenda_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_agenda_item_order ON agenda_items(meeting_id, order_index);

-- RLS
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view agenda items for their org meetings"
  ON agenda_items FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can create agenda items for their org meetings"
  ON agenda_items FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their org agenda items"
  ON agenda_items FOR UPDATE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id = auth.uid()
    )
  )
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their org agenda items"
  ON agenda_items FOR DELETE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_agenda_items_updated_at
    BEFORE UPDATE ON agenda_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
