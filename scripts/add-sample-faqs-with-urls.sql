-- Script para adicionar FAQs de exemplo com URLs para testar a conversão automática
-- Execute este script para popular a base de dados com exemplos práticos

-- FAQ 1: Instalação do Sistema
INSERT INTO faqs (title, category, description, author, images) VALUES (
  'Como instalar o sistema PDV',
  'instalacao',
  'Para instalar o sistema PDV, siga os passos abaixo:

1. Faça o download do instalador em https://downloads.eprosys.com/pdv-installer.exe
2. Execute o arquivo como administrador
3. Siga as instruções do assistente de instalação
4. Configure a conexão com o banco de dados
5. Acesse a documentação completa em www.eprosys.com/docs/instalacao

Para suporte técnico, visite https://suporte.eprosys.com ou entre em contato através do email suporte@eprosys.com

Links úteis:
- Manual de instalação: https://docs.eprosys.com/manual-instalacao.pdf
- Vídeo tutorial: https://youtube.com/watch?v=exemplo123
- Fórum da comunidade: www.forum.eprosys.com',
  'João Silva',
  NULL
);

-- FAQ 2: Integração com APIs de Pagamento
INSERT INTO faqs (title, category, description, author, images) VALUES (
  'Integração com Gateways de Pagamento',
  'integracao',
  'O sistema suporta integração com os principais gateways de pagamento do mercado:

**Stone:**
- Documentação: https://docs.stone.com.br/
- Sandbox: https://sandbox.stone.com.br/
- Suporte: suporte@stone.com.br

**PagSeguro:**
- API Reference: https://dev.pagseguro.uol.com.br/
- Dashboard: https://pagseguro.uol.com.br/
- Certificados: https://assets.pagseguro.com.br/ps-integration-assets/

**Mercado Pago:**
- Developers: https://www.mercadopago.com.br/developers/
- SDKs: https://github.com/mercadopago/
- Status da API: https://status.mercadopago.com/

Para configurar, acesse o painel administrativo em https://admin.eprosys.com/integracoes e siga o guia de configuração disponível em www.eprosys.com/guias/pagamentos',
  'Maria Santos',
  NULL
);

-- FAQ 3: Troubleshooting de Impressoras
INSERT INTO faqs (title, category, description, author, images) VALUES (
  'Problemas com Impressoras Fiscais',
  'impressoras',
  'Soluções para os problemas mais comuns com impressoras fiscais:

**Impressora não responde:**
1. Verifique os cabos de conexão
2. Teste com o software da fabricante
3. Baixe os drivers atualizados em:
   - Bematech: https://www.bematech.com.br/suporte/downloads
   - Daruma: https://www.daruma.com.br/suporte/downloads
   - Elgin: https://www.elgin.com.br/suporte

**Erro de comunicação:**
- Configure a porta serial corretamente
- Verifique o manual técnico: https://manuais.eprosys.com/impressoras/
- Use a ferramenta de diagnóstico: https://tools.eprosys.com/printer-diagnostic

**Papel atolado:**
- Siga o procedimento em: www.eprosys.com/tutoriais/papel-atolado
- Vídeo explicativo: https://youtube.com/watch?v=printer-fix-123

Para suporte especializado, acesse https://suporte.eprosys.com/impressoras ou ligue para 0800-123-4567',
  'Carlos Oliveira',
  NULL
);

-- FAQ 4: Configuração de Certificados
INSERT INTO faqs (title, category, description, author, images) VALUES (
  'Instalação de Certificados Digitais',
  'automacao',
  'Guia completo para instalação e configuração de certificados digitais:

**Download dos Certificados:**
- Receita Federal: https://www.receita.fazenda.gov.br/orientacao/tributaria/declaracoes-e-demonstrativos/ecf-escrituracao-contabil-fiscal/certificados-digitais
- Serpro: https://www.serpro.gov.br/links-fixos/certificacao-digital
- ICP-Brasil: https://www.iti.gov.br/icp-brasil

**Instalação no Windows:**
1. Baixe o certificado A1 ou configure o A3
2. Importe para o repositório do Windows
3. Configure no sistema através de https://config.eprosys.com/certificados
4. Teste a conectividade em https://teste.sped.fazenda.gov.br/

**Validação:**
- Ferramenta de validação: https://validador.eprosys.com/
- Status dos serviços SPED: https://status.sped.fazenda.gov.br/
- Documentação técnica: www.eprosys.com/docs/certificados

**Links importantes:**
- Portal do SPED: https://sped.rfb.gov.br/
- Consulta de validade: https://consulta.certificados.gov.br/
- Suporte técnico: certificados@eprosys.com',
  'Ana Costa',
  NULL
);

-- FAQ 5: Backup e Restauração
INSERT INTO faqs (title, category, description, author, images) VALUES (
  'Procedimentos de Backup',
  'gerente',
  'Procedimentos essenciais para backup e restauração do sistema:

**Backup Automático:**
- Configure backups automáticos em https://backup.eprosys.com/
- Armazenamento na nuvem: https://cloud.eprosys.com/storage
- Monitoramento: https://monitor.eprosys.com/backups

**Backup Manual:**
1. Acesse o painel administrativo
2. Vá para Configurações > Backup
3. Clique em "Gerar Backup Completo"
4. Baixe o arquivo .backup gerado
5. Armazene em local seguro

**Restauração:**
- Guia de restauração: https://docs.eprosys.com/restauracao
- Ferramenta de restauração: https://tools.eprosys.com/restore
- Vídeo tutorial: https://youtube.com/watch?v=backup-restore-456

**Boas práticas:**
- Faça backup diário dos dados críticos
- Teste a restauração mensalmente
- Mantenha cópias em locais diferentes
- Documente os procedimentos

Mais informações em www.eprosys.com/backup ou contate backup@eprosys.com',
  'Roberto Lima',
  NULL
);

-- FAQ 6: API e Webhooks
INSERT INTO faqs (title, category, description, author, images) VALUES (
  'Configuração de API e Webhooks',
  'integracao',
  'Como configurar e usar a API do sistema e webhooks:

**Documentação da API:**
- API Reference: https://api.eprosys.com/docs/
- Swagger UI: https://api.eprosys.com/swagger/
- Postman Collection: https://postman.com/eprosys-api/collections

**Autenticação:**
- Gere sua API Key em: https://dashboard.eprosys.com/api-keys
- Documentação OAuth2: https://auth.eprosys.com/docs/
- Exemplos de código: https://github.com/eprosys/api-examples

**Webhooks:**
- Configure webhooks em: https://webhooks.eprosys.com/
- Teste webhooks: https://webhook.site/
- Logs e monitoramento: https://logs.eprosys.com/webhooks

**Endpoints principais:**
- Vendas: https://api.eprosys.com/v1/sales
- Produtos: https://api.eprosys.com/v1/products
- Clientes: https://api.eprosys.com/v1/customers
- Relatórios: https://api.eprosys.com/v1/reports

**SDKs disponíveis:**
- PHP: https://github.com/eprosys/php-sdk
- Node.js: https://github.com/eprosys/nodejs-sdk
- Python: https://github.com/eprosys/python-sdk

Para suporte técnico da API: api-support@eprosys.com',
  'Fernando Souza',
  NULL
);
