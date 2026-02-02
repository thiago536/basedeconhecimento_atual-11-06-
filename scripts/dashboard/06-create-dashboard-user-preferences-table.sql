-- =====================================================
-- TABELA: dashboard_user_preferences
-- PROPÓSITO: Preferências personalizadas do dashboard por usuário
-- =====================================================

-- Criar tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS dashboard_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_preference UNIQUE(user_id, preference_key),
  CONSTRAINT valid_category CHECK (category IN (
    'layout',
    'theme',
    'display',
    'notifications',
    'behavior',
    'accessibility'
  ))
);

-- Índices para performance
CREATE INDEX idx_dashboard_user_preferences_user ON dashboard_user_preferences(user_id);
CREATE INDEX idx_dashboard_user_preferences_key ON dashboard_user_preferences(preference_key);
CREATE INDEX idx_dashboard_user_preferences_category ON dashboard_user_preferences(category);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_dashboard_user_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dashboard_user_preferences_timestamp
  BEFORE UPDATE ON dashboard_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_user_preferences_timestamp();

-- RLS (Row Level Security)
ALTER TABLE dashboard_user_preferences ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem suas próprias preferências
CREATE POLICY "Usuários veem apenas próprias preferências"
  ON dashboard_user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários podem criar suas próprias preferências
CREATE POLICY "Usuários podem criar próprias preferências"
  ON dashboard_user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar suas próprias preferências
CREATE POLICY "Usuários podem atualizar próprias preferências"
  ON dashboard_user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: usuários podem deletar suas próprias preferências
CREATE POLICY "Usuários podem deletar próprias preferências"
  ON dashboard_user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários da tabela
COMMENT ON TABLE dashboard_user_preferences IS 'Armazena preferências personalizadas do dashboard por usuário';
COMMENT ON COLUMN dashboard_user_preferences.preference_key IS 'Chave única da preferência (ex: theme_mode, sidebar_collapsed)';
COMMENT ON COLUMN dashboard_user_preferences.preference_value IS 'Valor da preferência em formato JSON';
COMMENT ON COLUMN dashboard_user_preferences.category IS 'Categoria da preferência para organização';
