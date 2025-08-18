/*
  # Create Admin RPC Functions

  1. RPC Functions
    - `get_admin_users()` - Returns user profiles with auth data for admins
    - `get_admin_subscriptions()` - Returns subscription data with user info for admins
  
  2. Security
    - Functions use SECURITY DEFINER to access auth.users table
    - RLS policies ensure only admin users can call these functions
    - Proper error handling and validation
  
  3. Data Access
    - Combines public tables with auth.users data
    - Returns comprehensive user and subscription information
    - Optimized queries with proper joins
*/

-- Function to get all users for admin view
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
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_admin 
    WHERE user_admin.user_id = auth.uid() 
    AND (permissions->>'view_users')::boolean = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return user data with auth information
  RETURN QUERY
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
  ORDER BY up.created_at DESC;
END;
$$;

-- Function to get all subscriptions for admin view
CREATE OR REPLACE FUNCTION get_admin_subscriptions()
RETURNS TABLE (
  user_id uuid,
  customer_id text,
  subscription_id text,
  subscription_status stripe_subscription_status,
  price_id text,
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean,
  payment_method_brand text,
  payment_method_last4 text,
  user_name text,
  user_email varchar(255),
  user_company text,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_admin 
    WHERE user_admin.user_id = auth.uid() 
    AND (permissions->>'view_subscriptions')::boolean = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return subscription data with user information
  RETURN QUERY
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
  WHERE sc.deleted_at IS NULL
    AND (ss.deleted_at IS NULL OR ss.deleted_at IS NULL)
  ORDER BY ss.created_at DESC NULLS LAST;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_subscriptions() TO authenticated;