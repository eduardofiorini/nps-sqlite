/*
  # Add unique constraint to campaign_forms table

  1. Changes
    - Add unique constraint on campaign_id column in campaign_forms table
    - This allows upsert operations to work correctly with ON CONFLICT

  2. Security
    - No changes to existing RLS policies
    - Maintains data integrity
*/

-- Add unique constraint to campaign_id column
ALTER TABLE campaign_forms ADD CONSTRAINT campaign_forms_campaign_id_unique UNIQUE (campaign_id);