/*
  # Create admin system

  1. New Tables
    - `user_admin`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `permissions` (jsonb, admin permissions)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_admin` table
    - Add policies for admin access only

  3. Data
    - Insert admin user with UID 37fa7210-8123-4be3-b157-0eb587258ef3
*/

-- Create user_admin table
CREATE TABLE IF NOT EXISTS user_admin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions jsonb DEFAULT '{"users": true, "plans": true, "subscriptions": true, "settings": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_admin ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can view admin records"
  ON user_admin
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin ua 
      WHERE ua.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can manage admin records"
  ON user_admin
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin ua 
      WHERE ua.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_admin_updated_at
  BEFORE UPDATE ON user_admin
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert the admin user
INSERT INTO user_admin (user_id, permissions) 
VALUES (
  '37fa7210-8123-4be3-b157-0eb587258ef3',
  '{"users": true, "plans": true, "subscriptions": true, "settings": true}'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  updated_at = now();

-- Create a view to easily check if a user is admin
CREATE OR REPLACE VIEW user_is_admin AS
SELECT 
  u.id as user_id,
  u.email,
  CASE WHEN ua.user_id IS NOT NULL THEN true ELSE false END as is_admin,
  ua.permissions
FROM auth.users u
LEFT JOIN user_admin ua ON u.id = ua.user_id;

-- Grant access to the view
GRANT SELECT ON user_is_admin TO authenticated;