-- Add file storage support to FAQs table
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]'::jsonb;

-- Add comment for the new column
COMMENT ON COLUMN faqs.files IS 'JSON array storing uploaded files (PDFs, ZIPs) with metadata';

-- Create a separate table for file metadata (optional, for better organization)
CREATE TABLE IF NOT EXISTS faq_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  faq_id integer REFERENCES faqs(id) ON DELETE CASCADE,
  filename text NOT NULL,
  original_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  file_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for file access
ALTER TABLE faq_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to faq files" ON faq_files
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage faq files" ON faq_files
  FOR ALL USING (true);
