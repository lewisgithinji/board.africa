-- Migration: Switch from Daily.co to LiveKit
-- Created: 2026-01-30

-- Rename columns to be provider-agnostic or LiveKit specific
ALTER TABLE public.meetings
RENAME COLUMN daily_room_url TO video_room_url;

ALTER TABLE public.meetings
RENAME COLUMN daily_room_name TO video_room_id;

-- daily_privacy can stay or renamed, let's keep it generic
ALTER TABLE public.meetings
RENAME COLUMN daily_privacy TO video_privacy;

-- Add column for explicitly storing the provider, in case we mix/match later
ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS video_provider TEXT DEFAULT 'livekit';
