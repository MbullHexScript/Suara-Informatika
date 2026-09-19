-- Migration 002: add contact column, extend report_type enum, make target nullable
-- Run this in Supabase SQL Editor

-- 1. Add 'aspirasi' and 'mental_health' to report_type enum
ALTER TYPE report_type ADD VALUE IF NOT EXISTS 'aspirasi';
ALTER TYPE report_type ADD VALUE IF NOT EXISTS 'mental_health';

-- 2. Add contact column for mental_health reports
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS contact text;

-- 3. Make target nullable (mental_health has no target)
ALTER TABLE reports
  ALTER COLUMN target DROP NOT NULL;

-- 4. Make category allow anything (already text, no change needed)

-- 5. Make title and its NOT NULL constraint softer for mental_health
-- title is already text NOT NULL, but we default it in server-side logic
-- so just remove the char_length CHECK if needed (optional, current 100 is fine)

-- 6. Index on type for new values (already covered by reports_type_idx)

-- Done. No data loss. All existing rows unaffected.
