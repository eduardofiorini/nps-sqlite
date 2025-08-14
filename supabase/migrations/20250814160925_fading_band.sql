/*
  # Fix trial subscriptions and ensure proper setup

  1. Updates
    - Fix subscription status enum to include all Stripe statuses
    - Ensure proper trial subscription creation
    - Add function to create trial subscriptions for existing users

  2. Security
    - Maintain existing RLS policies
    - Add function for trial creation
*/

-- Update subscription_status enum to include all possible Stripe statuses
DO $$
BEGIN
  -- Check if the enum needs to be updated
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'incomplete' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_status')
  ) THEN
    -- Add missing enum values
    ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'incomplete';
    ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'incomplete_expired';
    ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'past_due';
    ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'unpaid';
    ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'paused';
  END IF;
END $$;

-- Function to create trial subscription for a user
CREATE OR REPLACE FUNCTION create_trial_subscription(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_end_timestamp bigint;
BEGIN
  -- Calculate trial end date (7 days from now)
  trial_end_timestamp := EXTRACT(EPOCH FROM (NOW() + INTERVAL '7 days'));
  
  -- Create customer record if it doesn't exist
  INSERT INTO stripe_customers (user_id, customer_id)
  VALUES (user_id_param, user_id_param::text)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create trial subscription
  INSERT INTO stripe_subscriptions (
    customer_id,
    subscription_status,
    price_id,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    status
  )
  VALUES (
    user_id_param::text,
    'trialing',
    'price_pro',
    EXTRACT(EPOCH FROM NOW()),
    trial_end_timestamp,
    false,
    'trialing'
  )
  ON CONFLICT (customer_id) DO UPDATE SET
    subscription_status = EXCLUDED.subscription_status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    status = EXCLUDED.status;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_trial_subscription(uuid) TO authenticated;

-- Function to check if user has active subscription or trial
CREATE OR REPLACE FUNCTION user_has_active_access(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_record RECORD;
  has_access boolean := false;
BEGIN
  -- Get user's subscription
  SELECT * INTO subscription_record
  FROM stripe_subscriptions ss
  JOIN stripe_customers sc ON ss.customer_id = sc.customer_id
  WHERE sc.user_id = user_id_param;
  
  IF subscription_record IS NOT NULL THEN
    -- Check if subscription is active or in trial
    IF subscription_record.subscription_status IN ('active', 'trialing') THEN
      -- For trialing, check if trial hasn't expired
      IF subscription_record.subscription_status = 'trialing' THEN
        has_access := subscription_record.current_period_end > EXTRACT(EPOCH FROM NOW());
      ELSE
        has_access := true;
      END IF;
    END IF;
  END IF;
  
  RETURN has_access;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION user_has_active_access(uuid) TO authenticated;

-- Update the user_subscriptions view to handle trial expiration better
DROP VIEW IF EXISTS user_subscriptions;

CREATE VIEW user_subscriptions AS
SELECT 
  sc.user_id,
  sc.customer_id,
  ss.subscription_id,
  ss.price_id,
  ss.subscription_status,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4,
  ss.status,
  CASE 
    WHEN ss.subscription_status = 'trialing' AND ss.current_period_end IS NOT NULL 
    THEN ss.current_period_end < EXTRACT(EPOCH FROM NOW())
    ELSE false
  END as trial_expired
FROM stripe_customers sc
LEFT JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE sc.deleted_at IS NULL;</parameter>