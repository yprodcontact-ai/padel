-- Migration: Add cover image url to clubs table
-- Created on: 2026-06-10

ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
