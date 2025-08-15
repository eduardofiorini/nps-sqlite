/*
  # Supabase Seed Data

  This file contains seed data for development and testing purposes.
  
  1. Default Sources
    - Creates common feedback sources (WhatsApp, Email, Phone, Website)
  
  2. Default Situations  
    - Creates response status situations (Responded, Pending, Ignored)
    
  3. Default Groups
    - Creates customer groups (Premium, Regular, Internal Testing)
    
  4. Sample Campaign
    - Creates a demo campaign with customization
    
  5. Sample Responses
    - Creates sample NPS responses for testing
*/

-- Insert default sources for all users (these will be available globally)
INSERT INTO sources (id, name, description, color, user_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'WhatsApp', 'Feedback coletado via WhatsApp', '#25D366', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000002', 'Email', 'Feedback coletado via Email', '#4285F4', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000003', 'Telefone', 'Feedback coletado via Telefone', '#FF9800', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000004', 'Website', 'Feedback coletado via Website', '#673AB7', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert default situations
INSERT INTO situations (id, name, description, color, user_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Respondido', 'Cliente respondeu à pesquisa', '#4CAF50', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000002', 'Pendente', 'Aguardando resposta do cliente', '#FFC107', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000003', 'Ignorado', 'Cliente não respondeu', '#F44336', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert default groups
INSERT INTO groups (id, name, description, user_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Clientes Premium', 'Clientes de alto valor', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000002', 'Clientes Regulares', 'Clientes padrão', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000003', 'Testes Internos', 'Grupo para testes internos', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaign
INSERT INTO campaigns (
  id, 
  name, 
  description, 
  start_date, 
  end_date, 
  active, 
  default_source_id, 
  default_group_id,
  survey_customization,
  automation,
  user_id
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Pesquisa de Satisfação do Cliente',
  'Medindo a satisfação geral dos clientes com nossos serviços',
  CURRENT_DATE,
  NULL,
  true,
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{
    "backgroundType": "color",
    "backgroundColor": "#f8fafc",
    "primaryColor": "#00ac75",
    "textColor": "#1f2937",
    "cardBackgroundColor": "#ffffff"
  }'::jsonb,
  '{
    "enabled": false,
    "action": "return_only",
    "successMessage": "Obrigado pelo seu feedback!",
    "errorMessage": "Ocorreu um erro. Tente novamente."
  }'::jsonb,
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample campaign form
INSERT INTO campaign_forms (
  id,
  campaign_id,
  fields,
  user_id
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '[
    {
      "id": "nps-field-1",
      "type": "nps",
      "label": "O quanto você recomendaria nosso serviço para um amigo ou colega?",
      "required": true,
      "order": 0
    },
    {
      "id": "feedback-field-1",
      "type": "text",
      "label": "Por favor, compartilhe seu feedback sobre nossa experiência",
      "required": false,
      "order": 1
    },
    {
      "id": "recommendation-field-1",
      "type": "select",
      "label": "Como você nos conheceu?",
      "required": false,
      "order": 2,
      "options": ["Indicação de amigo", "Pesquisa no Google", "Redes sociais", "Publicidade", "Outro"]
    }
  ]'::jsonb,
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample contacts
INSERT INTO contacts (
  id,
  name,
  email,
  phone,
  company,
  position,
  group_ids,
  tags,
  notes,
  user_id
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'João Silva',
    'joao.silva@email.com',
    '(11) 99999-1111',
    'Tech Solutions Ltda',
    'Gerente de TI',
    '["00000000-0000-0000-0000-000000000001"]'::jsonb,
    '["cliente", "premium", "tecnologia"]'::jsonb,
    'Cliente desde 2023, muito satisfeito com o atendimento',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Maria Santos',
    'maria.santos@empresa.com',
    '(11) 99999-2222',
    'Marketing Pro',
    'Diretora de Marketing',
    '["00000000-0000-0000-0000-000000000001"]'::jsonb,
    '["parceiro", "marketing"]'::jsonb,
    'Parceira estratégica, sempre dá feedback construtivo',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Carlos Oliveira',
    'carlos@startup.com',
    '(11) 99999-3333',
    'Startup Inovadora',
    'CEO',
    '["00000000-0000-0000-0000-000000000002"]'::jsonb,
    '["startup", "inovacao"]'::jsonb,
    'CEO de startup, sempre busca soluções inovadoras',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Ana Costa',
    'ana.costa@consultoria.com',
    '(11) 99999-4444',
    'Consultoria Estratégica',
    'Consultora Senior',
    '["00000000-0000-0000-0000-000000000001"]'::jsonb,
    '["consultoria", "estrategia"]'::jsonb,
    'Consultora experiente, feedback sempre detalhado',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Pedro Ferreira',
    'pedro@vendas.com',
    '(11) 99999-5555',
    'Vendas & Cia',
    'Diretor Comercial',
    '["00000000-0000-0000-0000-000000000002"]'::jsonb,
    '["vendas", "comercial"]'::jsonb,
    'Diretor comercial, foca em resultados práticos',
    '00000000-0000-0000-0000-000000000000'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample NPS responses
INSERT INTO nps_responses (
  id,
  campaign_id,
  score,
  feedback,
  source_id,
  situation_id,
  group_id,
  form_responses,
  created_at
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    9,
    'Excelente atendimento! Recomendo para todos.',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{
      "nps-field-1": 9,
      "feedback-field-1": "Excelente atendimento! Recomendo para todos.",
      "recommendation-field-1": "Indicação de amigo"
    }'::jsonb,
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    8,
    'Bom serviço, mas pode melhorar a velocidade de resposta.',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{
      "nps-field-1": 8,
      "feedback-field-1": "Bom serviço, mas pode melhorar a velocidade de resposta.",
      "recommendation-field-1": "Pesquisa no Google"
    }'::jsonb,
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    10,
    'Perfeito! Superou todas as expectativas.',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{
      "nps-field-1": 10,
      "feedback-field-1": "Perfeito! Superou todas as expectativas.",
      "recommendation-field-1": "Redes sociais"
    }'::jsonb,
    NOW() - INTERVAL '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    6,
    'Atendimento demorado, precisa melhorar.',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '{
      "nps-field-1": 6,
      "feedback-field-1": "Atendimento demorado, precisa melhorar.",
      "recommendation-field-1": "Indicação de amigo"
    }'::jsonb,
    NOW() - INTERVAL '4 days'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    7,
    'Serviço ok, dentro do esperado.',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '{
      "nps-field-1": 7,
      "feedback-field-1": "Serviço ok, dentro do esperado.",
      "recommendation-field-1": "Publicidade"
    }'::jsonb,
    NOW() - INTERVAL '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    9,
    'Muito bom! Equipe competente e prestativa.',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{
      "nps-field-1": 9,
      "feedback-field-1": "Muito bom! Equipe competente e prestativa.",
      "recommendation-field-1": "Redes sociais"
    }'::jsonb,
    NOW() - INTERVAL '6 days'
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000001',
    5,
    'Não atendeu minhas expectativas.',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '{
      "nps-field-1": 5,
      "feedback-field-1": "Não atendeu minhas expectativas.",
      "recommendation-field-1": "Outro"
    }'::jsonb,
    NOW() - INTERVAL '7 days'
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000001',
    10,
    'Fantástico! Melhor experiência que já tive.',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{
      "nps-field-1": 10,
      "feedback-field-1": "Fantástico! Melhor experiência que já tive.",
      "recommendation-field-1": "Indicação de amigo"
    }'::jsonb,
    NOW() - INTERVAL '8 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert default app config template
INSERT INTO app_configs (
  id,
  user_id,
  theme_color,
  language,
  company,
  integrations
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  '#00ac75',
  'pt-BR',
  '{
    "name": "",
    "document": "",
    "address": "",
    "email": "",
    "phone": ""
  }'::jsonb,
  '{
    "smtp": {
      "enabled": false,
      "host": "",
      "port": 587,
      "secure": false,
      "username": "",
      "password": "",
      "fromName": "",
      "fromEmail": ""
    },
    "zenvia": {
      "email": {
        "enabled": false,
        "apiKey": "",
        "fromEmail": "",
        "fromName": ""
      },
      "sms": {
        "enabled": false,
        "apiKey": "",
        "from": ""
      },
      "whatsapp": {
        "enabled": false,
        "apiKey": "",
        "from": ""
      }
    }
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;