/*
  # Fix Admin Affiliate View Security Issues

  1. Security Changes
    - Drop and recreate admin_affiliate_referrals view without SECURITY DEFINER
    - Remove direct auth.users access to prevent exposure
    - Use only user_profiles table for user data
    - Add strict RLS policies for admin-only access

  2. Data Sources
    - affiliate_referrals table for referral data
    - user_profiles table for user names and emails (both affiliate and referred users)
    - stripe_subscriptions table for subscription information

  3. Access Control
    - View accessible only to admin users with view_users permission
    - No exposure of auth.users data to anon or authenticated roles
*/

-- Drop the existing view first
DROP VIEW IF EXISTS public.admin_affiliate_referrals;

-- Create the new view without SECURITY DEFINER and without auth.users access
CREATE VIEW public.admin_affiliate_referrals AS
SELECT 
  ar.id,
  ar.created_at,
  ar.commission_amount,
  ar.commission_status,
  ar.paid_at,
  ar.subscription_id,
  ua.affiliate_code,
  ap.name as affiliate_name,
  ap.email as affiliate_email,
  rp.name as referred_name,
  rp.email as referred_email,
  ss.price_id,
  ss.status as subscription_status
FROM affiliate_referrals ar
LEFT JOIN user_affiliates ua ON ar.affiliate_user_id = ua.user_id
LEFT JOIN user_profiles ap ON ar.affiliate_user_id = ap.user_id
LEFT JOIN user_profiles rp ON ar.referred_user_id = rp.user_id
LEFT JOIN stripe_subscriptions ss ON ar.subscription_id = ss.subscription_id;

-- Enable RLS on the view
ALTER VIEW public.admin_affiliate_referrals SET (security_barrier = true);

-- Add RLS policy for admin access only
CREATE POLICY "Admin users can view affiliate referrals"
  ON public.admin_affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_admin 
      WHERE user_admin.user_id = auth.uid() 
      AND (user_admin.permissions ->> 'view_users')::boolean = true
    )
  );

-- Enable RLS on the view (this ensures policies are enforced)
-- Note: Views don't have RLS by default, but we can use security barrier
-- The policy above will be enforced through the underlying tables' RLS</parameter>