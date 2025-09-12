-- Criar tabela postos se não existir
CREATE TABLE IF NOT EXISTS postos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir dados de exemplo se a tabela estiver vazia
INSERT INTO postos (nome, url) 
SELECT * FROM (VALUES 
    ('Posto Central', 'https://sistema.postocentral.com.br'),
    ('Posto Norte', 'https://app.postonorte.com.br'),
    ('Posto Sul', 'https://portal.postosul.com.br'),
    ('Posto Leste', 'https://gestao.postoleste.com.br'),
    ('Posto Oeste', 'https://admin.postooeste.com.br')
) AS v(nome, url)
WHERE NOT EXISTS (SELECT 1 FROM postos);

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_postos FROM postos;
