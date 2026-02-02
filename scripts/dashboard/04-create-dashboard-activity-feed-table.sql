-- =====================================================
-- TABELA: dashboard_activity_feed
-- PROPÓSITO: Feed de atividades recentes do sistema
-- =====================================================

-- Criar tabela de feed de atividades
CREATE TABLE IF NOT EXISTS dashboard_activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  user_name VARCHAR(100),
  user_id UUID,
  entity_type VARCHAR(50),
  entity_id UUID,
  action VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  icon VARCHAR(50),
  color VARCHAR(7),
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_activity_type CHECK (activity_type IN (
    'article_created',
    'article_updated',
    'article_deleted',
    'user_login',
    'user_logout',
    'posto_created',
    'posto_updated',
    'pendency_created',
    'pendency_updated',
    'pendency_completed',
    'system_alert',
    'backup_completed',
    'export_completed'
  )),
  CONSTRAINT valid_action CHECK (action IN (
    'create',
    'update',
    'delete',
    'view',
    'login',
    'logout',
    'complete',
    'alert'
  )),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Índices para performance
CREATE INDEX idx_dashboard_activity_feed_type ON dashboard_activity_feed(activity_type);
CREATE INDEX idx_dashboard_activity_feed_user ON dashboard_activity_feed(user_id);
CREATE INDEX idx_dashboard_activity_feed_entity ON dashboard_activity_feed(entity_type, entity_id);
CREATE INDEX idx_dashboard_activity_feed_created ON dashboard_activity_feed(created_at DESC);
CREATE INDEX idx_dashboard_activity_feed_unread ON dashboard_activity_feed(is_read, created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE dashboard_activity_feed ENABLE ROW LEVEL SECURITY;

-- Política: todos podem ler atividades
CREATE POLICY "Atividades são visíveis para todos"
  ON dashboard_activity_feed FOR SELECT
  USING (true);

-- Política: apenas sistema pode inserir atividades
CREATE POLICY "Apenas sistema pode criar atividades"
  ON dashboard_activity_feed FOR INSERT
  WITH CHECK (true);

-- Política: usuários podem marcar atividades como lidas
CREATE POLICY "Usuários podem atualizar status de leitura"
  ON dashboard_activity_feed FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Inserir atividades de exemplo
INSERT INTO dashboard_activity_feed (activity_type, title, description, user_name, action, icon, color, priority, created_at) VALUES
  ('article_created', 'Novo artigo publicado', 'Artigo "Como Configurar Firewall" foi criado na base de conhecimento', 'João Silva', 'create', 'FileText', '#10B981', 'normal', NOW() - INTERVAL '5 minutes'),
  ('user_login', 'Login realizado', 'Usuário acessou o sistema', 'Maria Santos', 'login', 'LogIn', '#3B82F6', 'low', NOW() - INTERVAL '15 minutes'),
  ('pendency_completed', 'Pendência concluída', 'Tarefa "Atualizar documentação" foi marcada como concluída', 'Carlos Oliveira', 'complete', 'CheckCircle', '#10B981', 'normal', NOW() - INTERVAL '1 hour'),
  ('posto_created', 'Novo posto cadastrado', 'Posto "Filial Centro" foi adicionado ao sistema', 'Ana Costa', 'create', 'MapPin', '#8B5CF6', 'normal', NOW() - INTERVAL '2 hours'),
  ('article_updated', 'Artigo atualizado', 'Artigo "Políticas de Segurança" foi atualizado', 'João Silva', 'update', 'Edit', '#F59E0B', 'normal', NOW() - INTERVAL '3 hours'),
  ('backup_completed', 'Backup realizado', 'Backup automático do sistema foi concluído com sucesso', 'Sistema', 'alert', 'Database', '#10B981', 'low', NOW() - INTERVAL '6 hours'),
  ('system_alert', 'Atualização disponível', 'Nova versão do sistema está disponível para instalação', 'Sistema', 'alert', 'AlertCircle', '#F59E0B', 'high', NOW() - INTERVAL '12 hours'),
  ('article_created', 'Novo FAQ adicionado', 'FAQ "Como resetar senha" foi adicionado', 'Maria Santos', 'create', 'HelpCircle', '#3B82F6', 'normal', NOW() - INTERVAL '1 day'),
  ('pendency_created', 'Nova pendência criada', 'Pendência "Revisar políticas" foi criada', 'Carlos Oliveira', 'create', 'AlertTriangle', '#EF4444', 'high', NOW() - INTERVAL '1 day'),
  ('export_completed', 'Exportação concluída', 'Relatório de acessos foi exportado com sucesso', 'Ana Costa', 'complete', 'Download', '#10B981', 'normal', NOW() - INTERVAL '2 days');

-- Comentários da tabela
COMMENT ON TABLE dashboard_activity_feed IS 'Feed de atividades recentes do sistema exibido no dashboard';
COMMENT ON COLUMN dashboard_activity_feed.activity_type IS 'Tipo específico da atividade';
COMMENT ON COLUMN dashboard_activity_feed.entity_type IS 'Tipo da entidade relacionada (article, user, posto, etc)';
COMMENT ON COLUMN dashboard_activity_feed.entity_id IS 'ID da entidade relacionada';
COMMENT ON COLUMN dashboard_activity_feed.is_read IS 'Indica se a atividade foi visualizada';
COMMENT ON COLUMN dashboard_activity_feed.priority IS 'Prioridade da atividade (low, normal, high, urgent)';
