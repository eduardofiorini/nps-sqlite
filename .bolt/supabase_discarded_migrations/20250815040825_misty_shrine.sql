/*
  # Insert Seed Data for NPS Platform

  1. Default Data
    - Sources (WhatsApp, Email, Phone, Website)
    - Situations (Responded, Pending, Ignored)
    - Groups (Premium, Regular, Internal Testing)
    - Sample campaign with form
    - Sample contacts
    - Sample NPS responses

  2. Notes
    - Uses fixed UUIDs for consistency
    - Includes ON CONFLICT DO NOTHING to prevent duplicate errors
    - Creates realistic demo data for testing
*/

-- Insert default sources (using fixed UUIDs for consistency)
INSERT INTO sources (id, user_id, name, description, color) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000', 'WhatsApp', 'Pesquisas enviadas via WhatsApp', '#25D366'),
  ('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000000', 'Email', 'Pesquisas enviadas por email', '#4285F4'),
  ('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000000', 'Telefone', 'Pesquisas por telefone', '#FF9800'),
  ('550e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000000', 'Website', 'Pesquisas no website', '#673AB7')
ON CONFLICT (id) DO NOTHING;

-- Insert default situations
INSERT INTO situations (id, user_id, name, description, color) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', '00000000-0000-0000-0000-000000000000', 'Respondido', 'Cliente respondeu à pesquisa', '#4CAF50'),
  ('550e8400-e29b-41d4-a716-446655440012', '00000000-0000-0000-0000-000000000000', 'Pendente', 'Aguardando resposta do cliente', '#FFC107'),
  ('550e8400-e29b-41d4-a716-446655440013', '00000000-0000-0000-0000-000000000000', 'Ignorado', 'Cliente não respondeu', '#F44336')
ON CONFLICT (id) DO NOTHING;

-- Insert default groups
INSERT INTO groups (id, user_id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', '00000000-0000-0000-0000-000000000000', 'Clientes Premium', 'Clientes de alto valor'),
  ('550e8400-e29b-41d4-a716-446655440022', '00000000-0000-0000-0000-000000000000', 'Clientes Regulares', 'Clientes padrão'),
  ('550e8400-e29b-41d4-a716-446655440023', '00000000-0000-0000-0000-000000000000', 'Testes Internos', 'Grupo para testes da equipe')
ON CONFLICT (id) DO NOTHING;

-- Function to create default data for new users
CREATE OR REPLACE FUNCTION create_user_default_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default sources for the new user
  INSERT INTO sources (user_id, name, description, color) VALUES
    (NEW.id, 'WhatsApp', 'Pesquisas enviadas via WhatsApp', '#25D366'),
    (NEW.id, 'Email', 'Pesquisas enviadas por email', '#4285F4'),
    (NEW.id, 'Telefone', 'Pesquisas por telefone', '#FF9800'),
    (NEW.id, 'Website', 'Pesquisas no website', '#673AB7');

  -- Insert default situations for the new user
  INSERT INTO situations (user_id, name, description, color) VALUES
    (NEW.id, 'Respondido', 'Cliente respondeu à pesquisa', '#4CAF50'),
    (NEW.id, 'Pendente', 'Aguardando resposta do cliente', '#FFC107'),
    (NEW.id, 'Ignorado', 'Cliente não respondeu', '#F44336');

  -- Insert default groups for the new user
  INSERT INTO groups (user_id, name, description) VALUES
    (NEW.id, 'Clientes Premium', 'Clientes de alto valor'),
    (NEW.id, 'Clientes Regulares', 'Clientes padrão'),
    (NEW.id, 'Testes Internos', 'Grupo para testes da equipe');

  -- Insert default app config for the new user
  INSERT INTO app_configs (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default data when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_default_data();

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  start_date date NOT NULL,
  end_date date,
  active boolean DEFAULT true,
  default_source_id uuid,
  default_group_id uuid,
  survey_customization jsonb DEFAULT '{
    "backgroundType": "color",
    "backgroundColor": "#f8fafc",
    "primaryColor": "#00ac75",
    "textColor": "#1f2937",
    "cardBackgroundColor": "#ffffff"
  }'::jsonb,
  automation jsonb DEFAULT '{
    "enabled": false,
    "action": "return_only",
    "successMessage": "Obrigado pelo seu feedback!",
    "errorMessage": "Ocorreu um erro. Tente novamente."
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaign Forms Table
CREATE TABLE IF NOT EXISTS campaign_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  fields jsonb NOT NULL DEFAULT '[
    {
      "id": "nps-field",
      "type": "nps",
      "label": "O quanto você recomendaria nosso serviço para um amigo ou colega?",
      "required": true,
      "order": 0
    },
    {
      "id": "feedback-field",
      "type": "text",
      "label": "Por favor, compartilhe seu feedback",
      "required": false,
      "order": 1
    }
  ]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id)
);

-- NPS Responses Table
CREATE TABLE IF NOT EXISTS nps_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback text DEFAULT '',
  source_id uuid,
  situation_id uuid,
  group_id uuid,
  form_responses jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Users can manage own campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for campaign_forms
CREATE POLICY "Users can manage own campaign forms"
  ON campaign_forms
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(active);
CREATE INDEX IF NOT EXISTS idx_campaign_forms_user_id ON campaign_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_forms_campaign_id ON campaign_forms(campaign_id);

-- Triggers for updated_at on new tables
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_forms_updated_at
  BEFORE UPDATE ON campaign_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();