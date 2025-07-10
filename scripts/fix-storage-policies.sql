-- Remover bucket existente se houver
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Deletar bucket se existir
SELECT storage.delete_bucket('faq-files');

-- Criar bucket público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faq-files',
  'faq-files',
  true,
  52428800,
  ARRAY['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'];

-- Criar políticas públicas para o bucket faq-files
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'faq-files');

CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'faq-files');

CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'faq-files');

CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'faq-files');

-- Adicionar coluna files na tabela faqs se não existir
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]'::jsonb;

-- Comentário na coluna
COMMENT ON COLUMN faqs.files IS 'Arquivos anexados ao FAQ em formato JSON';
