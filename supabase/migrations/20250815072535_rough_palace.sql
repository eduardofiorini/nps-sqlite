/*
  # Fix User Data Isolation

  1. Security Updates
    - Remove public read access from campaigns table
    - Remove public read access from situations table
    - Ensure all tables properly filter by user_id
    - Update RLS policies to prevent data leakage between users

  2. Changes
    - Drop existing public read policies
    - Ensure authenticated users can only see their own data
    - Maintain public access only for active campaigns in survey context
*/

-- Drop the problematic public read policy for situations
DROP POLICY IF EXISTS "Allow public read situations" ON situations;

-- Update campaigns public read policy to be more restrictive
-- Only allow public read for the survey context (when we need to display the campaign to respondents)
DROP POLICY IF EXISTS "Allow public read for active campaigns" ON campaigns;

-- Create a more restrictive policy for campaigns public access
-- This should only be used in the survey context where we need to show campaign details
CREATE POLICY "Allow public read for survey access"
  ON campaigns
  FOR SELECT
  TO public
  USING (active = true AND start_date <= now() AND (end_date IS NULL OR end_date >= now()));

-- Ensure situations are completely private to users
-- Remove any public access and ensure only authenticated users can see their own data
CREATE POLICY "Users can only view their own situations"
  ON situations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update the existing authenticated user policy for situations to be more explicit
DROP POLICY IF EXISTS "Users can view their own situations" ON situations;

CREATE POLICY "Authenticated users view own situations"
  ON situations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure campaigns are properly isolated for authenticated users
-- Update the existing policy to be more explicit
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;

CREATE POLICY "Authenticated users view own campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Also ensure that nps_responses can only be inserted for campaigns that belong to the user
-- or are public and active (for the survey functionality)
DROP POLICY IF EXISTS "Allow public insert for active campaigns" ON nps_responses;

CREATE POLICY "Allow public insert for active public campaigns"
  ON nps_responses
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = nps_responses.campaign_id 
      AND c.active = true 
      AND c.start_date <= now() 
      AND (c.end_date IS NULL OR c.end_date >= now())
    )
  );

-- Ensure campaign_forms follow the same pattern
DROP POLICY IF EXISTS "Allow public read for campaign forms" ON campaign_forms;

CREATE POLICY "Allow public read for active campaign forms"
  ON campaign_forms
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_forms.campaign_id 
      AND c.active = true 
      AND c.start_date <= now() 
      AND (c.end_date IS NULL OR c.end_date >= now())
    )
  );