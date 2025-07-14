/*
  # Complete Database Recreation
  
  1. New Tables
    - `sources` - Stores data sources for NPS responses
    - `situations` - Stores possible response situations
    - `groups` - Stores customer groups
    - `campaigns` - Stores NPS campaigns
    - `campaign_forms` - Stores form configurations for campaigns
    - `nps_responses` - Stores all NPS survey responses
    - `contacts` - Stores customer contact information
    - `user_profiles` - Stores user profile information
    - `app_configs` - Stores application configuration
    - `stripe_customers` - Stores Stripe customer mappings
    - `stripe_subscriptions` - Stores subscription information
    - `stripe_orders` - Stores order information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Create views for subscription and order data
*/

-- Create custom types
CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused', 'not_started'
);

CREATE TYPE order_status AS ENUM (
  'pending', 'completed', 'failed', 'refunded'
);

-- Create helper functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_trial_expired(trial_end BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN trial_end IS NOT NULL AND (trial_end * 1000) < EXTRACT(EPOCH FROM now()) * 1000;
END;
$$ LANGUAGE plpgsql;

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_sources_updated_at
BEFORE UPDATE ON sources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Situations table
CREATE TABLE IF NOT EXISTS situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#10B981',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_situations_updated_at
BEFORE UPDATE ON situations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  default_source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  default_group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  survey_customization JSONB DEFAULT '{"backgroundType": "color", "backgroundColor": "#f8fafc", "primaryColor": "#073143", "textColor": "#1f2937"}',
  automation JSONB DEFAULT '{"enabled": false, "action": "return_only", "successMessage": "Obrigado pelo seu feedback!", "errorMessage": "Ocorreu um erro. Tente novamente."}',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Campaign forms table
CREATE TABLE IF NOT EXISTS campaign_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  fields JSONB NOT NULL DEFAULT '[]',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_campaign_forms_updated_at
BEFORE UPDATE ON campaign_forms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- NPS responses table
CREATE TABLE IF NOT EXISTS nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  situation_id UUID REFERENCES situations(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  form_responses JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  position TEXT,
  group_ids UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  last_contact_date TIMESTAMPTZ,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  avatar TEXT,
  preferences JSONB DEFAULT '{"language": "pt-BR", "theme": "light", "emailNotifications": {"newResponses": true, "weeklyReports": true, "productUpdates": false}}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- App configs table
CREATE TABLE IF NOT EXISTS app_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme_color TEXT DEFAULT '#073143',
  language TEXT DEFAULT 'pt-BR',
  company JSONB DEFAULT '{"name": "", "document": "", "address": "", "email": "", "phone": ""}',
  integrations JSONB DEFAULT '{"smtp": {"enabled": false, "host": "", "port": 587, "secure": false, "username": "", "password": "", "fromName": "", "fromEmail": ""}, "zenvia": {"email": {"enabled": false, "apiKey": "", "fromEmail": "", "fromName": ""}, "sms": {"enabled": false, "apiKey": "", "from": ""}, "whatsapp": {"enabled": false, "apiKey": "", "from": ""}}}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_app_configs_updated_at
BEFORE UPDATE ON app_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Stripe customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER update_stripe_customers_updated_at
BEFORE UPDATE ON stripe_customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Stripe subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  subscription_id TEXT,
  price_id TEXT,
  subscription_status subscription_status DEFAULT 'not_started',
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_stripe_subscriptions_updated_at
BEFORE UPDATE ON stripe_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Stripe orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id TEXT NOT NULL UNIQUE,
  payment_intent_id TEXT,
  customer_id TEXT NOT NULL,
  amount_subtotal INTEGER NOT NULL,
  amount_total INTEGER NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status order_status DEFAULT 'pending',
  order_date TIMESTAMPTZ DEFAULT now()
);

-- Create views for easier access
CREATE OR REPLACE VIEW user_subscriptions AS
SELECT
  sc.user_id,
  ss.customer_id,
  ss.subscription_id,
  ss.price_id,
  ss.subscription_status,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4,
  ss.status,
  is_trial_expired(ss.current_period_end) AS trial_expired
FROM
  stripe_subscriptions ss
JOIN
  stripe_customers sc ON ss.customer_id = sc.customer_id
WHERE
  sc.deleted_at IS NULL;

CREATE OR REPLACE VIEW user_orders AS
SELECT
  sc.user_id,
  so.id AS order_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.customer_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status,
  so.order_date
FROM
  stripe_orders so
JOIN
  stripe_customers sc ON so.customer_id = sc.customer_id
WHERE
  sc.deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Sources policies
CREATE POLICY "Users can view their own sources"
  ON sources FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sources"
  ON sources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources"
  ON sources FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources"
  ON sources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Situations policies
CREATE POLICY "Users can view their own situations"
  ON situations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own situations"
  ON situations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own situations"
  ON situations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own situations"
  ON situations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Groups policies
CREATE POLICY "Users can view their own groups"
  ON groups FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Campaign forms policies
CREATE POLICY "Users can view their own campaign forms"
  ON campaign_forms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaign forms"
  ON campaign_forms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign forms"
  ON campaign_forms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaign forms"
  ON campaign_forms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- NPS responses policies
CREATE POLICY "Users can view responses for their campaigns"
  ON nps_responses FOR SELECT
  TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert responses"
  ON nps_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Contacts policies
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- App configs policies
CREATE POLICY "Users can view their own app config"
  ON app_configs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own app config"
  ON app_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app config"
  ON app_configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Stripe customers policies
CREATE POLICY "Users can view their own stripe customer"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Stripe subscriptions policies
CREATE POLICY "Users can view their own stripe subscription"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
    )
  );

-- Stripe orders policies
CREATE POLICY "Users can view their own stripe orders"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
    )
  );