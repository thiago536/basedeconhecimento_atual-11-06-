-- =====================================================
-- TABELA: dashboard_widgets
-- PROPÓSITO: Armazena configuração e estado dos widgets do dashboard
-- =====================================================

-- Criar tabela de widgets do dashboard
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1,
  height INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_position CHECK (position_x >= 0 AND position_y >= 0),
  CONSTRAINT valid_dimensions CHECK (width > 0 AND height > 0),
  CONSTRAINT valid_widget_type CHECK (widget_type IN (
    'stats_card',
    'chart_line',
    'chart_bar',
    'chart_pie',
    'recent_activity',
    'quick_links',
    'notifications',
    'calendar',
    'tasks',
    'weather'
  ))
);

-- Índices para performance
CREATE INDEX idx_dashboard_widgets_user ON dashboard_widgets(user_id);
CREATE INDEX idx_dashboard_widgets_visible ON dashboard_widgets(is_visible);
CREATE INDEX idx_dashboard_widgets_type ON dashboard_widgets(widget_type);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_dashboard_widgets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dashboard_widgets_timestamp
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_widgets_timestamp();

-- RLS (Row Level Security)
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Política: todos podem ler widgets públicos (user_id NULL)
CREATE POLICY "Widgets públicos são visíveis para todos"
  ON dashboard_widgets FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Política: usuários podem criar seus próprios widgets
CREATE POLICY "Usuários podem criar widgets próprios"
  ON dashboard_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar seus próprios widgets
CREATE POLICY "Usuários podem atualizar widgets próprios"
  ON dashboard_widgets FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: usuários podem deletar seus próprios widgets
CREATE POLICY "Usuários podem deletar widgets próprios"
  ON dashboard_widgets FOR DELETE
  USING (auth.uid() = user_id);

-- Inserir widgets padrão do sistema
INSERT INTO dashboard_widgets (widget_type, title, position_x, position_y, width, height, config, user_id) VALUES
  ('stats_card', 'Total de Artigos', 0, 0, 1, 1, '{"metric": "articles_count", "color": "blue"}', NULL),
  ('stats_card', 'Acessos Hoje', 1, 0, 1, 1, '{"metric": "access_today", "color": "green"}', NULL),
  ('stats_card', 'Pendências Ativas', 2, 0, 1, 1, '{"metric": "pending_tasks", "color": "yellow"}', NULL),
  ('stats_card', 'Postos Cadastrados', 3, 0, 1, 1, '{"metric": "stations_count", "color": "purple"}', NULL),
  ('chart_line', 'Acessos nos Últimos 7 Dias', 0, 1, 2, 2, '{"dataSource": "access_history", "period": "7d"}', NULL),
  ('chart_bar', 'Artigos por Categoria', 2, 1, 2, 2, '{"dataSource": "articles_by_category"}', NULL),
  ('recent_activity', 'Atividades Recentes', 0, 3, 2, 2, '{"limit": 10}', NULL),
  ('quick_links', 'Links Rápidos', 2, 3, 2, 1, '{}', NULL),
  ('notifications', 'Notificações', 2, 4, 2, 1, '{"limit": 5}', NULL);

-- Comentários da tabela
COMMENT ON TABLE dashboard_widgets IS 'Armazena a configuração e layout dos widgets do dashboard';
COMMENT ON COLUMN dashboard_widgets.widget_type IS 'Tipo do widget (stats_card, chart_line, etc)';
COMMENT ON COLUMN dashboard_widgets.position_x IS 'Posição horizontal no grid do dashboard';
COMMENT ON COLUMN dashboard_widgets.position_y IS 'Posição vertical no grid do dashboard';
COMMENT ON COLUMN dashboard_widgets.width IS 'Largura do widget em unidades de grid';
COMMENT ON COLUMN dashboard_widgets.height IS 'Altura do widget em unidades de grid';
COMMENT ON COLUMN dashboard_widgets.config IS 'Configurações específicas do widget em JSON';
COMMENT ON COLUMN dashboard_widgets.user_id IS 'ID do usuário (NULL = widget do sistema)';
