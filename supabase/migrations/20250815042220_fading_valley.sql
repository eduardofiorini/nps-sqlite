-- Seed file for Meu NPS application
-- This file populates the database with initial test data

-- Insert default sources
INSERT INTO sources (id, name, description, color, user_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Website', 'Feedback coletado através do website', '#3B82F6', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Email', 'Pesquisas enviadas por email', '#10B981', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440003', 'WhatsApp', 'Pesquisas enviadas via WhatsApp', '#25D366', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440004', 'SMS', 'Pesquisas enviadas via SMS', '#FF9800', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Telefone', 'Pesquisas realizadas por telefone', '#9C27B0', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert default situations
INSERT INTO situations (id, name, description, color, user_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Pós-Compra', 'Após uma nova compra ou aquisição', '#4CAF50', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Suporte Técnico', 'Após interação com suporte técnico', '#2196F3', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Renovação', 'Após renovação de contrato/assinatura', '#FF5722', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Onboarding', 'Durante processo de integração', '#607D8B', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440015', 'Cancelamento', 'Processo de cancelamento', '#F44336', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert default groups
INSERT INTO groups (id, name, description, user_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 'Clientes Premium', 'Clientes com planos premium ou enterprise', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440022', 'Clientes Regulares', 'Clientes com planos básicos', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440023', 'Novos Usuários', 'Usuários que se cadastraram nos últimos 30 dias', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440024', 'Clientes Inativos', 'Clientes que não usam o serviço há mais de 90 dias', '00000000-0000-0000-0000-000000000000'),
  ('550e8400-e29b-41d4-a716-446655440025', 'Testes Internos', 'Grupo para testes e validações internas', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaigns
INSERT INTO campaigns (id, name, description, start_date, end_date, active, default_source_id, default_group_id, survey_customization, automation, user_id) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440031',
    'Pesquisa de Satisfação Geral',
    'Pesquisa para medir a satisfação geral dos clientes com nossos serviços',
    '2025-01-01',
    NULL,
    true,
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440022',
    '{
      "backgroundType": "color",
      "backgroundColor": "#f8fafc",
      "primaryColor": "#00ac75",
      "textColor": "#1f2937",
      "cardBackgroundColor": "#ffffff"
    }',
    '{
      "enabled": false,
      "action": "return_only",
      "successMessage": "Obrigado pelo seu feedback!",
      "errorMessage": "Ocorreu um erro. Tente novamente."
    }',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440032',
    'NPS Pós-Suporte',
    'Avaliação da qualidade do atendimento após interações de suporte',
    '2025-01-15',
    NULL,
    true,
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440022',
    '{
      "backgroundType": "color",
      "backgroundColor": "#eff6ff",
      "primaryColor": "#2563eb",
      "textColor": "#1e40af",
      "cardBackgroundColor": "#ffffff"
    }',
    '{
      "enabled": false,
      "action": "return_only",
      "successMessage": "Obrigado por avaliar nosso atendimento!",
      "errorMessage": "Erro ao enviar avaliação."
    }',
    '00000000-0000-0000-0000-000000000000'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaign forms
INSERT INTO campaign_forms (id, campaign_id, fields, user_id) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440041',
    '550e8400-e29b-41d4-a716-446655440031',
    '[
      {
        "id": "nps-field-1",
        "type": "nps",
        "label": "O quanto você recomendaria nossos serviços para um amigo ou colega?",
        "required": true,
        "order": 0
      },
      {
        "id": "feedback-field-1",
        "type": "text",
        "label": "Por favor, compartilhe seu feedback sobre nossa empresa",
        "required": false,
        "order": 1
      },
      {
        "id": "improvement-field-1",
        "type": "select",
        "label": "Qual área você acredita que mais precisa de melhorias?",
        "required": false,
        "order": 2,
        "options": ["Atendimento ao Cliente", "Qualidade do Produto", "Preço", "Entrega", "Website/App", "Outro"]
      }
    ]',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440042',
    '550e8400-e29b-41d4-a716-446655440032',
    '[
      {
        "id": "nps-field-2",
        "type": "nps",
        "label": "Com base no atendimento recebido, o quanto você nos recomendaria?",
        "required": true,
        "order": 0
      },
      {
        "id": "support-feedback-2",
        "type": "text",
        "label": "Como foi sua experiência com nosso suporte?",
        "required": false,
        "order": 1
      },
      {
        "id": "resolution-time-2",
        "type": "radio",
        "label": "O tempo para resolver seu problema foi:",
        "required": false,
        "order": 2,
        "options": ["Muito rápido", "Adequado", "Demorado", "Muito demorado"]
      }
    ]',
    '00000000-0000-0000-0000-000000000000'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample contacts
INSERT INTO contacts (id, name, email, phone, company, position, group_ids, tags, notes, user_id) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440051',
    'João Silva',
    'joao.silva@email.com',
    '(11) 99999-1111',
    'Tech Solutions Ltda',
    'Gerente de TI',
    '["550e8400-e29b-41d4-a716-446655440022"]',
    '["cliente", "ativo"]',
    'Cliente há 2 anos, sempre muito satisfeito',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440052',
    'Maria Santos',
    'maria.santos@empresa.com',
    '(11) 88888-2222',
    'Marketing Pro',
    'Diretora de Marketing',
    '["550e8400-e29b-41d4-a716-446655440021"]',
    '["vip", "premium"]',
    'Cliente premium, contrato anual',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440053',
    'Carlos Oliveira',
    'carlos@startup.com',
    '(11) 77777-3333',
    'StartupXYZ',
    'CEO',
    '["550e8400-e29b-41d4-a716-446655440023"]',
    '["novo", "startup"]',
    'Novo cliente, muito interessado em crescer',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440054',
    'Ana Costa',
    'ana.costa@corporacao.com',
    '(11) 66666-4444',
    'Corporação ABC',
    'Gerente de Operações',
    '["550e8400-e29b-41d4-a716-446655440021"]',
    '["corporativo", "enterprise"]',
    'Cliente enterprise, múltiplas filiais',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440055',
    'Pedro Ferreira',
    'pedro@consultoria.com',
    '(11) 55555-5555',
    'Consultoria Estratégica',
    'Consultor Senior',
    '["550e8400-e29b-41d4-a716-446655440022"]',
    '["consultor", "parceiro"]',
    'Parceiro de negócios, indica novos clientes',
    '00000000-0000-0000-0000-000000000000'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample NPS responses
INSERT INTO nps_responses (id, campaign_id, score, feedback, source_id, situation_id, group_id, form_responses) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440061',
    '550e8400-e29b-41d4-a716-446655440031',
    9,
    'Excelente serviço, sempre atende nossas expectativas!',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440022',
    '{
      "nps-field-1": 9,
      "feedback-field-1": "Excelente serviço, sempre atende nossas expectativas!",
      "improvement-field-1": "Website/App"
    }'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440062',
    '550e8400-e29b-41d4-a716-446655440031',
    7,
    'Bom serviço, mas pode melhorar na velocidade de entrega.',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440022',
    '{
      "nps-field-1": 7,
      "feedback-field-1": "Bom serviço, mas pode melhorar na velocidade de entrega.",
      "improvement-field-1": "Entrega"
    }'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440063',
    '550e8400-e29b-41d4-a716-446655440031',
    10,
    'Perfeito! Superou todas as expectativas.',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440021',
    '{
      "nps-field-1": 10,
      "feedback-field-1": "Perfeito! Superou todas as expectativas.",
      "improvement-field-1": "Qualidade do Produto"
    }'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440064',
    '550e8400-e29b-41d4-a716-446655440031',
    5,
    'Serviço deixou a desejar, especialmente no atendimento.',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440022',
    '{
      "nps-field-1": 5,
      "feedback-field-1": "Serviço deixou a desejar, especialmente no atendimento.",
      "improvement-field-1": "Atendimento ao Cliente"
    }'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440065',
    '550e8400-e29b-41d4-a716-446655440032',
    8,
    'Suporte foi eficiente, resolveu meu problema rapidamente.',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440021',
    '{
      "nps-field-2": 8,
      "support-feedback-2": "Suporte foi eficiente, resolveu meu problema rapidamente.",
      "resolution-time-2": "Adequado"
    }'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440066',
    '550e8400-e29b-41d4-a716-446655440032',
    9,
    'Atendimento excepcional, equipe muito preparada!',
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440021',
    '{
      "nps-field-2": 9,
      "support-feedback-2": "Atendimento excepcional, equipe muito preparada!",
      "resolution-time-2": "Muito rápido"
    }'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440067',
    '550e8400-e29b-41d4-a716-446655440031',
    6,
    'Produto é bom, mas o preço está alto comparado à concorrência.',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440022',
    '{
      "nps-field-1": 6,
      "feedback-field-1": "Produto é bom, mas o preço está alto comparado à concorrência.",
      "improvement-field-1": "Preço"
    }'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440068',
    '550e8400-e29b-41d4-a716-446655440031',
    10,
    'Simplesmente fantástico! Melhor empresa do mercado.',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440021',
    '{
      "nps-field-1": 10,
      "feedback-field-1": "Simplesmente fantástico! Melhor empresa do mercado.",
      "improvement-field-1": "Qualidade do Produto"
    }'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample app config
INSERT INTO app_configs (id, user_id, theme_color, language, company, integrations) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440071',
    '00000000-0000-0000-0000-000000000000',
    '#00ac75',
    'pt-BR',
    '{
      "name": "Empresa Demo",
      "document": "12.345.678/0001-90",
      "address": "Rua das Flores, 123 - São Paulo, SP",
      "email": "contato@empresademo.com",
      "phone": "(11) 3333-4444"
    }',
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
    }'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample user profile
INSERT INTO user_profiles (id, user_id, name, phone, company, position, avatar, preferences) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440081',
    '00000000-0000-0000-0000-000000000000',
    'Usuário Demo',
    '(11) 99999-0000',
    'Empresa Demo',
    'Administrador',
    '',
    '{
      "language": "pt-BR",
      "theme": "light",
      "emailNotifications": {
        "newResponses": true,
        "weeklyReports": true,
        "productUpdates": false
      },
      "dataConsent": {
        "marketing": true,
        "analytics": true,
        "thirdParty": false
      }
    }'
  )
ON CONFLICT (id) DO NOTHING;