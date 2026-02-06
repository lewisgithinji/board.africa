-- Migration 013: Create annotations table
CREATE TABLE IF NOT EXISTS document_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  page_number INTEGER NOT NULL,
  annotation_type VARCHAR(20) NOT NULL CHECK (annotation_type IN ('highlight', 'note', 'underline', 'strikethrough')),
  position JSONB NOT NULL, -- {x, y, width, height}
  content TEXT, -- for notes
  color VARCHAR(20) DEFAULT '#FFFF00',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_annotations_document ON document_annotations(document_id);
CREATE INDEX IF NOT EXISTS idx_annotations_user ON document_annotations(user_id);

-- RLS
ALTER TABLE document_annotations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view annotations for documents they can access"
  ON document_annotations FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own annotations"
  ON document_annotations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    document_id IN (
      SELECT id FROM documents WHERE organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own annotations"
  ON document_annotations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annotations"
  ON document_annotations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_annotations_updated_at
    BEFORE UPDATE ON document_annotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
