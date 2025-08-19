/*
  # Create affiliate system tables

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
      - `subscription_id` (text, nullable)
      - `commission_amount` (numeric)
      - `commission_status` (enum: pending, paid, cancelled)
      - `paid_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own affiliate data
    - Add admin view for managing all referrals

  3. Functions
    - Trigger to update updated_at timestamps
    - Function to calculate affiliate statistics
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
  total_earnings numeric(10,2) DEFAULT 0.00,
  total_received numeric(10,2) DEFAULT 0.00,
  total_pending numeric(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create affiliate_referrals table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id text,
  commission_amount numeric(10,2) NOT NULL DEFAULT 0.00,
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
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affiliate data"
  ON user_affiliates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate data"
  ON user_affiliates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for affiliate_referrals
CREATE POLICY "Users can view their own referrals"
  ON affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = affiliate_user_id);

CREATE POLICY "Users can insert their own referrals"
  ON affiliate_referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = affiliate_user_id);

CREATE POLICY "Users can update their own referrals"
  ON affiliate_referrals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = affiliate_user_id);

-- Admin policies (for users in user_admin table)
CREATE POLICY "Admin users can view all affiliate data"
  ON user_affiliates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid() 
      AND (permissions->>'view_users')::boolean = true
    )
  );

CREATE POLICY "Admin users can view all referrals"
  ON affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid() 
      AND (permissions->>'view_users')::boolean = true
    )
  );

CREATE POLICY "Admin users can update referral status"
  ON affiliate_referrals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_id = auth.uid() 
      AND (permissions->>'view_users')::boolean = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_affiliates_user_id ON user_affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_affiliates_affiliate_code ON user_affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_user_id ON affiliate_referrals(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user_id ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(commission_status);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_affiliates_updated_at
  BEFORE UPDATE ON user_affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_referrals_updated_at
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
LEFT JOIN user_affiliates ua ON ar.affiliate_user_id = ua.user_id
LEFT JOIN user_profiles ap ON ar.affiliate_user_id = ap.user_id
LEFT JOIN auth.users au ON ar.affiliate_user_id = au.id
LEFT JOIN user_profiles rp ON ar.referred_user_id = rp.user_id
LEFT JOIN auth.users ru ON ar.referred_user_id = ru.id
LEFT JOIN stripe_subscriptions ss ON ar.subscription_id = ss.subscription_id
ORDER BY ar.created_at DESC;

-- Function to automatically create affiliate record for new users
CREATE OR REPLACE FUNCTION create_user_affiliate()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_affiliates (user_id, affiliate_code)
  VALUES (
    NEW.id,
    upper(substring(md5(random()::text) from 1 for 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create affiliate record when user profile is created
CREATE OR REPLACE TRIGGER create_affiliate_on_profile_creation
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_affiliate();

-- Function to update affiliate statistics
CREATE OR REPLACE FUNCTION update_affiliate_stats(affiliate_user_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_affiliates
  SET 
    total_referrals = (
      SELECT COUNT(*) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = affiliate_user_id_param
    ),
    total_earnings = (
      SELECT COALESCE(SUM(commission_amount), 0) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = affiliate_user_id_param
    ),
    total_received = (
      SELECT COALESCE(SUM(commission_amount), 0) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = affiliate_user_id_param 
      AND commission_status = 'paid'
    ),
    total_pending = (
      SELECT COALESCE(SUM(commission_amount), 0) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = affiliate_user_id_param 
      AND commission_status = 'pending'
    ),
    updated_at = now()
  WHERE user_id = affiliate_user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update affiliate stats when referrals change
CREATE OR REPLACE FUNCTION update_affiliate_stats_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats for the affiliate user
  PERFORM update_affiliate_stats(COALESCE(NEW.affiliate_user_id, OLD.affiliate_user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_affiliate_stats_on_referral_change
  AFTER INSERT OR UPDATE OR DELETE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats_trigger();