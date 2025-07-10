-- Criar bucket para arquivos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('faq-files', 'faq-files', true)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow file uploads" ON storage.objects;

-- Criar política para permitir uploads públicos (sem autenticação necessária)
CREATE POLICY "Allow file uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'faq-files');

-- Criar política para permitir leitura pública
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'faq-files');

-- Criar política para permitir updates
CREATE POLICY "Allow file updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'faq-files');

-- Criar política para permitir deletes
CREATE POLICY "Allow file deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'faq-files');

-- Adicionar coluna files na tabela faqs se não existir
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]'::jsonb;

-- Adicionar comentário
COMMENT ON COLUMN faqs.files IS 'Arquivos anexados ao FAQ (PDF, ZIP)';
