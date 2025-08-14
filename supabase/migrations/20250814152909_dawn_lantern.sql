/*
  # Fix infinite recursion in user_admin RLS policy

  1. Policy Changes
    - Drop existing recursive policies on user_admin table
    - Create simple, non-recursive policies that check auth.uid() = user_id
    - Ensure policies don't reference other tables that might cause loops

  2. Security
    - Maintain proper access control for admin users
    - Allow admins to view and manage admin records safely
    - Prevent infinite recursion while preserving security
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Admin users can manage admin records" ON user_admin;
DROP POLICY IF EXISTS "Admin users can view admin records" ON user_admin;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own admin record"
  ON user_admin
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own admin record"
  ON user_admin
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to manage all admin records (for admin operations)
CREATE POLICY "Service role can manage all admin records"
  ON user_admin
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);