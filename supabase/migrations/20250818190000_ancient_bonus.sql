/*
  # Create Affiliate System

  1. New Tables
    - `user_affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `affiliate_code` (text, unique)
      - `bank_account` (jsonb for bank details)
      - `total_referrals` (integer, default 0)
      - `total_earnings` (decimal, default 0)
      - `total_received` (decimal, default 0)
      - `total_pending` (decimal, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `affiliate_referrals`
      - `id` (uuid, primary key)
      - `affiliate_user_id` (uuid, foreign key to users - who referred)
      - `referred_user_id` (uuid, foreign key to users - who was referred)
      - `subscription_id` (text, foreign key to stripe_subscriptions)
      - `commission_amount` (decimal)
      - `commission_status` (enum: pending, paid, cancelled)
      - `paid_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own affiliate data
    - Add policies for admins to view all affiliate data

  3. Functions
    - Function to generate unique affiliate codes
    - Function to calculate commissions
    - Function to update affiliate stats
*/

-- Create commission status enum
CREATE TYPE commission_status AS ENUM ('pending', 'paid', 'cancelled');

-- Create user_affiliates table
CREATE TABLE IF NOT EXISTS user_affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affiliate_code text UNIQUE NOT NULL,
  bank_account jsonb DEFAULT '{"type": "", "bank": "", "agency": "", "account": "", "pix_key": "", "pix_type": ""}',
  total_referrals integer DEFAULT 0,
  total_earnings decimal(10,2) DEFAULT 0.00,
  total_received decimal(10,2) DEFAULT 0.00,
  total_pending decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create affiliate_referrals table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id text,
  commission_amount decimal(10,2) DEFAULT 0.00,
  commission_status commission_status DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for user_affiliates
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

-- Create policies for affiliate_referrals
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

-- Admin policies
CREATE POLICY "Admins can view all affiliate data"
  ON user_affiliates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid() 
      AND permissions->>'view_users' = 'true'
    )
  );

CREATE POLICY "Admins can view all referrals"
  ON affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid() 
      AND permissions->>'view_users' = 'true'
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
      AND permissions->>'view_users' = 'true'
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_user_affiliates_updated_at
  BEFORE UPDATE ON user_affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_affiliate_referrals_updated_at
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM user_affiliates WHERE affiliate_code = code) INTO exists;
    
    -- If code doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Function to create affiliate record for new users
CREATE OR REPLACE FUNCTION create_user_affiliate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_affiliates (user_id, affiliate_code)
  VALUES (NEW.id, generate_affiliate_code());
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create affiliate record for new users
CREATE TRIGGER create_affiliate_on_user_creation
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_affiliate();

-- Function to calculate commission (25% of subscription price)
CREATE OR REPLACE FUNCTION calculate_commission(price_id text)
RETURNS decimal(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
  commission decimal(10,2) := 0.00;
BEGIN
  -- Commission rates based on price_id (25% of monthly price)
  CASE price_id
    WHEN 'price_1RjVnGJwPeWVIUa99CJNK4I4' THEN commission := 12.25; -- Iniciante: 25% of R$49
    WHEN 'price_1RjVoIJwPeWVIUa9puy9krkj' THEN commission := 24.75; -- Profissional: 25% of R$99
    WHEN 'price_1RjVpRJwPeWVIUa9ECuvA3FX' THEN commission := 62.25; -- Empresarial: 25% of R$249
    ELSE commission := 0.00;
  END CASE;
  
  RETURN commission;
END;
$$;

-- Function to update affiliate stats
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
  -- Calculate totals
  SELECT 
    COUNT(*),
    COALESCE(SUM(commission_amount), 0),
    COALESCE(SUM(CASE WHEN commission_status = 'paid' THEN commission_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN commission_status = 'pending' THEN commission_amount ELSE 0 END), 0)
  INTO total_refs, total_earn, total_recv, total_pend
  FROM affiliate_referrals
  WHERE affiliate_user_id = update_affiliate_stats.affiliate_user_id;
  
  -- Update affiliate record
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

-- Create view for admin affiliate overview
CREATE OR REPLACE VIEW admin_affiliate_referrals AS
SELECT 
  ar.id,
  ar.created_at,
  ar.commission_amount,
  ar.commission_status,
  ar.paid_at,
  ar.subscription_id,
  -- Affiliate user info
  ua_affiliate.affiliate_code,
  up_affiliate.name as affiliate_name,
  au_affiliate.email as affiliate_email,
  -- Referred user info
  up_referred.name as referred_name,
  au_referred.email as referred_email,
  -- Subscription info
  ss.price_id,
  ss.status as subscription_status
FROM affiliate_referrals ar
LEFT JOIN user_affiliates ua_affiliate ON ar.affiliate_user_id = ua_affiliate.user_id
LEFT JOIN user_profiles up_affiliate ON ar.affiliate_user_id = up_affiliate.user_id
LEFT JOIN auth.users au_affiliate ON ar.affiliate_user_id = au_affiliate.id
LEFT JOIN user_profiles up_referred ON ar.referred_user_id = up_referred.user_id
LEFT JOIN auth.users au_referred ON ar.referred_user_id = au_referred.id
LEFT JOIN stripe_subscriptions ss ON ar.subscription_id = ss.subscription_id;

-- Grant access to the view for admins
CREATE POLICY "Admins can view affiliate referrals"
  ON admin_affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid() 
      AND permissions->>'view_users' = 'true'
    )
  );