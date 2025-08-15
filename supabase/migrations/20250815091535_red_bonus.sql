/*
  # Create user_admin table

  1. New Tables
    - `user_admin`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `permissions` (jsonb, admin permissions)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_admin` table
    - Add policy for admin users to read their own admin data
    - Add policy for admin users to read all user data
    - Add policy for admin users to read all subscription data

  3. Initial Data
    - Insert admin user with specified user_id
*/

-- Create user_admin table
CREATE TABLE IF NOT EXISTS user_admin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions jsonb DEFAULT '{"view_users": true, "view_subscriptions": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_admin ENABLE ROW LEVEL SECURITY;

-- Create policies for user_admin table
CREATE POLICY "Admin users can view their admin data"
  ON user_admin
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create view for admin users to see all user profiles
CREATE OR REPLACE VIEW admin_user_profiles AS
SELECT 
  up.id,
  up.user_id,
  up.name,
  au.email,
  up.phone,
  up.company,
  up.position,
  up.avatar,
  up.preferences,
  up.created_at,
  up.updated_at,
  up.trial_start_date
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE EXISTS (
  SELECT 1 FROM user_admin ua 
  WHERE ua.user_id = auth.uid() 
  AND ua.permissions->>'view_users' = 'true'
);

-- Enable RLS on the view
ALTER VIEW admin_user_profiles SET (security_invoker = true);

-- Create view for admin users to see all subscriptions
CREATE OR REPLACE VIEW admin_user_subscriptions_full AS
SELECT 
  sc.user_id,
  sc.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4,
  up.name as user_name,
  au.email as user_email,
  up.company as user_company,
  ss.created_at,
  ss.updated_at
FROM stripe_customers sc
LEFT JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
LEFT JOIN user_profiles up ON sc.user_id = up.user_id
LEFT JOIN auth.users au ON sc.user_id = au.id
WHERE EXISTS (
  SELECT 1 FROM user_admin ua 
  WHERE ua.user_id = auth.uid() 
  AND ua.permissions->>'view_subscriptions' = 'true'
)
AND sc.deleted_at IS NULL
AND (ss.deleted_at IS NULL OR ss.deleted_at IS NULL);

-- Enable RLS on the view
ALTER VIEW admin_user_subscriptions_full SET (security_invoker = true);

-- Insert the specified admin user
INSERT INTO user_admin (user_id, permissions) 
VALUES (
  'd0a6cf1d-ea8b-4dfa-95a5-8b3a2480a6ea',
  '{"view_users": true, "view_subscriptions": true}'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  updated_at = now();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_admin_updated_at'
  ) THEN
    CREATE TRIGGER update_user_admin_updated_at
      BEFORE UPDATE ON user_admin
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;