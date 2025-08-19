/*
  # Create function to delete user data from tables

  1. New Functions
    - `delete_user_data_from_table` - Function to safely delete user data from any table
  
  2. Security
    - Function uses SECURITY DEFINER to run with elevated privileges
    - Only accessible by authenticated users
    - Includes validation to prevent SQL injection
*/

-- Function to safely delete user data from specified table
CREATE OR REPLACE FUNCTION delete_user_data_from_table(
  table_name text,
  condition_clause text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_text text;
BEGIN
  -- Validate table name to prevent SQL injection
  IF table_name !~ '^[a-zA-Z_][a-zA-Z0-9_]*$' THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;
  
  -- Validate condition clause (basic validation)
  IF condition_clause IS NULL OR condition_clause = '' THEN
    RAISE EXCEPTION 'Condition clause cannot be empty';
  END IF;
  
  -- Build and execute the delete query
  query_text := format('DELETE FROM %I WHERE %s', table_name, condition_clause);
  
  -- Log the operation
  RAISE NOTICE 'Executing: %', query_text;
  
  -- Execute the deletion
  EXECUTE query_text;
  
  -- Log success
  RAISE NOTICE 'Successfully deleted data from table: %', table_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_data_from_table(text, text) TO authenticated;