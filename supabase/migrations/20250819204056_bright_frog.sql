/*
  # Fix affiliate referrals creation and triggers

  1. Ensure affiliate referrals are properly created
  2. Fix trigger function for updating affiliate stats
  3. Add debugging and logging
*/

-- Create or replace the trigger function for updating affiliate stats
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the affiliate's statistics
  UPDATE user_affiliates 
  SET 
    total_referrals = (
      SELECT COUNT(*) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = NEW.affiliate_user_id
    ),
    total_earnings = (
      SELECT COALESCE(SUM(commission_amount), 0) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = NEW.affiliate_user_id
    ),
    total_received = (
      SELECT COALESCE(SUM(commission_amount), 0) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = NEW.affiliate_user_id 
      AND commission_status = 'paid'
    ),
    total_pending = (
      SELECT COALESCE(SUM(commission_amount), 0) 
      FROM affiliate_referrals 
      WHERE affiliate_user_id = NEW.affiliate_user_id 
      AND commission_status = 'pending'
    ),
    updated_at = now()
  WHERE user_id = NEW.affiliate_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_affiliate_stats_trigger ON affiliate_referrals;
CREATE TRIGGER update_affiliate_stats_trigger
  AFTER INSERT OR UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats();

-- Create function for safe data deletion (used by edge function)
CREATE OR REPLACE FUNCTION delete_user_data_from_table(
  table_name TEXT,
  condition_clause TEXT
)
RETURNS VOID AS $$
DECLARE
  query TEXT;
BEGIN
  -- Validate table name to prevent SQL injection
  IF table_name NOT IN (
    'nps_responses', 'campaign_forms', 'campaigns', 'contacts', 
    'affiliate_referrals', 'user_affiliates', 'sources', 'situations', 
    'groups', 'app_configs', 'user_profiles', 'user_admin'
  ) THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;
  
  -- Build and execute the delete query
  query := format('DELETE FROM %I WHERE %s', table_name, condition_clause);
  
  -- Log the operation for debugging
  RAISE NOTICE 'Executing deletion: %', query;
  
  EXECUTE query;
  
  -- Log the result
  RAISE NOTICE 'Deleted data from table: %', table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_data_from_table(TEXT, TEXT) TO authenticated;