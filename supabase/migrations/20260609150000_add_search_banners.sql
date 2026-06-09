-- Migration: Add club search banner fields
-- Created on: 2026-06-09

-- Add search banner columns to clubs table if they do not exist
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS search_banner_image_url TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS search_banner_destination_url TEXT;
