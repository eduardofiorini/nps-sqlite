/*
  # Complete database recreation

  1. New Tables
    - `sources` - Stores data sources for NPS responses
    - `situations` - Stores possible situations for NPS responses
    - `groups` - Stores customer groups
    - `campaigns` - Stores NPS campaigns
    - `contacts` - Stores customer contacts
    - `campaign_forms` - Stores form configurations for campaigns
    - `nps_responses` - Stores NPS survey responses
    - `app_configs` - Stores application configuration
    - `user_profiles` - Stores user profile information
    - `email_queue` - Stores emails to be sent
    - `stripe_customers` - Stores Stripe customer information
    - `stripe_subscriptions` - Stores subscription information
    - `stripe_orders` - Stores order information
  
  2. Enums
    - `stripe_subscription_status` - Status of a subscription
    - `stripe_order_status` - Status of an order
  
  3. Views
    - `stripe_user_subscriptions` - View for user subscriptions
    - `stripe_user_orders` - View for user orders
  
  4. Functions
    - `update_updated_at_column` - Updates the updated_at column
    - `check_trial_expiration` - Checks if a trial has expired
  
  5. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE stripe_subscription_status AS ENUM (
  'not_started',
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused'
);

CREATE TYPE stripe_order_status AS ENUM (
  'pending',
  'completed',
  'canceled'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trial expiration check function
CREATE OR REPLACE FUNCTION check_trial_expiration()
RETURNS TRIGGER AS $$
DECLARE
  trial_end_timestamp BIGINT;
  current_timestamp BIGINT;
BEGIN
  -- Only check if status is 'trialing'
  IF NEW.status = 'trialing' THEN
    current_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    -- Check if trial has ended
    IF NEW.current_period_end IS NOT NULL AND NEW.current_period_end < current_timestamp THEN
      -- Update status to 'canceled'
      NEW.status := 'canceled';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sources table
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sources_user_id ON sources(user_id);

CREATE TRIGGER update_sources_updated_at
BEFORE UPDATE ON sources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create situations table
CREATE TABLE IF NOT EXISTS situations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_situations_user_id ON situations(user_id);

CREATE TRIGGER update_situations_updated_at
BEFORE UPDATE ON situations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_groups_user_id ON groups(user_id);

CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  default_source_id UUID REFERENCES sources(id),
  default_group_id UUID REFERENCES groups(id),
  survey_customization JSONB DEFAULT '{}',
  automation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_active ON campaigns(active);

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT DEFAULT '',
  position TEXT DEFAULT '',
  group_ids UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  last_contact_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create campaign_forms table
CREATE TABLE IF NOT EXISTS campaign_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fields JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id)
);

CREATE TRIGGER update_campaign_forms_updated_at
BEFORE UPDATE ON campaign_forms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create nps_responses table
CREATE TABLE IF NOT EXISTS nps_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT DEFAULT '',
  source_id UUID REFERENCES sources(id),
  situation_id UUID REFERENCES situations(id),
  group_id UUID REFERENCES groups(id),
  form_responses JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_nps_responses_campaign_id ON nps_responses(campaign_id);
CREATE INDEX idx_nps_responses_created_at ON nps_responses(created_at);

-- Create app_configs table
CREATE TABLE IF NOT EXISTS app_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_color TEXT DEFAULT '#073143',
  language TEXT DEFAULT 'pt-BR',
  company JSONB DEFAULT '{}',
  integrations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TRIGGER update_app_configs_updated_at
BEFORE UPDATE ON app_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  company TEXT DEFAULT '',
  position TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  preferences JSONB DEFAULT '{"theme": "light", "language": "pt-BR", "emailNotifications": {"newResponses": true, "weeklyReports": true, "productUpdates": false}}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_queue_campaign_id ON email_queue(campaign_id);
CREATE INDEX idx_email_queue_status ON email_queue(status);

CREATE TRIGGER update_email_queue_updated_at
BEFORE UPDATE ON email_queue
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create Stripe tables
CREATE TABLE IF NOT EXISTS stripe_customers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  subscription_id TEXT,
  price_id TEXT,
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  status stripe_subscription_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER check_subscription_trial_expiration
BEFORE INSERT OR UPDATE ON stripe_subscriptions
FOR EACH ROW
EXECUTE FUNCTION check_trial_expiration();

CREATE TABLE IF NOT EXISTS stripe_orders (
  id BIGSERIAL PRIMARY KEY,
  checkout_session_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount_subtotal BIGINT NOT NULL,
  amount_total BIGINT NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status stripe_order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create views for easier access to subscription and order data
CREATE OR REPLACE VIEW stripe_user_subscriptions AS
SELECT
  c.customer_id,
  s.subscription_id,
  s.status as subscription_status,
  s.price_id,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.payment_method_brand,
  s.payment_method_last4
FROM
  stripe_customers c
JOIN
  stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE
  c.deleted_at IS NULL AND s.deleted_at IS NULL;

CREATE OR REPLACE VIEW stripe_user_orders AS
SELECT
  c.customer_id,
  o.id as order_id,
  o.checkout_session_id,
  o.payment_intent_id,
  o.amount_subtotal,
  o.amount_total,
  o.currency,
  o.payment_status,
  o.status as order_status,
  o.created_at as order_date
FROM
  stripe_customers c
JOIN
  stripe_orders o ON c.customer_id = o.customer_id
WHERE
  c.deleted_at IS NULL AND o.deleted_at IS NULL;

-- Enable Row Level Security on all tables
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Sources
CREATE POLICY "Users can manage their own sources"
  ON sources
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Situations
CREATE POLICY "Users can manage their own situations"
  ON situations
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Groups
CREATE POLICY "Users can manage their own groups"
  ON groups
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Campaigns
CREATE POLICY "Users can manage their own campaigns"
  ON campaigns
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Contacts
CREATE POLICY "Users can manage their own contacts"
  ON contacts
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Campaign Forms
CREATE POLICY "Users can manage their own campaign forms"
  ON campaign_forms
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- NPS Responses
CREATE POLICY "Anyone can create responses"
  ON nps_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view responses for their campaigns"
  ON nps_responses
  FOR SELECT
  TO authenticated
  USING (campaign_id IN (
    SELECT id FROM campaigns WHERE campaigns.user_id = auth.uid()
  ));

-- App Configs
CREATE POLICY "Users can manage their own config"
  ON app_configs
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User Profiles
CREATE POLICY "Users can manage their own profile"
  ON user_profiles
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Email Queue
CREATE POLICY "Users can manage their own email queue"
  ON email_queue
  USING (campaign_id IN (
    SELECT id FROM campaigns WHERE campaigns.user_id = auth.uid()
  ))
  WITH CHECK (campaign_id IN (
    SELECT id FROM campaigns WHERE campaigns.user_id = auth.uid()
  ));

-- Stripe Customers
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Stripe Subscriptions
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (customer_id IN (
    SELECT customer_id FROM stripe_customers 
    WHERE stripe_customers.user_id = auth.uid() AND stripe_customers.deleted_at IS NULL
  ) AND deleted_at IS NULL);

-- Stripe Orders
CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (customer_id IN (
    SELECT customer_id FROM stripe_customers 
    WHERE stripe_customers.user_id = auth.uid() AND stripe_customers.deleted_at IS NULL
  ) AND deleted_at IS NULL);