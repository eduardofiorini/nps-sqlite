/*
  # Create Affiliate System

  1. New Tables
    - `user_affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `affiliate_code` (text, unique)
      - `bank_account` (jsonb)
      - `total_referrals` (integer)
      - `total_earnings` (decimal)
      - `total_received` (decimal)
      - `total_pending` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `affiliate_referrals`
      - `id` (uuid, primary key)
      - `affiliate_user_id` (uuid, foreign key to users)
      - `referred_user_id` (uuid, foreign key to users)
      - `subscription_id` (text, nullable)
      - `commission_amount` (decimal)
      - `commission_status` (enum: pending, paid, cancelled)
      - `paid_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Views
    - `admin_affiliate_referrals` - comprehensive view for admin

  3. Functions
    - `generate_affiliate_code()` - generates unique codes
    - `update_affiliate_stats()` - updates affiliate statistics

  4. Security
    - Enable RLS on all tables
    - Add policies for users and admins
    - Create indexes for performance
*/

-- Create affiliate code generation function
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS text AS $$
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
$$ LANGUAGE plpgsql;

-- Create user_affiliates table
CREATE TABLE IF NOT EXISTS user_affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affiliate_code text UNIQUE NOT NULL DEFAULT generate_affiliate_code(),
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

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS user_affiliates_user_id_key ON user_affiliates(user_id);

-- Enable RLS
ALTER TABLE user_affiliates ENABLE ROW LEVEL SECURITY;

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

-- Create affiliate_referrals table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS affiliate_referrals_affiliate_user_id_idx ON affiliate_referrals(affiliate_user_id);
CREATE INDEX IF NOT EXISTS affiliate_referrals_referred_user_id_idx ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS affiliate_referrals_commission_status_idx ON affiliate_referrals(commission_status);

-- Enable RLS
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

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
LEFT JOIN users au ON ar.affiliate_user_id = au.id
LEFT JOIN users ru ON ar.referred_user_id = ru.id
LEFT JOIN user_profiles ap ON ar.affiliate_user_id = ap.user_id
LEFT JOIN user_profiles rp ON ar.referred_user_id = rp.user_id
LEFT JOIN stripe_subscriptions ss ON ar.subscription_id = ss.subscription_id;

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
    ),
    updated_at = now()
  WHERE user_id = affiliate_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_affiliates_updated_at'
  ) THEN
    CREATE TRIGGER update_user_affiliates_updated_at
      BEFORE UPDATE ON user_affiliates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
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
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;