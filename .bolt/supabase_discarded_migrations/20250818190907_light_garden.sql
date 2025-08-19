/*
  # Sistema de Afiliados - Tabelas e Funcionalidades

  1. Novas Tabelas
    - `user_affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para users)
      - `affiliate_code` (text, único)
      - `bank_account` (jsonb, dados bancários)
      - `total_referrals` (integer, total de indicações)
      - `total_earnings` (decimal, total ganho)
      - `total_received` (decimal, total recebido)
      - `total_pending` (decimal, total pendente)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `affiliate_referrals`
      - `id` (uuid, primary key)
      - `affiliate_user_id` (uuid, foreign key para users)
      - `referred_user_id` (uuid, foreign key para users)
      - `subscription_id` (text, ID da assinatura Stripe)
      - `commission_amount` (decimal, valor da comissão)
      - `commission_status` (text, status da comissão)
      - `paid_at` (timestamp, data do pagamento)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Views Administrativas
    - `admin_affiliate_referrals` - visão completa para administradores

  3. Funções
    - `generate_affiliate_code()` - gera códigos únicos
    - `update_affiliate_stats()` - atualiza estatísticas

  4. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários e administradores
*/

-- Criar tabela de afiliados
CREATE TABLE IF NOT EXISTS user_affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affiliate_code text UNIQUE NOT NULL,
  bank_account jsonb DEFAULT '{
    "type": "",
    "bank": "",
    "agency": "",
    "account": "",
    "pixKey": "",
    "pixType": ""
  }'::jsonb,
  total_referrals integer DEFAULT 0,
  total_earnings decimal(10,2) DEFAULT 0.00,
  total_received decimal(10,2) DEFAULT 0.00,
  total_pending decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de indicações
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id text,
  commission_amount decimal(10,2) DEFAULT 0.00,
  commission_status text DEFAULT 'pending' CHECK (commission_status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE user_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Políticas para user_affiliates
CREATE POLICY "Users can view their own affiliate data"
  ON user_affiliates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own affiliate data"
  ON user_affiliates
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own affiliate data"
  ON user_affiliates
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Políticas para affiliate_referrals
CREATE POLICY "Users can view their own referrals"
  ON affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (affiliate_user_id = auth.uid());

CREATE POLICY "System can insert referrals"
  ON affiliate_referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all referrals"
  ON affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update referrals"
  ON affiliate_referrals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid()
    )
  );

-- Função para gerar código de afiliado único
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Gerar código aleatório de 8 caracteres
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Verificar se já existe
    SELECT EXISTS(
      SELECT 1 FROM user_affiliates 
      WHERE affiliate_code = new_code
    ) INTO code_exists;
    
    -- Se não existe, retornar o código
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Função para atualizar estatísticas do afiliado
CREATE OR REPLACE FUNCTION update_affiliate_stats(affiliate_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  total_refs integer;
  total_earn decimal(10,2);
  total_recv decimal(10,2);
  total_pend decimal(10,2);
BEGIN
  -- Calcular estatísticas
  SELECT 
    COUNT(*),
    COALESCE(SUM(commission_amount), 0),
    COALESCE(SUM(CASE WHEN commission_status = 'paid' THEN commission_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN commission_status = 'pending' THEN commission_amount ELSE 0 END), 0)
  INTO total_refs, total_earn, total_recv, total_pend
  FROM affiliate_referrals
  WHERE affiliate_referrals.affiliate_user_id = update_affiliate_stats.affiliate_user_id;
  
  -- Atualizar tabela de afiliados
  UPDATE user_affiliates 
  SET 
    total_referrals = total_refs,
    total_earnings = total_earn,
    total_received = total_recv,
    total_pending = total_pend,
    updated_at = now()
  WHERE user_id = affiliate_user_id;
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_affiliates_updated_at'
  ) THEN
    CREATE TRIGGER update_user_affiliates_updated_at
      BEFORE UPDATE ON user_affiliates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_affiliate_referrals_updated_at'
  ) THEN
    CREATE TRIGGER update_affiliate_referrals_updated_at
      BEFORE UPDATE ON affiliate_referrals
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Criar view para administradores
CREATE OR REPLACE VIEW admin_affiliate_referrals AS
SELECT 
  ar.id,
  ar.created_at,
  ar.commission_amount,
  ar.commission_status,
  ar.paid_at,
  ar.subscription_id,
  ua.affiliate_code,
  ap.name as affiliate_name,
  au.email as affiliate_email,
  rp.name as referred_name,
  ru.email as referred_email,
  ss.price_id,
  ss.status as subscription_status
FROM affiliate_referrals ar
LEFT JOIN user_affiliates ua ON ar.affiliate_user_id = ua.user_id
LEFT JOIN user_profiles ap ON ar.affiliate_user_id = ap.user_id
LEFT JOIN auth.users au ON ar.affiliate_user_id = au.id
LEFT JOIN user_profiles rp ON ar.referred_user_id = rp.user_id
LEFT JOIN auth.users ru ON ar.referred_user_id = ru.id
LEFT JOIN stripe_subscriptions ss ON ar.subscription_id = ss.subscription_id;

-- Política para view administrativa
CREATE POLICY "Admins can view all affiliate data"
  ON admin_affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_affiliates_user_id ON user_affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_affiliates_affiliate_code ON user_affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_user_id ON affiliate_referrals(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user_id ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_subscription_id ON affiliate_referrals(subscription_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_commission_status ON affiliate_referrals(commission_status);