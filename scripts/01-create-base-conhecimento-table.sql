-- ====================================
-- SCRIPT 1: Criar Tabela Base de Conhecimento
-- ====================================
-- Execute este script primeiro no Supabase SQL Editor

-- Remover tabela existente se necessário (CUIDADO: apaga dados!)
-- DROP TABLE IF EXISTS base_conhecimento CASCADE;

-- Criar tabela de artigos da base de conhecimento
CREATE TABLE IF NOT EXISTS base_conhecimento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT,
    conteudo TEXT,
    autor TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'rascunho')),
    visualizacoes INTEGER DEFAULT 0,
    util INTEGER DEFAULT 0,
    nao_util INTEGER DEFAULT 0,
    imagens JSONB DEFAULT '[]'::JSONB,
    arquivos JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_base_conhecimento_categoria ON base_conhecimento(categoria);
CREATE INDEX IF NOT EXISTS idx_base_conhecimento_status ON base_conhecimento(status);
CREATE INDEX IF NOT EXISTS idx_base_conhecimento_created_at ON base_conhecimento(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_base_conhecimento_titulo ON base_conhecimento USING gin(to_tsvector('portuguese', titulo));
CREATE INDEX IF NOT EXISTS idx_base_conhecimento_tags ON base_conhecimento USING gin(tags);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_base_conhecimento_updated_at ON base_conhecimento;
CREATE TRIGGER update_base_conhecimento_updated_at
    BEFORE UPDATE ON base_conhecimento
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE base_conhecimento ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública
DROP POLICY IF EXISTS "Permitir leitura pública" ON base_conhecimento;
CREATE POLICY "Permitir leitura pública" ON base_conhecimento
    FOR SELECT USING (true);

-- Criar política para permitir inserção pública (ajuste conforme necessário)
DROP POLICY IF EXISTS "Permitir inserção pública" ON base_conhecimento;
CREATE POLICY "Permitir inserção pública" ON base_conhecimento
    FOR INSERT WITH CHECK (true);

-- Criar política para permitir atualização pública (ajuste conforme necessário)
DROP POLICY IF EXISTS "Permitir atualização pública" ON base_conhecimento;
CREATE POLICY "Permitir atualização pública" ON base_conhecimento
    FOR UPDATE USING (true) WITH CHECK (true);

-- Criar política para permitir exclusão pública (ajuste conforme necessário)
DROP POLICY IF EXISTS "Permitir exclusão pública" ON base_conhecimento;
CREATE POLICY "Permitir exclusão pública" ON base_conhecimento
    FOR DELETE USING (true);

-- Inserir dados de exemplo
INSERT INTO base_conhecimento (titulo, categoria, descricao, conteudo, autor, tags, status, visualizacoes) VALUES
    (
        'Instalação do Sistema PDV',
        'instalacao',
        'Guia completo para instalação do sistema de Ponto de Venda',
        'Para instalar o sistema PDV, siga os seguintes passos:

1. Faça o download do instalador em https://downloads.eprosys.com/pdv-installer.exe
2. Execute o arquivo como administrador
3. Siga as instruções do assistente de instalação
4. Configure a conexão com o banco de dados
5. Acesse a documentação completa em www.eprosys.com/docs/instalacao

Para suporte técnico, visite https://suporte.eprosys.com',
        'João Silva',
        ARRAY['instalacao', 'pdv', 'tutorial'],
        'ativo',
        245
    ),
    (
        'Configuração de Impressoras Fiscais',
        'impressoras',
        'Como configurar e solucionar problemas com impressoras fiscais',
        'Soluções para os problemas mais comuns com impressoras fiscais:

**Impressora não responde:**
1. Verifique os cabos de conexão
2. Teste com o software da fabricante
3. Baixe os drivers atualizados em:
   - Bematech: https://www.bematech.com.br/suporte/downloads
   - Daruma: https://www.daruma.com.br/suporte/downloads
   - Elgin: https://www.elgin.com.br/suporte',
        'Maria Santos',
        ARRAY['impressoras', 'hardware', 'troubleshooting'],
        'ativo',
        189
    ),
    (
        'Integração com Gateways de Pagamento',
        'integracao',
        'Como integrar o sistema com diferentes gateways de pagamento',
        'O sistema suporta integração com os principais gateways de pagamento do mercado:

**Stone:**
- Documentação: https://docs.stone.com.br/
- Sandbox: https://sandbox.stone.com.br/

**PagSeguro:**
- API Reference: https://dev.pagseguro.uol.com.br/
- Dashboard: https://pagseguro.uol.com.br/

**Mercado Pago:**
- Developers: https://www.mercadopago.com.br/developers/',
        'Carlos Oliveira',
        ARRAY['integracao', 'pagamentos', 'api'],
        'ativo',
        167
    ),
    (
        'Backup e Restauração de Dados',
        'backup',
        'Procedimentos essenciais para backup e restauração',
        'Procedimentos essenciais para backup e restauração do sistema:

**Backup Automático:**
- Configure backups automáticos em https://backup.eprosys.com/
- Armazenamento na nuvem: https://cloud.eprosys.com/storage

**Backup Manual:**
1. Acesse o painel administrativo
2. Vá para Configurações > Backup
3. Clique em "Gerar Backup Completo"',
        'Ana Costa',
        ARRAY['backup', 'seguranca', 'dados'],
        'ativo',
        134
    ),
    (
        'API e Webhooks',
        'integracao',
        'Configuração e uso da API do sistema',
        'Como configurar e usar a API do sistema e webhooks:

**Documentação da API:**
- API Reference: https://api.eprosys.com/docs/
- Swagger UI: https://api.eprosys.com/swagger/

**Autenticação:**
- Gere sua API Key em: https://dashboard.eprosys.com/api-keys',
        'Fernando Souza',
        ARRAY['api', 'webhooks', 'integracao', 'desenvolvimento'],
        'ativo',
        98
    ),
    (
        'Relatórios Gerenciais',
        'relatorios',
        'Como gerar e personalizar relatórios do sistema',
        'Sistema completo de relatórios gerenciais com diversas opções de filtros e exportação.',
        'Roberto Lima',
        ARRAY['relatorios', 'gestao', 'analytics'],
        'ativo',
        156
    ),
    (
        'Controle de Estoque',
        'estoque',
        'Gerenciamento completo de estoque e inventário',
        'Funcionalidades de controle de estoque, entrada e saída de produtos, inventário rotativo.',
        'Patricia Alves',
        ARRAY['estoque', 'inventario', 'produtos'],
        'ativo',
        203
    ),
    (
        'Emissão de Nota Fiscal',
        'fiscal',
        'Guia completo para emissão de NF-e e NFC-e',
        'Procedimentos para emissão de notas fiscais eletrônicas e solução de problemas comuns.',
        'Marcos Silva',
        ARRAY['fiscal', 'nfe', 'nfce'],
        'ativo',
        278
    );

-- Verificar dados inseridos
SELECT 
    id,
    titulo,
    categoria,
    autor,
    status,
    visualizacoes,
    created_at
FROM base_conhecimento
ORDER BY created_at DESC;

-- Mostrar estatísticas
SELECT 
    COUNT(*) as total_artigos,
    COUNT(DISTINCT categoria) as total_categorias,
    SUM(visualizacoes) as total_visualizacoes
FROM base_conhecimento;
