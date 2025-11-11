-- ====================================
-- SCRIPT 3: Criar Tabela de Pendências
-- ====================================
-- Execute este script após o script 02

-- Remover tabela existente se necessário (CUIDADO: apaga dados!)
-- DROP TABLE IF EXISTS pendencias CASCADE;

-- Criar tabela de pendências
CREATE TABLE IF NOT EXISTS pendencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('tarefa', 'bug', 'melhoria', 'suporte', 'urgente')),
    prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    responsavel TEXT,
    solicitante TEXT NOT NULL,
    departamento TEXT,
    prazo DATE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pendencias_tipo ON pendencias(tipo);
CREATE INDEX IF NOT EXISTS idx_pendencias_prioridade ON pendencias(prioridade);
CREATE INDEX IF NOT EXISTS idx_pendencias_status ON pendencias(status);
CREATE INDEX IF NOT EXISTS idx_pendencias_responsavel ON pendencias(responsavel);
CREATE INDEX IF NOT EXISTS idx_pendencias_created_at ON pendencias(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pendencias_prazo ON pendencias(prazo);

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_pendencias_updated_at ON pendencias;
CREATE TRIGGER update_pendencias_updated_at
    BEFORE UPDATE ON pendencias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE pendencias ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública
DROP POLICY IF EXISTS "Permitir leitura pública" ON pendencias;
CREATE POLICY "Permitir leitura pública" ON pendencias
    FOR SELECT USING (true);

-- Criar política para permitir inserção pública
DROP POLICY IF EXISTS "Permitir inserção pública" ON pendencias;
CREATE POLICY "Permitir inserção pública" ON pendencias
    FOR INSERT WITH CHECK (true);

-- Criar política para permitir atualização pública
DROP POLICY IF EXISTS "Permitir atualização pública" ON pendencias;
CREATE POLICY "Permitir atualização pública" ON pendencias
    FOR UPDATE USING (true) WITH CHECK (true);

-- Criar política para permitir exclusão pública
DROP POLICY IF EXISTS "Permitir exclusão pública" ON pendencias;
CREATE POLICY "Permitir exclusão pública" ON pendencias
    FOR DELETE USING (true);

-- Inserir dados de exemplo
INSERT INTO pendencias (titulo, descricao, tipo, prioridade, status, responsavel, solicitante, departamento, prazo, tags) VALUES
    (
        'Corrigir erro na impressão de cupons fiscais',
        'Sistema apresenta erro ao tentar imprimir cupons fiscais em impressoras Bematech',
        'bug',
        'alta',
        'em_andamento',
        'Carlos Oliveira',
        'João Silva',
        'TI',
        CURRENT_DATE + INTERVAL '3 days',
        ARRAY['impressoras', 'fiscal', 'urgente']
    ),
    (
        'Implementar integração com novo gateway de pagamento',
        'Adicionar suporte para o gateway de pagamento GetNet',
        'melhoria',
        'media',
        'pendente',
        'Fernando Souza',
        'Maria Santos',
        'Desenvolvimento',
        CURRENT_DATE + INTERVAL '15 days',
        ARRAY['integracao', 'pagamentos']
    ),
    (
        'Atualizar documentação do sistema',
        'Revisar e atualizar toda a documentação técnica do sistema',
        'tarefa',
        'baixa',
        'pendente',
        'Ana Costa',
        'Roberto Lima',
        'Documentação',
        CURRENT_DATE + INTERVAL '30 days',
        ARRAY['documentacao', 'manutencao']
    ),
    (
        'Falha na sincronização de dados',
        'Dados do PDV não estão sincronizando com o servidor central',
        'bug',
        'critica',
        'em_andamento',
        'João Silva',
        'Patricia Alves',
        'TI',
        CURRENT_DATE + INTERVAL '1 day',
        ARRAY['sincronizacao', 'dados', 'critico']
    ),
    (
        'Criar relatório de vendas por período',
        'Implementar novo relatório com análise de vendas por período customizado',
        'melhoria',
        'media',
        'pendente',
        'Roberto Lima',
        'Marcos Silva',
        'Desenvolvimento',
        CURRENT_DATE + INTERVAL '20 days',
        ARRAY['relatorios', 'vendas']
    ),
    (
        'Backup falhou na última execução',
        'Sistema de backup automático falhou na execução de ontem',
        'bug',
        'alta',
        'pendente',
        'Carlos Oliveira',
        'Ana Costa',
        'TI',
        CURRENT_DATE + INTERVAL '2 days',
        ARRAY['backup', 'infraestrutura']
    ),
    (
        'Solicitar suporte para configuração de certificado digital',
        'Cliente precisa de ajuda para configurar certificado A3',
        'suporte',
        'media',
        'em_andamento',
        'Maria Santos',
        'João Silva',
        'Suporte',
        CURRENT_DATE + INTERVAL '5 days',
        ARRAY['certificado', 'suporte', 'cliente']
    ),
    (
        'Otimizar performance do banco de dados',
        'Banco de dados está lento, precisa de otimização e limpeza',
        'melhoria',
        'alta',
        'pendente',
        'Fernando Souza',
        'Carlos Oliveira',
        'TI',
        CURRENT_DATE + INTERVAL '10 days',
        ARRAY['performance', 'database']
    ),
    (
        'Erro ao emitir NF-e',
        'Sistema retorna erro 999 ao tentar emitir nota fiscal eletrônica',
        'bug',
        'critica',
        'pendente',
        NULL,
        'Patricia Alves',
        'TI',
        CURRENT_DATE + INTERVAL '1 day',
        ARRAY['fiscal', 'nfe', 'urgente']
    ),
    (
        'Adicionar filtros avançados na tela de produtos',
        'Implementar filtros por categoria, marca e faixa de preço',
        'melhoria',
        'baixa',
        'pendente',
        'Marcos Silva',
        'Roberto Lima',
        'Desenvolvimento',
        CURRENT_DATE + INTERVAL '25 days',
        ARRAY['produtos', 'ui', 'filtros']
    );

-- Verificar dados inseridos
SELECT 
    COUNT(*) as total_pendencias,
    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN status = 'em_andamento' THEN 1 END) as em_andamento,
    COUNT(CASE WHEN prioridade = 'critica' THEN 1 END) as criticas
FROM pendencias;

-- Mostrar pendências críticas e urgentes
SELECT 
    id,
    titulo,
    tipo,
    prioridade,
    status,
    responsavel,
    prazo
FROM pendencias
WHERE prioridade IN ('critica', 'alta')
ORDER BY 
    CASE prioridade 
        WHEN 'critica' THEN 1 
        WHEN 'alta' THEN 2 
    END,
    prazo NULLS LAST;
