-- ====================================
-- SCRIPT 4: Verificar Todas as Tabelas
-- ====================================
-- Execute este script para verificar se tudo foi criado corretamente

-- Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('base_conhecimento', 'acessos', 'pendencias') THEN '✅ Existe'
        ELSE '❌ Não encontrada'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
    AND table_name IN ('base_conhecimento', 'acessos', 'pendencias')
ORDER BY table_name;

-- Estatísticas da tabela base_conhecimento
SELECT 
    '📚 BASE DE CONHECIMENTO' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT categoria) as categorias,
    SUM(visualizacoes) as total_visualizacoes,
    MAX(created_at) as ultimo_artigo
FROM base_conhecimento;

-- Estatísticas da tabela acessos
SELECT 
    '🔐 ACESSOS' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT usuario) as usuarios_unicos,
    COUNT(CASE WHEN status = 'sucesso' THEN 1 END) as sucessos,
    COUNT(CASE WHEN status = 'falha' THEN 1 END) as falhas,
    MAX(created_at) as ultimo_acesso
FROM acessos;

-- Estatísticas da tabela pendências
SELECT 
    '📋 PENDÊNCIAS' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN status = 'em_andamento' THEN 1 END) as em_andamento,
    COUNT(CASE WHEN prioridade = 'critica' THEN 1 END) as criticas,
    COUNT(CASE WHEN prazo < CURRENT_DATE THEN 1 END) as atrasadas
FROM pendencias;

-- Verificar índices criados
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('base_conhecimento', 'acessos', 'pendencias')
ORDER BY tablename, indexname;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE WHEN permissive THEN 'Permissivo' ELSE 'Restritivo' END as tipo
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('base_conhecimento', 'acessos', 'pendencias')
ORDER BY tablename, policyname;

-- ✅ RESUMO FINAL
SELECT 
    '🎉 CONFIGURAÇÃO COMPLETA!' as status,
    (SELECT COUNT(*) FROM base_conhecimento) as artigos,
    (SELECT COUNT(*) FROM acessos) as acessos,
    (SELECT COUNT(*) FROM pendencias) as pendencias,
    '✨ Sistema pronto para uso!' as mensagem;
