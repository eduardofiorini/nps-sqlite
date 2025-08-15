/*
  # Fix admin users function to return all users

  1. Functions
    - Update `get_admin_users()` to return ALL users from auth.users
    - Join with user_profiles to get additional data
    - Only check if current user is admin, not filter results by admin status

  2. Security
    - Maintain admin permission check
    - Return all users regardless of their admin status
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_admin_users();

-- Create updated function that returns ALL users
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email varchar(255),
  phone text,
  company text,
  position text,
  avatar text,
  preferences jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  trial_start_date timestamptz
)
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_admin 
    WHERE user_admin.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return ALL users from auth.users joined with user_profiles
  RETURN QUERY
  SELECT 
    up.id,
    au.id as user_id,
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
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.user_id
  ORDER BY up.created_at DESC NULLS LAST;
END;
$$;