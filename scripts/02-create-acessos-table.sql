-- ====================================
-- SCRIPT 2: Criar Tabela de Acessos
-- ====================================
-- Execute este script após o script 01

-- Remover tabela existente se necessário (CUIDADO: apaga dados!)
-- DROP TABLE IF EXISTS acessos CASCADE;

-- Criar tabela de registros de acesso
CREATE TABLE IF NOT EXISTS acessos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario TEXT NOT NULL,
    email TEXT,
    acao TEXT NOT NULL,
    modulo TEXT NOT NULL,
    detalhes TEXT,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT DEFAULT 'sucesso' CHECK (status IN ('sucesso', 'falha', 'bloqueado')),
    duracao_ms INTEGER,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_acessos_usuario ON acessos(usuario);
CREATE INDEX IF NOT EXISTS idx_acessos_modulo ON acessos(modulo);
CREATE INDEX IF NOT EXISTS idx_acessos_status ON acessos(status);
CREATE INDEX IF NOT EXISTS idx_acessos_created_at ON acessos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acessos_acao ON acessos(acao);

-- Habilitar Row Level Security (RLS)
ALTER TABLE acessos ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública
DROP POLICY IF EXISTS "Permitir leitura pública" ON acessos;
CREATE POLICY "Permitir leitura pública" ON acessos
    FOR SELECT USING (true);

-- Criar política para permitir inserção pública
DROP POLICY IF EXISTS "Permitir inserção pública" ON acessos;
CREATE POLICY "Permitir inserção pública" ON acessos
    FOR INSERT WITH CHECK (true);

-- Inserir dados de exemplo (últimos 30 dias)
INSERT INTO acessos (usuario, email, acao, modulo, detalhes, status, ip_address, created_at) VALUES
    ('João Silva', 'joao.silva@eprosys.com', 'login', 'autenticacao', 'Login bem-sucedido', 'sucesso', '192.168.1.10', NOW() - INTERVAL '2 hours'),
    ('Maria Santos', 'maria.santos@eprosys.com', 'visualizacao', 'base_conhecimento', 'Artigo: Instalação do Sistema PDV', 'sucesso', '192.168.1.15', NOW() - INTERVAL '3 hours'),
    ('Carlos Oliveira', 'carlos.oliveira@eprosys.com', 'edicao', 'base_conhecimento', 'Editou artigo sobre impressoras', 'sucesso', '192.168.1.20', NOW() - INTERVAL '5 hours'),
    ('Ana Costa', 'ana.costa@eprosys.com', 'criacao', 'base_conhecimento', 'Novo artigo: Backup e Restauração', 'sucesso', '192.168.1.25', NOW() - INTERVAL '1 day'),
    ('João Silva', 'joao.silva@eprosys.com', 'consulta', 'relatorios', 'Relatório de vendas mensal', 'sucesso', '192.168.1.10', NOW() - INTERVAL '1 day'),
    ('Fernando Souza', 'fernando.souza@eprosys.com', 'configuracao', 'sistema', 'Alterou configurações de backup', 'sucesso', '192.168.1.30', NOW() - INTERVAL '2 days'),
    ('Patricia Alves', 'patricia.alves@eprosys.com', 'visualizacao', 'base_conhecimento', 'Artigo: Controle de Estoque', 'sucesso', '192.168.1.35', NOW() - INTERVAL '2 days'),
    ('Roberto Lima', 'roberto.lima@eprosys.com', 'login', 'autenticacao', 'Login bem-sucedido', 'sucesso', '192.168.1.40', NOW() - INTERVAL '3 days'),
    ('Marcos Silva', 'marcos.silva@eprosys.com', 'edicao', 'base_conhecimento', 'Atualizou documentação fiscal', 'sucesso', '192.168.1.45', NOW() - INTERVAL '3 days'),
    ('João Silva', 'joao.silva@eprosys.com', 'exportacao', 'relatorios', 'Exportou relatório em PDF', 'sucesso', '192.168.1.10', NOW() - INTERVAL '4 days'),
    ('Maria Santos', 'maria.santos@eprosys.com', 'criacao', 'postos', 'Novo posto cadastrado', 'sucesso', '192.168.1.15', NOW() - INTERVAL '5 days'),
    ('Carlos Oliveira', 'carlos.oliveira@eprosys.com', 'visualizacao', 'dashboard', 'Acessou dashboard principal', 'sucesso', '192.168.1.20', NOW() - INTERVAL '5 days'),
    ('Ana Costa', 'ana.costa@eprosys.com', 'login', 'autenticacao', 'Tentativa de login falhou', 'falha', '192.168.1.25', NOW() - INTERVAL '6 days'),
    ('Fernando Souza', 'fernando.souza@eprosys.com', 'consulta', 'api', 'Consulta via API - endpoint /vendas', 'sucesso', '192.168.1.30', NOW() - INTERVAL '7 days'),
    ('Patricia Alves', 'patricia.alves@eprosys.com', 'edicao', 'configuracao', 'Alterou preferências do sistema', 'sucesso', '192.168.1.35', NOW() - INTERVAL '8 days');

-- Inserir mais registros de acesso para simular atividade
DO $$
DECLARE
    i INTEGER;
    usuarios TEXT[] := ARRAY['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa', 'Fernando Souza', 'Patricia Alves', 'Roberto Lima', 'Marcos Silva'];
    acoes TEXT[] := ARRAY['login', 'visualizacao', 'edicao', 'criacao', 'consulta', 'exportacao'];
    modulos TEXT[] := ARRAY['autenticacao', 'base_conhecimento', 'relatorios', 'dashboard', 'postos', 'configuracao'];
BEGIN
    FOR i IN 1..85 LOOP
        INSERT INTO acessos (usuario, acao, modulo, status, created_at)
        VALUES (
            usuarios[1 + floor(random() * array_length(usuarios, 1))],
            acoes[1 + floor(random() * array_length(acoes, 1))],
            modulos[1 + floor(random() * array_length(modulos, 1))],
            CASE WHEN random() > 0.95 THEN 'falha' ELSE 'sucesso' END,
            NOW() - (random() * INTERVAL '30 days')
        );
    END LOOP;
END $$;

-- Verificar dados inseridos
SELECT 
    COUNT(*) as total_acessos,
    COUNT(DISTINCT usuario) as total_usuarios,
    COUNT(CASE WHEN status = 'sucesso' THEN 1 END) as acessos_sucesso,
    COUNT(CASE WHEN status = 'falha' THEN 1 END) as acessos_falha
FROM acessos;

-- Mostrar últimos acessos
SELECT 
    id,
    usuario,
    acao,
    modulo,
    status,
    created_at
FROM acessos
ORDER BY created_at DESC
LIMIT 10;
