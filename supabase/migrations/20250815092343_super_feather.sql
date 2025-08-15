/*
  # Create Admin RPC Functions

  1. Functions
    - `get_admin_users()` - Returns all users with profile data
    - `get_admin_subscriptions()` - Returns all subscriptions with user data
  
  2. Security
    - Functions use SECURITY DEFINER to access auth.users
    - Only admin users can execute these functions
    - Proper RLS validation within functions
  
  3. Permissions
    - Grant EXECUTE to authenticated role
    - Functions validate admin status before returning data
*/

-- Function to get all users for admin
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_admin 
    WHERE user_id = auth.uid() 
    AND (permissions->>'view_users')::boolean = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT
    jsonb_build_object(
      'id', up.id,
      'user_id', up.user_id,
      'name', up.name,
      'email', au.email,
      'phone', up.phone,
      'company', up.company,
      'position', up.position,
      'avatar', up.avatar,
      'preferences', up.preferences,
      'created_at', up.created_at,
      'updated_at', up.updated_at,
      'trial_start_date', up.trial_start_date,
      'email_confirmed_at', au.email_confirmed_at,
      'last_sign_in_at', au.last_sign_in_at
    )
  FROM
    public.user_profiles up
  LEFT JOIN
    auth.users au ON up.user_id = au.id
  ORDER BY up.created_at DESC;
END;
$function$;

-- Function to get all subscriptions for admin
CREATE OR REPLACE FUNCTION public.get_admin_subscriptions()
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_admin 
    WHERE user_id = auth.uid() 
    AND (permissions->>'view_subscriptions')::boolean = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT
    jsonb_build_object(
      'user_id', sc.user_id,
      'customer_id', ss.customer_id,
      'subscription_id', ss.subscription_id,
      'subscription_status', ss.status,
      'price_id', ss.price_id,
      'current_period_start', ss.current_period_start,
      'current_period_end', ss.current_period_end,
      'cancel_at_period_end', ss.cancel_at_period_end,
      'payment_method_brand', ss.payment_method_brand,
      'payment_method_last4', ss.payment_method_last4,
      'created_at', ss.created_at,
      'updated_at', ss.updated_at,
      'user_name', up.name,
      'user_email', au.email,
      'user_company', up.company
    )
  FROM
    public.stripe_subscriptions ss
  LEFT JOIN
    public.stripe_customers sc ON ss.customer_id = sc.customer_id
  LEFT JOIN
    public.user_profiles up ON sc.user_id = up.user_id
  LEFT JOIN
    auth.users au ON sc.user_id = au.id
  WHERE
    ss.deleted_at IS NULL
    AND sc.deleted_at IS NULL
  ORDER BY ss.created_at DESC;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_subscriptions() TO authenticated;