-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create materialized view for global search
CREATE MATERIALIZED VIEW search_index AS
SELECT 
  'meeting' as type,
  m.id,
  m.organization_id,
  m.title as title,
  m.agenda as content,
  m.meeting_date as created_at,
  to_tsvector('english', 
    coalesce(m.title, '') || ' ' || 
    coalesce(m.agenda, '') || ' ' ||
    coalesce(m.location, '')
  ) as search_vector
FROM meetings m

UNION ALL

SELECT 
  'document' as type,
  d.id,
  d.organization_id,
  d.title as title,
  d.description as content,
  d.created_at,
  to_tsvector('english',
    coalesce(d.title, '') || ' ' ||
    coalesce(d.description, '')
  ) as search_vector
FROM documents d

UNION ALL

SELECT
  'action_item' as type,
  a.id,
  m.organization_id,
  a.title as title,
  a.description as content,
  a.created_at,
  to_tsvector('english',
    coalesce(a.title, '') || ' ' ||
    coalesce(a.description, '')
  ) as search_vector
FROM action_items a
JOIN meetings m ON a.meeting_id = m.id

UNION ALL

SELECT
  'resolution' as type,
  r.id,
  m.organization_id,
  r.title as title,
  r.description as content,
  r.created_at,
  to_tsvector('english',
    coalesce(r.title, '') || ' ' ||
    coalesce(r.description, '')
  ) as search_vector
FROM resolutions r
JOIN meetings m ON r.meeting_id = m.id;

-- Create index on search_vector for fast full-text search
CREATE INDEX idx_search_vector ON search_index USING gin(search_vector);

-- Create index on organization_id for RLS filtering
CREATE INDEX idx_search_org ON search_index(organization_id);

-- Create index on type for filtering
CREATE INDEX idx_search_type ON search_index(type);

-- Function to refresh search index
CREATE OR REPLACE FUNCTION refresh_search_index()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT SELECT ON search_index TO authenticated;
