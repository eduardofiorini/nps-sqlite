/*
  # Fix admin users function to list all users

  1. Function Updates
    - Remove any restrictive filters
    - Ensure all users from auth.users are returned
    - Maintain admin permission check for security
    - Include complete user data with profiles

  2. Security
    - Keep admin verification
    - Return all users for authorized admins
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

  -- Return ALL users from auth.users with their profiles
  RETURN QUERY
  SELECT 
    COALESCE(up.id, gen_random_uuid()) as id,
    au.id as user_id,
    COALESCE(up.name, au.email) as name,
    au.email,
    up.phone,
    up.company,
    up.position,
    up.avatar,
    up.preferences,
    COALESCE(up.created_at, au.created_at) as created_at,
    COALESCE(up.updated_at, au.updated_at) as updated_at,
    up.trial_start_date
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.user_id
  ORDER BY COALESCE(up.created_at, au.created_at) DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;