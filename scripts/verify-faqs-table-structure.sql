-- Verify and create the FAQs table with correct structure
-- This script ensures the table exists with all required columns

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.faqs (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    author TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Check and add title column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'faqs' AND column_name = 'title') THEN
        ALTER TABLE public.faqs ADD COLUMN title TEXT NOT NULL DEFAULT '';
    END IF;
    
    -- Check and add category column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'faqs' AND column_name = 'category') THEN
        ALTER TABLE public.faqs ADD COLUMN category TEXT NOT NULL DEFAULT '';
    END IF;
    
    -- Check and add description column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'faqs' AND column_name = 'description') THEN
        ALTER TABLE public.faqs ADD COLUMN description TEXT;
    END IF;
    
    -- Check and add author column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'faqs' AND column_name = 'author') THEN
        ALTER TABLE public.faqs ADD COLUMN author TEXT;
    END IF;
    
    -- Check and add images column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'faqs' AND column_name = 'images') THEN
        ALTER TABLE public.faqs ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Check and add created_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'faqs' AND column_name = 'created_at') THEN
        ALTER TABLE public.faqs ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON public.faqs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_title ON public.faqs USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS idx_faqs_description ON public.faqs USING gin(to_tsvector('portuguese', description));

-- Enable Row Level Security (RLS) but allow all operations for now
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can restrict this later)
DROP POLICY IF EXISTS "Allow all operations on faqs" ON public.faqs;
CREATE POLICY "Allow all operations on faqs" ON public.faqs
    FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data if the table is empty
INSERT INTO public.faqs (title, category, description, author)
SELECT 
    'Como configurar o PDV',
    'pdv',
    'Guia completo para configuração do sistema PDV. Acesse https://docs.eprosys.com para mais informações.',
    'Sistema'
WHERE NOT EXISTS (SELECT 1 FROM public.faqs LIMIT 1);

INSERT INTO public.faqs (title, category, description, author)
SELECT 
    'Instalação do Sistema',
    'instalacao',
    'Passos para instalação completa do sistema E-PROSYS. Visite www.eprosys.com/install para o manual completo.',
    'Suporte Técnico'
WHERE (SELECT COUNT(*) FROM public.faqs) < 2;

INSERT INTO public.faqs (title, category, description, author)
SELECT 
    'Configuração de Impressoras',
    'impressoras',
    'Como configurar impressoras fiscais e não fiscais no sistema.',
    'Suporte Técnico'
WHERE (SELECT COUNT(*) FROM public.faqs) < 3;

-- Show table structure and sample data
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'faqs' 
ORDER BY ordinal_position;

-- Show sample records
SELECT id, title, category, author, created_at FROM public.faqs ORDER BY created_at DESC LIMIT 5;
