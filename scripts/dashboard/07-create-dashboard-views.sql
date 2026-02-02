-- =====================================================
-- VIEWS: Visualizações agregadas para o dashboard
-- PROPÓSITO: Queries otimizadas e pré-calculadas
-- =====================================================

-- View: Estatísticas gerais do dashboard
CREATE OR REPLACE VIEW dashboard_stats_summary AS
SELECT
  'total_widgets' AS stat_name,
  COUNT(*)::TEXT AS stat_value,
  'Widgets configurados' AS stat_label
FROM dashboard_widgets
WHERE is_visible = true

UNION ALL

SELECT
  'total_quick_links' AS stat_name,
  COUNT(*)::TEXT AS stat_value,
  'Links rápidos ativos' AS stat_label
FROM dashboard_quick_links
WHERE is_active = true

UNION ALL

SELECT
  'unread_notifications' AS stat_name,
  COUNT(*)::TEXT AS stat_value,
  'Notificações não lidas' AS stat_label
FROM dashboard_notifications
WHERE is_read = false 
  AND is_dismissed = false
  AND (expires_at IS NULL OR expires_at > NOW())

UNION ALL

SELECT
  'recent_activities' AS stat_name,
  COUNT(*)::TEXT AS stat_value,
  'Atividades recentes (24h)' AS stat_label
FROM dashboard_activity_feed
WHERE created_at > NOW() - INTERVAL '24 hours';

-- View: Métricas dos últimos 7 dias
CREATE OR REPLACE VIEW dashboard_metrics_last_7_days AS
SELECT
  metric_name,
  DATE(recorded_at) AS date,
  AVG(metric_value) AS avg_value,
  MIN(metric_value) AS min_value,
  MAX(metric_value) AS max_value,
  COUNT(*) AS sample_count
FROM dashboard_metrics
WHERE recorded_at > NOW() - INTERVAL '7 days'
GROUP BY metric_name, DATE(recorded_at)
ORDER BY metric_name, date DESC;

-- View: Top links mais clicados
CREATE OR REPLACE VIEW dashboard_top_quick_links AS
SELECT
  id,
  title,
  url,
  category,
  click_count,
  ROUND((click_count::NUMERIC / NULLIF(
    (SELECT SUM(click_count) FROM dashboard_quick_links WHERE is_active = true), 
    0
  ) * 100), 2) AS click_percentage
FROM dashboard_quick_links
WHERE is_active = true
ORDER BY click_count DESC
LIMIT 10;

-- View: Atividades não lidas por tipo
CREATE OR REPLACE VIEW dashboard_activities_by_type AS
SELECT
  activity_type,
  COUNT(*) AS total_count,
  SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) AS unread_count,
  MAX(created_at) AS last_activity_at
FROM dashboard_activity_feed
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY activity_type
ORDER BY total_count DESC;

-- View: Notificações ativas por severidade
CREATE OR REPLACE VIEW dashboard_active_notifications_summary AS
SELECT
  severity,
  COUNT(*) AS total_count,
  SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) AS unread_count
FROM dashboard_notifications
WHERE is_dismissed = false
  AND (expires_at IS NULL OR expires_at > NOW())
GROUP BY severity
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'error' THEN 2
    WHEN 'warning' THEN 3
    WHEN 'success' THEN 4
    WHEN 'info' THEN 5
  END;

-- Comentários das views
COMMENT ON VIEW dashboard_stats_summary IS 'Resumo das estatísticas principais do dashboard';
COMMENT ON VIEW dashboard_metrics_last_7_days IS 'Métricas agregadas dos últimos 7 dias';
COMMENT ON VIEW dashboard_top_quick_links IS 'Top 10 links rápidos mais clicados';
COMMENT ON VIEW dashboard_activities_by_type IS 'Resumo de atividades agrupadas por tipo';
COMMENT ON VIEW dashboard_active_notifications_summary IS 'Resumo de notificações ativas por severidade';
