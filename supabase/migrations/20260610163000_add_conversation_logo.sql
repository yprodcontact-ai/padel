-- Migration: Add logo url to conversations table for broadcast logo
-- Created on: 2026-06-10

ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS logo_url TEXT;
