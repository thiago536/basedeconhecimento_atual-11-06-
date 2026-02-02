-- =====================================================
-- TABELA: dashboard_quick_links
-- PROPÓSITO: Links rápidos customizáveis no dashboard
-- =====================================================

-- Criar tabela de links rápidos
CREATE TABLE IF NOT EXISTS dashboard_quick_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  category VARCHAR(50),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_external BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_url CHECK (url ~ '^https?://.*' OR url ~ '^/.*'),
  CONSTRAINT valid_color CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_display_order CHECK (display_order >= 0)
);

-- Índices para performance
CREATE INDEX idx_dashboard_quick_links_user ON dashboard_quick_links(user_id);
CREATE INDEX idx_dashboard_quick_links_active ON dashboard_quick_links(is_active);
CREATE INDEX idx_dashboard_quick_links_category ON dashboard_quick_links(category);
CREATE INDEX idx_dashboard_quick_links_order ON dashboard_quick_links(display_order);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_dashboard_quick_links_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dashboard_quick_links_timestamp
  BEFORE UPDATE ON dashboard_quick_links
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_quick_links_timestamp();

-- RLS (Row Level Security)
ALTER TABLE dashboard_quick_links ENABLE ROW LEVEL SECURITY;

-- Política: todos podem ler links públicos
CREATE POLICY "Links públicos são visíveis para todos"
  ON dashboard_quick_links FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Política: usuários podem criar seus próprios links
CREATE POLICY "Usuários podem criar links próprios"
  ON dashboard_quick_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar seus próprios links
CREATE POLICY "Usuários podem atualizar links próprios"
  ON dashboard_quick_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: usuários podem deletar seus próprios links
CREATE POLICY "Usuários podem deletar links próprios"
  ON dashboard_quick_links FOR DELETE
  USING (auth.uid() = user_id);

-- Inserir links rápidos padrão
INSERT INTO dashboard_quick_links (title, description, url, icon, color, category, display_order, is_external, user_id) VALUES
  ('Base de Conhecimento', 'Acesse a base de conhecimento completa', '/base-conhecimento', 'BookOpen', '#3B82F6', 'navigation', 1, false, NULL),
  ('Postos', 'Gerencie os postos cadastrados', '/postos', 'MapPin', '#10B981', 'navigation', 2, false, NULL),
  ('Pendências', 'Visualize e gerencie pendências', '/pendencias', 'AlertCircle', '#F59E0B', 'navigation', 3, false, NULL),
  ('Acessos', 'Histórico de acessos ao sistema', '/acessos', 'Activity', '#8B5CF6', 'navigation', 4, false, NULL),
  ('Configurações', 'Configure o sistema', '/configuracao', 'Settings', '#6B7280', 'navigation', 5, false, NULL),
  ('Adicionar Artigo', 'Criar novo artigo na base de conhecimento', '/base-conhecimento?action=new', 'Plus', '#EF4444', 'actions', 6, false, NULL),
  ('Relatórios', 'Gerar relatórios do sistema', '/relatorios', 'BarChart3', '#06B6D4', 'reports', 7, false, NULL),
  ('Suporte', 'Central de ajuda e suporte', 'https://suporte.eprosys.com', 'HelpCircle', '#EC4899', 'external', 8, true, NULL);

-- Comentários da tabela
COMMENT ON TABLE dashboard_quick_links IS 'Links rápidos customizáveis exibidos no dashboard';
COMMENT ON COLUMN dashboard_quick_links.click_count IS 'Contador de cliques para análise de uso';
COMMENT ON COLUMN dashboard_quick_links.is_external IS 'Indica se o link abre em nova aba';
COMMENT ON COLUMN dashboard_quick_links.display_order IS 'Ordem de exibição dos links';
