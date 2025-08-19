/*
  # Create affiliate system tables

  1. New Tables
    - `user_affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `affiliate_code` (text, unique)
      - `bank_account` (jsonb)
      - `total_referrals` (integer, default 0)
      - `total_earnings` (numeric, default 0)
      - `total_received` (numeric, default 0)
      - `total_pending` (numeric, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `affiliate_referrals`
      - `id` (uuid, primary key)
      - `affiliate_user_id` (uuid, foreign key to auth.users)
      - `referred_user_id` (uuid, foreign key to auth.users)
      - `subscription_id` (text, nullable)
      - `commission_amount` (numeric)
      - `commission_status` (enum: pending, paid, cancelled)
      - `paid_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Views
    - `admin_affiliate_referrals` - Admin view with user details

  3. Security
    - Enable RLS on all tables
    - Add policies for user access and admin access
    - Add triggers for updated_at timestamps
*/

-- Create enum for commission status
CREATE TYPE commission_status AS ENUM ('pending', 'paid', 'cancelled');

-- Create user_affiliates table
CREATE TABLE IF NOT EXISTS user_affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  affiliate_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id text,
  commission_amount numeric(10,2) NOT NULL DEFAULT 0,
  commission_status commission_status DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_affiliates_user_id_idx ON user_affiliates(user_id);
CREATE INDEX IF NOT EXISTS user_affiliates_affiliate_code_idx ON user_affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS affiliate_referrals_affiliate_user_id_idx ON affiliate_referrals(affiliate_user_id);
CREATE INDEX IF NOT EXISTS affiliate_referrals_referred_user_id_idx ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS affiliate_referrals_status_idx ON affiliate_referrals(commission_status);

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

CREATE POLICY "System can insert referrals"
  ON affiliate_referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin policies (for users with admin permissions)
CREATE POLICY "Admins can view all affiliate data"
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

CREATE POLICY "Admins can view all referrals"
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

CREATE POLICY "Admins can update referral status"
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

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_user_affiliates_updated_at
  BEFORE UPDATE ON user_affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_affiliate_referrals_updated_at
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to update affiliate statistics
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update affiliate statistics when referral status changes
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.commission_status != NEW.commission_status) THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update affiliate stats
CREATE TRIGGER update_affiliate_stats_trigger
  AFTER INSERT OR UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats();

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
LEFT JOIN stripe_subscriptions ss ON ss.subscription_id = ar.subscription_id
ORDER BY ar.created_at DESC;

-- Grant access to the view for admins
GRANT SELECT ON admin_affiliate_referrals TO authenticated;