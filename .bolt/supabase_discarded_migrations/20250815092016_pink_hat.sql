/*
  # Fix Admin Views Permissions

  1. Views Updates
    - Recreate `admin_user_profiles` view with proper security definer
    - Recreate `admin_user_subscriptions_full` view with proper security definer
    - Grant proper permissions to authenticated users

  2. Security
    - Views run with elevated privileges (security definer)
    - Only admin users can access through RLS policies
    - Proper access to auth.users table through views
*/

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.admin_user_profiles;
DROP VIEW IF EXISTS public.admin_user_subscriptions_full;

-- Create admin_user_profiles view with security definer
CREATE VIEW public.admin_user_profiles 
WITH (security_invoker = off) AS
SELECT
    p.id,
    u.id AS user_id,
    p.name,
    u.email,
    p.phone,
    p.company,
    p.position,
    p.avatar,
    p.preferences,
    p.created_at,
    p.updated_at,
    p.trial_start_date
FROM
    auth.users u
LEFT JOIN
    public.user_profiles p ON u.id = p.user_id
WHERE
    u.deleted_at IS NULL;

-- Create admin_user_subscriptions_full view with security definer
CREATE VIEW public.admin_user_subscriptions_full 
WITH (security_invoker = off) AS
SELECT
    sc.user_id,
    sc.customer_id,
    ss.subscription_id,
    ss.status AS subscription_status,
    ss.price_id,
    ss.current_period_start,
    ss.current_period_end,
    ss.cancel_at_period_end,
    ss.payment_method_brand,
    ss.payment_method_last4,
    p.name AS user_name,
    u.email AS user_email,
    p.company AS user_company,
    sc.created_at,
    sc.updated_at
FROM
    public.stripe_customers sc
LEFT JOIN
    public.stripe_subscriptions ss ON sc.customer_id = ss.customer_id AND ss.deleted_at IS NULL
LEFT JOIN
    auth.users u ON sc.user_id = u.id
LEFT JOIN
    public.user_profiles p ON sc.user_id = p.user_id
WHERE
    sc.deleted_at IS NULL AND u.deleted_at IS NULL;

-- Set proper ownership for the views
ALTER VIEW public.admin_user_profiles OWNER TO supabase_admin;
ALTER VIEW public.admin_user_subscriptions_full OWNER TO supabase_admin;

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON public.admin_user_profiles TO authenticated;
GRANT SELECT ON public.admin_user_subscriptions_full TO authenticated;

-- Enable RLS on the views
ALTER VIEW public.admin_user_profiles SET (security_barrier = true);
ALTER VIEW public.admin_user_subscriptions_full SET (security_barrier = true);

-- Create RLS policies for admin access only
CREATE POLICY "Admin users can view all user profiles"
  ON public.admin_user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_admin 
      WHERE user_id = auth.uid() 
      AND (permissions->>'view_users')::boolean = true
    )
  );

CREATE POLICY "Admin users can view all subscription data"
  ON public.admin_user_subscriptions_full
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_admin 
      WHERE user_id = auth.uid() 
      AND (permissions->>'view_subscriptions')::boolean = true
    )
  );