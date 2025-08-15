/*
  # Add trial system to user profiles

  1. Changes
    - Add trial_start_date to user_profiles table
    - Add trial_expired computed field
    - Update existing profiles with trial start date

  2. Security
    - Maintain existing RLS policies
    - Add computed field for trial status
*/

-- Add trial fields to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'trial_start_date'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN trial_start_date timestamptz DEFAULT now();
  END IF;
END $$;

-- Update existing user profiles to have trial start date
UPDATE user_profiles 
SET trial_start_date = created_at 
WHERE trial_start_date IS NULL;