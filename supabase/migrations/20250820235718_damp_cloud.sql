/*
  # Add user management functions for admin

  1. New Functions
    - `deactivate_user` - Function to deactivate a user account
    - `delete_user_account_admin` - Function for admin to delete user accounts
  
  2. Security
    - Only admin users can execute these functions
    - Proper validation and logging
*/

-- Function to deactivate a user (soft delete)
CREATE OR REPLACE FUNCTION deactivate_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the current user ID
  admin_user_id := auth.uid();
  
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_admin 
    WHERE user_id = admin_user_id 
    AND (permissions->>'view_users')::boolean = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Check if target user exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = target_user_id
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Update user profile to mark as deactivated
  UPDATE user_profiles 
  SET 
    preferences = COALESCE(preferences, '{}'::jsonb) || '{"deactivated": true, "deactivated_at": "' || now()::text || '", "deactivated_by": "' || admin_user_id::text || '"}'::jsonb,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Deactivate all user campaigns
  UPDATE campaigns 
  SET 
    active = false,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Function to reactivate a user
CREATE OR REPLACE FUNCTION reactivate_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the current user ID
  admin_user_id := auth.uid();
  
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_admin 
    WHERE user_id = admin_user_id 
    AND (permissions->>'view_users')::boolean = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Check if target user exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = target_user_id
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Update user profile to mark as reactivated
  UPDATE user_profiles 
  SET 
    preferences = COALESCE(preferences, '{}'::jsonb) || '{"deactivated": false, "reactivated_at": "' || now()::text || '", "reactivated_by": "' || admin_user_id::text || '"}'::jsonb,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Function for admin to delete user account completely
CREATE OR REPLACE FUNCTION delete_user_account_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the current user ID
  admin_user_id := auth.uid();
  
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_admin 
    WHERE user_id = admin_user_id 
    AND (permissions->>'view_users')::boolean = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Check if target user exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = target_user_id
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Don't allow admin to delete themselves
  IF admin_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot delete your own admin account';
  END IF;
  
  -- Call the existing delete_user_completely function
  PERFORM delete_user_completely(target_user_id);
  
  RETURN true;
END;
$$;

-- Update the admin_user_profiles view to include deactivation status
DROP VIEW IF EXISTS admin_user_profiles;
CREATE VIEW admin_user_profiles
WITH (security_invoker = true)
AS
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
  up.trial_start_date,
  COALESCE((up.preferences->>'deactivated')::boolean, false) as is_deactivated,
  up.preferences->>'deactivated_at' as deactivated_at,
  up.preferences->>'deactivated_by' as deactivated_by
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE EXISTS (
  SELECT 1 FROM user_admin ua 
  WHERE ua.user_id = auth.uid() 
  AND (ua.permissions->>'view_users')::boolean = true
);