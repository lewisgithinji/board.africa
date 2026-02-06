-- Migration: Create documents table
-- Description: Stores board documents with file metadata
-- Author: Board.Africa
-- Date: 2026-01-28

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  board_member_id UUID REFERENCES board_members(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) CHECK (category IN ('financial', 'legal', 'strategic', 'operational', 'governance', 'other')),
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES profiles(id),
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_organization ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_meeting ON documents(meeting_id);
CREATE INDEX IF NOT EXISTS idx_documents_member ON documents(board_member_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_parent ON documents(parent_document_id);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own organization documents" ON documents;
DROP POLICY IF EXISTS "Users can manage own organization documents" ON documents;
DROP POLICY IF EXISTS "Public documents are viewable by everyone" ON documents;

-- Create RLS policies
CREATE POLICY "Users can view own organization documents"
  ON documents FOR SELECT
  USING (organization_id = auth.uid());

CREATE POLICY "Users can manage own organization documents"
  ON documents FOR ALL
  USING (organization_id = auth.uid());

-- Policy for public documents (for future public profile feature)
CREATE POLICY "Public documents are viewable by everyone"
  ON documents FOR SELECT
  USING (is_public = true);

-- Create trigger for updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE documents IS 'Stores board documents with metadata and file references to Supabase Storage';
