/*
  # Create Affiliate System Tables

  1. New Tables
    - `user_affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `affiliate_code` (text, unique)
      - `bank_account` (jsonb for bank/PIX data)
      - `total_referrals` (integer, default 0)
      - `total_earnings` (decimal, default 0)
      - `total_received` (decimal, default 0)
      - `total_pending` (decimal, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `affiliate_referrals`
      - `id` (uuid, primary key)
      - `affiliate_user_id` (uuid, foreign key to users)
      - `referred_user_id` (uuid, foreign key to users)
      - `subscription_id` (text, nullable)
      - `commission_amount` (decimal, default 0)
      - `commission_status` (enum: pending, paid, cancelled)
      - `paid_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Views
    - `admin_affiliate_referrals` - Admin view with user details

  3. Functions
    - `generate_affiliate_code()` - Generate unique affiliate codes
    - `update_affiliate_stats()` - Update affiliate statistics

  4. Security
    - Enable RLS on all tables
    - Add policies for user access and admin access
*/

-- Create enum for commission status
CREATE TYPE commission_status AS ENUM ('pending', 'paid', 'cancelled');

-- Create user_affiliates table
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
  total_earnings decimal(10,2) DEFAULT 0,
  total_received decimal(10,2) DEFAULT 0,
  total_pending decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create affiliate_referrals table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id text,
  commission_amount decimal(10,2) DEFAULT 0,
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

CREATE POLICY "Admins can view all referrals"
  ON affiliate_referrals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for admin access to user_affiliates
CREATE POLICY "Admins can view all affiliate data"
  ON user_affiliates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid()
    )
  );

-- Create function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM user_affiliates WHERE affiliate_code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create function to update affiliate stats
CREATE OR REPLACE FUNCTION update_affiliate_stats(affiliate_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_affiliates SET
    total_referrals = (
      SELECT COUNT(*) 
      FROM affiliate_referrals 
      WHERE affiliate_referrals.affiliate_user_id = update_affiliate_stats.affiliate_user_id
    ),
    total_earnings = (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM affiliate_referrals 
      WHERE affiliate_referrals.affiliate_user_id = update_affiliate_stats.affiliate_user_id
        AND subscription_id IS NOT NULL
    ),
    total_received = (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM affiliate_referrals 
      WHERE affiliate_referrals.affiliate_user_id = update_affiliate_stats.affiliate_user_id
        AND commission_status = 'paid'
    ),
    total_pending = (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM affiliate_referrals 
      WHERE affiliate_referrals.affiliate_user_id = update_affiliate_stats.affiliate_user_id
        AND commission_status = 'pending'
        AND subscription_id IS NOT NULL
    ),
    updated_at = now()
  WHERE user_id = affiliate_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create admin view for affiliate referrals
CREATE OR REPLACE VIEW admin_affiliate_referrals AS
SELECT 
  ar.id,
  ar.created_at,
  ar.commission_amount,
  ar.commission_status,
  ar.paid_at,
  ar.subscription_id,
  ua.affiliate_code,
  up_affiliate.name as affiliate_name,
  au_affiliate.email as affiliate_email,
  up_referred.name as referred_name,
  au_referred.email as referred_email,
  ss.price_id,
  ss.status as subscription_status
FROM affiliate_referrals ar
LEFT JOIN user_affiliates ua ON ua.user_id = ar.affiliate_user_id
LEFT JOIN user_profiles up_affiliate ON up_affiliate.user_id = ar.affiliate_user_id
LEFT JOIN auth.users au_affiliate ON au_affiliate.id = ar.affiliate_user_id
LEFT JOIN user_profiles up_referred ON up_referred.user_id = ar.referred_user_id
LEFT JOIN auth.users au_referred ON au_referred.id = ar.referred_user_id
LEFT JOIN stripe_subscriptions ss ON ss.subscription_id = ar.subscription_id;

-- Create triggers for updated_at
CREATE TRIGGER update_user_affiliates_updated_at
  BEFORE UPDATE ON user_affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_affiliate_referrals_updated_at
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_affiliates_user_id ON user_affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_affiliates_affiliate_code ON user_affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_user_id ON affiliate_referrals(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user_id ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_subscription_id ON affiliate_referrals(subscription_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_commission_status ON affiliate_referrals(commission_status);