-- =====================================================
-- TABELA: dashboard_metrics
-- PROPÓSITO: Armazena métricas históricas para gráficos e análises
-- =====================================================

-- Criar tabela de métricas do dashboard
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit VARCHAR(20),
  category VARCHAR(50),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_metric_type CHECK (metric_type IN (
    'counter',
    'gauge',
    'histogram',
    'summary'
  ))
);

-- Índices para performance (otimizados para time-series)
CREATE INDEX idx_dashboard_metrics_type ON dashboard_metrics(metric_type);
CREATE INDEX idx_dashboard_metrics_name ON dashboard_metrics(metric_name);
CREATE INDEX idx_dashboard_metrics_category ON dashboard_metrics(category);
CREATE INDEX idx_dashboard_metrics_recorded_at ON dashboard_metrics(recorded_at DESC);
CREATE INDEX idx_dashboard_metrics_composite ON dashboard_metrics(metric_name, recorded_at DESC);

-- Índice GIN para arrays de tags
CREATE INDEX idx_dashboard_metrics_tags ON dashboard_metrics USING GIN(tags);

-- RLS (Row Level Security)
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Política: todos podem ler métricas
CREATE POLICY "Métricas são visíveis para todos"
  ON dashboard_metrics FOR SELECT
  USING (true);

-- Política: apenas sistema pode inserir métricas
CREATE POLICY "Apenas sistema pode inserir métricas"
  ON dashboard_metrics FOR INSERT
  WITH CHECK (true);

-- Inserir métricas de exemplo dos últimos 30 dias
INSERT INTO dashboard_metrics (metric_type, metric_name, metric_value, metric_unit, category, tags, recorded_at)
SELECT 
  'gauge',
  'articles_count',
  5 + (random() * 15)::INTEGER,
  'count',
  'content',
  ARRAY['articles', 'knowledge_base'],
  NOW() - (interval '1 day' * generate_series)
FROM generate_series(0, 29);

INSERT INTO dashboard_metrics (metric_type, metric_name, metric_value, metric_unit, category, tags, recorded_at)
SELECT 
  'counter',
  'page_views',
  50 + (random() * 200)::INTEGER,
  'views',
  'traffic',
  ARRAY['views', 'access'],
  NOW() - (interval '1 day' * generate_series)
FROM generate_series(0, 29);

INSERT INTO dashboard_metrics (metric_type, metric_name, metric_value, metric_unit, category, tags, recorded_at)
SELECT 
  'gauge',
  'active_users',
  5 + (random() * 20)::INTEGER,
  'users',
  'users',
  ARRAY['users', 'active'],
  NOW() - (interval '1 day' * generate_series)
FROM generate_series(0, 29);

INSERT INTO dashboard_metrics (metric_type, metric_name, metric_value, metric_unit, category, tags, recorded_at)
SELECT 
  'counter',
  'search_queries',
  10 + (random() * 50)::INTEGER,
  'queries',
  'search',
  ARRAY['search', 'queries'],
  NOW() - (interval '1 day' * generate_series)
FROM generate_series(0, 29);

-- Comentários da tabela
COMMENT ON TABLE dashboard_metrics IS 'Armazena métricas históricas do sistema para análises e gráficos';
COMMENT ON COLUMN dashboard_metrics.metric_type IS 'Tipo da métrica (counter, gauge, histogram, summary)';
COMMENT ON COLUMN dashboard_metrics.metric_value IS 'Valor numérico da métrica';
COMMENT ON COLUMN dashboard_metrics.recorded_at IS 'Timestamp de quando a métrica foi registrada';
COMMENT ON COLUMN dashboard_metrics.tags IS 'Tags para categorização e filtros';
