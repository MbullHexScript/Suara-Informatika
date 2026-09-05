-- Sistem Aspirasi Mahasiswa Informatika
-- Migration: Initial Schema

-- Enums
CREATE TYPE report_type AS ENUM ('keluhan', 'kritik', 'saran');
CREATE TYPE report_target AS ENUM ('jurusan', 'himpunan');
CREATE TYPE report_status AS ENUM ('baru', 'diproses', 'selesai', 'ditolak');

-- Main reports table (NO student identity stored - by design)
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type report_type NOT NULL,
  target report_target NOT NULL,
  category text NOT NULL,
  title text NOT NULL CHECK (char_length(title) <= 100),
  description text NOT NULL CHECK (char_length(description) <= 2000),
  attachments jsonb DEFAULT '[]'::jsonb,
  status report_status NOT NULL DEFAULT 'baru',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Index for common queries
CREATE INDEX reports_status_idx ON reports(status);
CREATE INDEX reports_type_idx ON reports(type);
CREATE INDEX reports_target_idx ON reports(target);
CREATE INDEX reports_created_at_idx ON reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Public can INSERT only (anonymous reports)
CREATE POLICY "Public can insert reports"
  ON reports FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users (admin) can SELECT all
CREATE POLICY "Authenticated can select all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users (admin) can UPDATE
CREATE POLICY "Authenticated can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Storage bucket setup (run this separately in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-attachments', 'report-attachments', false);

-- Storage RLS: anon can upload to report-attachments
-- CREATE POLICY "Public upload to report-attachments"
--   ON storage.objects FOR INSERT
--   TO anon
--   WITH CHECK (bucket_id = 'report-attachments');

-- Authenticated can read attachments (for admin dashboard)
-- CREATE POLICY "Authenticated can read attachments"
--   ON storage.objects FOR SELECT
--   TO authenticated
--   USING (bucket_id = 'report-attachments');
