/*
  # Create Affiliate System Tables

  1. New Tables
    - `user_affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `affiliate_code` (text, unique)
      - `bank_account` (jsonb)
      - `total_referrals` (integer)
      - `total_earnings` (numeric)
      - `total_received` (numeric)
      - `total_pending` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `affiliate_referrals`
      - `id` (uuid, primary key)
      - `affiliate_user_id` (uuid, foreign key to users)
      - `referred_user_id` (uuid, foreign key to users)
      - `subscription_id` (text, optional)
      - `commission_amount` (numeric)
      - `commission_status` (enum)
      - `paid_at` (timestamp, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for admin access

  3. Functions
    - `generate_affiliate_code()` - generates unique codes
    - `update_affiliate_stats()` - updates affiliate statistics
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
  total_earnings numeric(10,2) DEFAULT 0,
  total_received numeric(10,2) DEFAULT 0,
  total_pending numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create affiliate_referrals table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id text,
  commission_amount numeric(10,2) DEFAULT 0,
  commission_status commission_status DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_affiliates
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

-- RLS Policies for affiliate_referrals
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

-- Admin policies (for users with admin permissions)
CREATE POLICY "Admins can view all affiliate data"
  ON user_affiliates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid() 
      AND (permissions->>'view_users')::boolean = true
    )
  );

CREATE POLICY "Admins can view all referrals"
  ON affiliate_referrals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid() 
      AND (permissions->>'view_users')::boolean = true
    )
  );

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
    -- Generate random 8-character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM user_affiliates WHERE affiliate_code = code) INTO exists;
    
    -- Exit loop if code is unique
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Function to update affiliate statistics
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update affiliate statistics when referral changes
  UPDATE user_affiliates SET
    total_referrals = (
      SELECT COUNT(*) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = NEW.affiliate_user_id
    ),
    total_earnings = (
      SELECT COALESCE(SUM(commission_amount), 0) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = NEW.affiliate_user_id
    ),
    total_received = (
      SELECT COALESCE(SUM(commission_amount), 0) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = NEW.affiliate_user_id 
      AND commission_status = 'paid'
    ),
    total_pending = (
      SELECT COALESCE(SUM(commission_amount), 0) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = NEW.affiliate_user_id 
      AND commission_status = 'pending'
    ),
    updated_at = now()
  WHERE user_id = NEW.affiliate_user_id;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER update_user_affiliates_updated_at
  BEFORE UPDATE ON user_affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_affiliate_referrals_updated_at
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_affiliate_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_affiliates_user_id ON user_affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_affiliates_code ON user_affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_user ON affiliate_referrals(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(commission_status);

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
  ap.name as affiliate_name,
  au.email as affiliate_email,
  rp.name as referred_name,
  ru.email as referred_email,
  ss.price_id,
  ss.status as subscription_status
FROM affiliate_referrals ar
JOIN user_affiliates ua ON ar.affiliate_user_id = ua.user_id
JOIN users au ON ar.affiliate_user_id = au.id
JOIN users ru ON ar.referred_user_id = ru.id
LEFT JOIN user_profiles ap ON ar.affiliate_user_id = ap.user_id
LEFT JOIN user_profiles rp ON ar.referred_user_id = rp.user_id
LEFT JOIN stripe_subscriptions ss ON ar.subscription_id = ss.subscription_id
ORDER BY ar.created_at DESC;