-- =====================================================
-- TABELA: dashboard_notifications
-- PROPÓSITO: Sistema de notificações do dashboard
-- =====================================================

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS dashboard_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  icon VARCHAR(50),
  action_url VARCHAR(500),
  action_label VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_notification_type CHECK (notification_type IN (
    'system',
    'user',
    'task',
    'alert',
    'info',
    'success',
    'warning',
    'error'
  )),
  CONSTRAINT valid_severity CHECK (severity IN (
    'info',
    'success',
    'warning',
    'error',
    'critical'
  ))
);

-- Índices para performance
CREATE INDEX idx_dashboard_notifications_user ON dashboard_notifications(user_id);
CREATE INDEX idx_dashboard_notifications_unread ON dashboard_notifications(is_read, created_at DESC) WHERE is_dismissed = false;
CREATE INDEX idx_dashboard_notifications_type ON dashboard_notifications(notification_type);
CREATE INDEX idx_dashboard_notifications_severity ON dashboard_notifications(severity);
CREATE INDEX idx_dashboard_notifications_expires ON dashboard_notifications(expires_at) WHERE expires_at IS NOT NULL;

-- RLS (Row Level Security)
ALTER TABLE dashboard_notifications ENABLE ROW LEVEL SECURITY;

-- Política: usuários veem notificações públicas ou próprias
CREATE POLICY "Notificações visíveis para destinatários"
  ON dashboard_notifications FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Política: apenas sistema pode criar notificações
CREATE POLICY "Apenas sistema pode criar notificações"
  ON dashboard_notifications FOR INSERT
  WITH CHECK (true);

-- Política: usuários podem atualizar status de suas notificações
CREATE POLICY "Usuários podem atualizar próprias notificações"
  ON dashboard_notifications FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Inserir notificações de exemplo
INSERT INTO dashboard_notifications (notification_type, title, message, severity, icon, action_url, action_label, expires_at, user_id) VALUES
  ('system', 'Bem-vindo ao E-PROSYS', 'Sistema de gerenciamento operacional está pronto para uso!', 'success', 'CheckCircle', '/base-conhecimento', 'Explorar', NOW() + INTERVAL '7 days', NULL),
  ('alert', 'Pendências urgentes', 'Você tem 2 pendências com prioridade alta aguardando atenção', 'warning', 'AlertTriangle', '/pendencias?filter=urgent', 'Ver pendências', NOW() + INTERVAL '3 days', NULL),
  ('info', 'Nova documentação disponível', 'Foram adicionados 3 novos artigos na base de conhecimento', 'info', 'BookOpen', '/base-conhecimento?sort=recent', 'Ver artigos', NOW() + INTERVAL '5 days', NULL),
  ('success', 'Backup realizado', 'Backup automático foi concluído com sucesso às 03:00', 'success', 'Database', NULL, NULL, NOW() + INTERVAL '1 day', NULL),
  ('warning', 'Atualização recomendada', 'Nova versão do sistema disponível com melhorias de segurança', 'warning', 'AlertCircle', '/configuracao?tab=updates', 'Atualizar', NOW() + INTERVAL '14 days', NULL);

-- Função para limpar notificações expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM dashboard_notifications
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW()
    AND is_dismissed = true;
END;
$$ LANGUAGE plpgsql;

-- Comentários da tabela
COMMENT ON TABLE dashboard_notifications IS 'Sistema de notificações exibidas no dashboard';
COMMENT ON COLUMN dashboard_notifications.severity IS 'Nível de severidade (info, success, warning, error, critical)';
COMMENT ON COLUMN dashboard_notifications.expires_at IS 'Data de expiração da notificação';
COMMENT ON COLUMN dashboard_notifications.is_dismissed IS 'Indica se o usuário dispensou a notificação';
COMMENT ON COLUMN dashboard_notifications.read_at IS 'Timestamp de quando foi lida';
