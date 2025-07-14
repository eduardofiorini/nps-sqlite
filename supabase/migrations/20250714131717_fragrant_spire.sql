/*
  # Add trial support

  1. Updates
    - Add trigger to check trial expiration on login
    - Add function to handle trial expiration
    - Update RLS policies to check trial status
*/

-- Create function to check if trial has expired
CREATE OR REPLACE FUNCTION public.check_trial_expiration()
RETURNS TRIGGER AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Get the user's subscription
  SELECT * INTO subscription_record
  FROM public.stripe_subscriptions
  WHERE customer_id IN (
    SELECT customer_id FROM public.stripe_customers
    WHERE user_id = auth.uid()
  )
  LIMIT 1;
  
  -- If subscription exists and is in trial status
  IF FOUND AND subscription_record.subscription_status = 'trialing' THEN
    -- Check if trial period has ended
    IF subscription_record.current_period_end IS NOT NULL AND 
       to_timestamp(subscription_record.current_period_end) < NOW() THEN
      -- Update subscription status to expired
      UPDATE public.stripe_subscriptions
      SET subscription_status = 'unpaid'
      WHERE id = subscription_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check trial expiration on auth.users table
DROP TRIGGER IF EXISTS check_trial_on_auth_event ON auth.users;
CREATE TRIGGER check_trial_on_auth_event
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.check_trial_expiration();

-- Update RLS policies to check subscription status
CREATE OR REPLACE FUNCTION public.is_subscription_active()
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record RECORD;
  is_active BOOLEAN;
BEGIN
  -- Get the user's subscription
  SELECT * INTO subscription_record
  FROM public.stripe_subscriptions
  WHERE customer_id IN (
    SELECT customer_id FROM public.stripe_customers
    WHERE user_id = auth.uid()
  )
  LIMIT 1;
  
  -- Check if subscription exists
  IF NOT FOUND THEN
    RETURN TRUE; -- Allow access if no subscription record (new user)
  END IF;
  
  -- Check subscription status
  is_active := subscription_record.subscription_status IN ('active', 'trialing');
  
  -- If in trial, check if trial has expired
  IF subscription_record.subscription_status = 'trialing' AND 
     subscription_record.current_period_end IS NOT NULL THEN
    is_active := to_timestamp(subscription_record.current_period_end) > NOW();
  END IF;
  
  RETURN is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;