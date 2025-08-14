/*
  # Create trial subscription function

  1. New Functions
    - `create_trial_subscription` - Creates trial subscription for new users
    - Called automatically when a new user is created

  2. Security
    - Function runs with security definer privileges
    - Only creates trial subscriptions for authenticated users
    - Prevents duplicate subscriptions

  3. Features
    - Automatically creates customer and subscription records
    - Sets 7-day trial period
    - Uses 'price_pro' as default plan
*/

-- Function to create trial subscription for new users
CREATE OR REPLACE FUNCTION create_trial_subscription(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_end_timestamp bigint;
BEGIN
  -- Calculate trial end date (7 days from now)
  trial_end_timestamp := EXTRACT(epoch FROM (now() + interval '7 days'));
  
  -- Create customer record if it doesn't exist
  INSERT INTO stripe_customers (user_id, customer_id)
  VALUES (user_id_param, user_id_param::text)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create trial subscription if it doesn't exist
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
    EXTRACT(epoch FROM now()),
    trial_end_timestamp,
    false,
    'trialing'
  )
  ON CONFLICT DO NOTHING;
END;
$$;

-- Function to automatically create trial subscription for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create trial subscription for the new user
  PERFORM create_trial_subscription(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create trial subscription for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_trial_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;