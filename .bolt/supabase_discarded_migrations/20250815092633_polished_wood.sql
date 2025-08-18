/*
  # Fix admin users function

  1. Functions
    - Fix `get_admin_users()` to properly return user data
    - Ensure correct JSON structure and data types
    - Add proper error handling

  2. Security
    - Maintain admin permission checks
    - Keep SECURITY DEFINER for elevated privileges
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_admin_users();

-- Create the corrected admin users function
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email text,
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
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_admin 
    WHERE user_admin.user_id = auth.uid() 
    AND (user_admin.permissions->>'view_users')::boolean = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return user data with profile information
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.name,
    au.email::text,
    up.phone,
    up.company,
    up.position,
    up.avatar,
    up.preferences,
    up.created_at,
    up.updated_at,
    up.trial_start_date
  FROM user_profiles up
  INNER JOIN auth.users au ON au.id = up.user_id
  ORDER BY up.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;