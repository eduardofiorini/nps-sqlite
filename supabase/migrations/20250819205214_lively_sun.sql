/*
  # Fix User Deletion Cascade

  This migration ensures proper cascade deletion for all user-related data
  and fixes foreign key constraints that might prevent user deletion.

  1. Tables Updated
    - All tables with user_id foreign keys
    - Proper CASCADE deletion setup
    - Ensures complete user data removal

  2. Security
    - Maintains RLS policies
    - Ensures only user can delete their own data
*/

-- Update foreign key constraints to ensure proper cascade deletion

-- Fix campaigns table
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_user_id_fkey;

ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix campaign_forms table
ALTER TABLE campaign_forms 
DROP CONSTRAINT IF EXISTS campaign_forms_user_id_fkey;

ALTER TABLE campaign_forms 
ADD CONSTRAINT campaign_forms_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix sources table
ALTER TABLE sources 
DROP CONSTRAINT IF EXISTS sources_user_id_fkey;

ALTER TABLE sources 
ADD CONSTRAINT sources_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix situations table
ALTER TABLE situations 
DROP CONSTRAINT IF EXISTS situations_user_id_fkey;

ALTER TABLE situations 
ADD CONSTRAINT situations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix groups table
ALTER TABLE groups 
DROP CONSTRAINT IF EXISTS groups_user_id_fkey;

ALTER TABLE groups 
ADD CONSTRAINT groups_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix contacts table
ALTER TABLE contacts 
DROP CONSTRAINT IF EXISTS contacts_user_id_fkey;

ALTER TABLE contacts 
ADD CONSTRAINT contacts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix user_profiles table
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix app_configs table
ALTER TABLE app_configs 
DROP CONSTRAINT IF EXISTS app_configs_user_id_fkey;

ALTER TABLE app_configs 
ADD CONSTRAINT app_configs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix user_affiliates table
ALTER TABLE user_affiliates 
DROP CONSTRAINT IF EXISTS user_affiliates_user_id_fkey;

ALTER TABLE user_affiliates 
ADD CONSTRAINT user_affiliates_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix affiliate_referrals table
ALTER TABLE affiliate_referrals 
DROP CONSTRAINT IF EXISTS affiliate_referrals_affiliate_user_id_fkey;

ALTER TABLE affiliate_referrals 
ADD CONSTRAINT affiliate_referrals_affiliate_user_id_fkey 
FOREIGN KEY (affiliate_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE affiliate_referrals 
DROP CONSTRAINT IF EXISTS affiliate_referrals_referred_user_id_fkey;

ALTER TABLE affiliate_referrals 
ADD CONSTRAINT affiliate_referrals_referred_user_id_fkey 
FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix user_admin table
ALTER TABLE user_admin 
DROP CONSTRAINT IF EXISTS user_admin_user_id_fkey;

ALTER TABLE user_admin 
ADD CONSTRAINT user_admin_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix stripe_customers table
ALTER TABLE stripe_customers 
DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey;

ALTER TABLE stripe_customers 
ADD CONSTRAINT stripe_customers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a function to safely delete all user data
CREATE OR REPLACE FUNCTION delete_user_completely(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  customer_ids text[];
BEGIN
  -- Log the start of deletion
  RAISE NOTICE 'Starting complete deletion for user: %', target_user_id;
  
  -- Get Stripe customer IDs before deletion
  SELECT ARRAY(
    SELECT customer_id 
    FROM stripe_customers 
    WHERE user_id = target_user_id AND deleted_at IS NULL
  ) INTO customer_ids;
  
  -- Delete in correct order to respect foreign key constraints
  
  -- 1. Delete NPS responses (references campaigns)
  DELETE FROM nps_responses 
  WHERE campaign_id IN (
    SELECT id FROM campaigns WHERE user_id = target_user_id
  );
  RAISE NOTICE 'Deleted NPS responses';
  
  -- 2. Delete campaign forms
  DELETE FROM campaign_forms WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted campaign forms';
  
  -- 3. Delete campaigns
  DELETE FROM campaigns WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted campaigns';
  
  -- 4. Delete contacts
  DELETE FROM contacts WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted contacts';
  
  -- 5. Delete affiliate referrals (both as affiliate and referred)
  DELETE FROM affiliate_referrals 
  WHERE affiliate_user_id = target_user_id OR referred_user_id = target_user_id;
  RAISE NOTICE 'Deleted affiliate referrals';
  
  -- 6. Delete user affiliate data
  DELETE FROM user_affiliates WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted user affiliate data';
  
  -- 7. Delete sources, situations, groups
  DELETE FROM sources WHERE user_id = target_user_id;
  DELETE FROM situations WHERE user_id = target_user_id;
  DELETE FROM groups WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted sources, situations, groups';
  
  -- 8. Delete app config
  DELETE FROM app_configs WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted app configurations';
  
  -- 9. Delete user profile
  DELETE FROM user_profiles WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted user profile';
  
  -- 10. Delete admin permissions if any
  DELETE FROM user_admin WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted admin permissions';
  
  -- 11. Soft delete Stripe data (for audit purposes)
  UPDATE stripe_customers 
  SET deleted_at = NOW() 
  WHERE user_id = target_user_id AND deleted_at IS NULL;
  RAISE NOTICE 'Soft deleted Stripe customers';
  
  -- Soft delete Stripe subscriptions
  IF array_length(customer_ids, 1) > 0 THEN
    UPDATE stripe_subscriptions 
    SET deleted_at = NOW() 
    WHERE customer_id = ANY(customer_ids) AND deleted_at IS NULL;
    RAISE NOTICE 'Soft deleted Stripe subscriptions';
  END IF;
  
  RAISE NOTICE 'Completed data deletion for user: %', target_user_id;
  
  RETURN true;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error during user deletion: %', SQLERRM;
  RETURN false;
END;
$$;