-- Add library flag and category to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_library_item BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS library_category VARCHAR(50);

-- Update RLS policies if necessary (existing policies should cover this since it's just new columns)
-- But we might want to ensure 'viewer' role can view library items
