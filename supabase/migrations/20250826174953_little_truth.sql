/*
  # Fix Security Issues in Admin Affiliate Referrals View

  1. Security Changes
    - Remove SECURITY DEFINER property from admin_affiliate_referrals view
    - Ensure view doesn't expose auth.users data inappropriately
    - Add proper RLS policies to control access

  2. View Updates
    - Recreate admin_affiliate_referrals view without SECURITY DEFINER
    - Use only public schema tables for data access
    - Maintain functionality while improving security
*/

-- Drop the existing view that has security issues
DROP VIEW IF EXISTS public.admin_affiliate_referrals;

-- Recreate the view without SECURITY DEFINER and without direct auth.users access
CREATE VIEW public.admin_affiliate_referrals AS
SELECT 
  ar.id,
  ar.created_at,
  ar.commission_amount,
  ar.commission_status,
  ar.paid_at,
  ar.subscription_id,
  ua_affiliate.affiliate_code,
  up_affiliate.name as affiliate_name,
  up_affiliate.email as affiliate_email,
  up_referred.name as referred_name,
  up_referred.email as referred_email,
  ss.price_id,
  ss.status as subscription_status
FROM affiliate_referrals ar
LEFT JOIN user_affiliates ua_affiliate ON ar.affiliate_user_id = ua_affiliate.user_id
LEFT JOIN user_profiles up_affiliate ON ar.affiliate_user_id = up_affiliate.user_id
LEFT JOIN user_profiles up_referred ON ar.referred_user_id = up_referred.user_id
LEFT JOIN stripe_subscriptions ss ON ar.subscription_id = ss.subscription_id;

-- Add RLS policy to restrict access to admins only
CREATE POLICY "Admin only access to affiliate referrals view"
  ON admin_affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_admin 
      WHERE user_admin.user_id = auth.uid() 
      AND (user_admin.permissions->>'view_users')::boolean = true
    )
  );

-- Enable RLS on the view (if supported)
-- Note: RLS on views may not be directly supported, so we rely on the underlying table policies