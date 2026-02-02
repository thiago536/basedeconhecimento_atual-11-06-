# 📊 Dashboard Database Tables - E-PROSYS

## 🎯 Visão Geral

Este conjunto de scripts SQL cria **6 novas tabelas** e **5 views** especificamente projetadas para o dashboard do E-PROSYS, sem modificar nenhuma tabela existente.

## 📋 Estrutura das Tabelas

### 1. `dashboard_widgets`
**Propósito:** Configuração e layout dos widgets do dashboard
- Suporta widgets personalizados por usuário
- Grid responsivo com posicionamento customizável
- 10 tipos de widgets pré-definidos
- Configurações flexíveis via JSONB

**Colunas principais:**
- `widget_type`: Tipo do widget (stats_card, chart_line, etc)
- `position_x/y`: Posição no grid
- `width/height`: Dimensões do widget
- `config`: Configurações específicas em JSON
- `user_id`: NULL = widget do sistema, UUID = widget do usuário

### 2. `dashboard_metrics`
**Propósito:** Armazena métricas históricas para análises
- Time-series otimizado
- 4 tipos de métricas (counter, gauge, histogram, summary)
- Suporte a tags para categorização
- 30 dias de dados de exemplo incluídos

**Colunas principais:**
- `metric_name`: Nome da métrica
- `metric_value`: Valor numérico
- `recorded_at`: Timestamp da medição
- `tags`: Array de tags para filtros
- `metadata`: Dados adicionais em JSON

### 3. `dashboard_quick_links`
**Propósito:** Links rápidos customizáveis
- Links internos e externos
- Contador de cliques
- Ordenação customizável
- Ícones e cores personalizados

**Colunas principais:**
- `title/description`: Informações do link
- `url`: URL de destino
- `icon/color`: Aparência visual
- `click_count`: Análise de uso
- `display_order`: Ordem de exibição

### 4. `dashboard_activity_feed`
**Propósito:** Feed de atividades recentes
- 13 tipos de atividades predefinidos
- Sistema de prioridades
- Status de leitura
- Metadados extensíveis

**Colunas principais:**
- `activity_type`: Tipo específico da atividade
- `title/description`: Conteúdo da atividade
- `user_name`: Nome do usuário responsável
- `entity_type/id`: Entidade relacionada
- `priority`: Nível de prioridade

### 5. `dashboard_notifications`
**Propósito:** Sistema de notificações
- 8 tipos de notificações
- 5 níveis de severidade
- Notificações com expiração
- Ações customizáveis

**Colunas principais:**
- `notification_type`: Tipo da notificação
- `severity`: Nível de severidade
- `expires_at`: Data de expiração
- `action_url/label`: Ação opcional
- `is_read/is_dismissed`: Status

### 6. `dashboard_user_preferences`
**Propósito:** Preferências personalizadas por usuário
- Armazenamento flexível em JSON
- 6 categorias de preferências
- Único por usuário + chave
- Suporte a temas, layout, acessibilidade

**Colunas principais:**
- `preference_key`: Chave da preferência
- `preference_value`: Valor em JSON
- `category`: Categoria (layout, theme, display, etc)

## 📊 Views Criadas

### 1. `dashboard_stats_summary`
Estatísticas gerais: widgets, links, notificações, atividades

### 2. `dashboard_metrics_last_7_days`
Métricas agregadas dos últimos 7 dias com min/max/avg

### 3. `dashboard_top_quick_links`
Top 10 links mais clicados com percentuais

### 4. `dashboard_activities_by_type`
Resumo de atividades agrupadas por tipo

### 5. `dashboard_active_notifications_summary`
Notificações ativas agrupadas por severidade

## 🔐 Segurança (RLS)

Todas as tabelas têm **Row Level Security (RLS)** habilitado:

- ✅ Políticas de SELECT (leitura)
- ✅ Políticas de INSERT (criação)
- ✅ Políticas de UPDATE (atualização)
- ✅ Políticas de DELETE (exclusão)
- ✅ Separação usuário/sistema

## 📦 Ordem de Execução

Execute os scripts nesta ordem no **Supabase SQL Editor**:

\`\`\`bash
1. 01-create-dashboard-widgets-table.sql
2. 02-create-dashboard-metrics-table.sql
3. 03-create-dashboard-quick-links-table.sql
4. 04-create-dashboard-activity-feed-table.sql
5. 05-create-dashboard-notifications-table.sql
6. 06-create-dashboard-user-preferences-table.sql
7. 07-create-dashboard-views.sql
8. 08-verify-dashboard-tables.sql (verificação)
\`\`\`

## ✅ Dados de Exemplo

Cada tabela inclui dados de exemplo:

- **Widgets:** 9 widgets padrão do sistema
- **Métricas:** 30 dias de histórico (4 métricas)
- **Links:** 8 links rápidos essenciais
- **Atividades:** 10 atividades recentes
- **Notificações:** 5 notificações ativas
- **Preferências:** Vazio (preenchido pelo usuário)

## 🚀 Recursos Implementados

✅ **Timestamps automáticos** (created_at, updated_at)  
✅ **Índices otimizados** para queries rápidas  
✅ **Constraints de validação** para dados consistentes  
✅ **Triggers automáticos** para manutenção  
✅ **Comentários descritivos** em todas as tabelas/colunas  
✅ **Views pré-calculadas** para análises  
✅ **Função de limpeza** para notificações expiradas  

## 📈 Performance

- Índices GIN para arrays (tags)
- Índices compostos para queries complexas
- Particionamento por data (métricas)
- Views materializadas opcionais (futuro)

## 🔄 Manutenção

**Limpeza de notificações expiradas:**
\`\`\`sql
SELECT cleanup_expired_notifications();
\`\`\`

**Invalidar cache de métricas:**
\`\`\`sql
-- Executar quando houver mudanças significativas
REFRESH MATERIALIZED VIEW IF EXISTS dashboard_metrics_summary;
\`\`\`

## 📊 Integração com Frontend

As tabelas estão prontas para integração com:

- ✅ React/Next.js components
- ✅ API Routes do Next.js
- ✅ Real-time subscriptions do Supabase
- ✅ Queries TypeScript type-safe

## 🎨 Customização

Todas as tabelas suportam:

- 🎨 Temas e cores personalizadas
- 📱 Layout responsivo
- 🌐 Internacionalização (i18n)
- ♿ Acessibilidade (ARIA)
- 🔔 Notificações em tempo real

## 📝 Notas Importantes

⚠️ **Não modifica tabelas existentes**
- base_conhecimento
- acessos
- pendencias
- postos

✅ **Totalmente independente** do schema existente
✅ **Pode ser instalado/removido** sem impacto
✅ **Pronto para produção** com dados de exemplo

---

**Versão:** 1.0.0  
**Compatibilidade:** Supabase PostgreSQL 15+  
**Status:** ✅ Pronto para uso
