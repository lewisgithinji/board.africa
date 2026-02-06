-- Migration: Add Daily.co fields to meetings table
-- Created: 2026-01-30

ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS daily_room_url TEXT,
ADD COLUMN IF NOT EXISTS daily_room_name TEXT,
ADD COLUMN IF NOT EXISTS daily_privacy TEXT DEFAULT 'private'; -- 'public' or 'private'

-- We also need to track who joined if we do analytics later, but for now this is sufficient.
