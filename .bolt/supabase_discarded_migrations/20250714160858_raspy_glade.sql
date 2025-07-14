/*
  # Delete User Data Function

  1. Purpose
    - Provides a secure way for users to delete all their data
    - Complies with LGPD (Brazil) and GDPR (EU) right to be forgotten
  
  2. What it does
    - Deletes all user data from all tables
    - Maintains referential integrity by using cascading deletes
    - Returns success status
*/

CREATE OR REPLACE FUNCTION public.delete_user_data()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_customer_id text;
  v_success boolean := false;
BEGIN
  -- Get the user ID from the current session
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get Stripe customer ID if exists
  SELECT customer_id INTO v_customer_id
  FROM stripe_customers
  WHERE user_id = v_user_id;
  
  -- Delete all user data
  -- The ON DELETE CASCADE constraints will handle related records
  
  -- Delete app_configs
  DELETE FROM app_configs WHERE user_id = v_user_id;
  
  -- Delete user_profiles
  DELETE FROM user_profiles WHERE user_id = v_user_id;
  
  -- Delete campaigns (will cascade to campaign_forms and nps_responses)
  DELETE FROM campaigns WHERE user_id = v_user_id;
  
  -- Delete contacts
  DELETE FROM contacts WHERE user_id = v_user_id;
  
  -- Delete groups
  DELETE FROM groups WHERE user_id = v_user_id;
  
  -- Delete sources
  DELETE FROM sources WHERE user_id = v_user_id;
  
  -- Delete situations
  DELETE FROM situations WHERE user_id = v_user_id;
  
  -- Delete stripe_customers (will cascade to stripe_subscriptions)
  IF v_customer_id IS NOT NULL THEN
    DELETE FROM stripe_customers WHERE customer_id = v_customer_id;
  END IF;
  
  v_success := true;
  RETURN v_success;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting user data: %', SQLERRM;
    RETURN false;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_data() TO authenticated;

COMMENT ON FUNCTION public.delete_user_data() IS 'Deletes all data associated with the current user - LGPD/GDPR compliance';