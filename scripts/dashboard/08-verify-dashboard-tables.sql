-- =====================================================
-- SCRIPT DE VERIFICAÇÃO: Confirma criação das tabelas do dashboard
-- =====================================================

-- Verificar todas as tabelas do dashboard
SELECT 
  'dashboard_widgets' AS table_name,
  COUNT(*) AS record_count,
  pg_size_pretty(pg_total_relation_size('dashboard_widgets')) AS table_size
FROM dashboard_widgets

UNION ALL

SELECT 
  'dashboard_metrics' AS table_name,
  COUNT(*) AS record_count,
  pg_size_pretty(pg_total_relation_size('dashboard_metrics')) AS table_size
FROM dashboard_metrics

UNION ALL

SELECT 
  'dashboard_quick_links' AS table_name,
  COUNT(*) AS record_count,
  pg_size_pretty(pg_total_relation_size('dashboard_quick_links')) AS table_size
FROM dashboard_quick_links

UNION ALL

SELECT 
  'dashboard_activity_feed' AS table_name,
  COUNT(*) AS record_count,
  pg_size_pretty(pg_total_relation_size('dashboard_activity_feed')) AS table_size
FROM dashboard_activity_feed

UNION ALL

SELECT 
  'dashboard_notifications' AS table_name,
  COUNT(*) AS record_count,
  pg_size_pretty(pg_total_relation_size('dashboard_notifications')) AS table_size
FROM dashboard_notifications

UNION ALL

SELECT 
  'dashboard_user_preferences' AS table_name,
  COUNT(*) AS record_count,
  pg_size_pretty(pg_total_relation_size('dashboard_user_preferences')) AS table_size
FROM dashboard_user_preferences;

-- Verificar índices criados
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'dashboard_%'
ORDER BY tablename, indexname;

-- Verificar políticas RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename LIKE 'dashboard_%'
ORDER BY tablename, policyname;

-- Verificar views criadas
SELECT
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE viewname LIKE 'dashboard_%'
ORDER BY viewname;

-- Estatísticas resumidas
SELECT
  '✅ Tabelas Criadas' AS status,
  COUNT(DISTINCT table_name) AS quantidade
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'dashboard_%'
  AND table_type = 'BASE TABLE'

UNION ALL

SELECT
  '✅ Views Criadas' AS status,
  COUNT(*) AS quantidade
FROM pg_views
WHERE schemaname = 'public'
  AND viewname LIKE 'dashboard_%'

UNION ALL

SELECT
  '✅ Índices Criados' AS status,
  COUNT(*) AS quantidade
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'dashboard_%'

UNION ALL

SELECT
  '✅ Políticas RLS' AS status,
  COUNT(*) AS quantidade
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'dashboard_%';

-- Resumo final
SELECT
  '🎉 DASHBOARD TABLES CRIADAS COM SUCESSO!' AS mensagem,
  NOW() AS criado_em;
