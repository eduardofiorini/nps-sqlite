    if (!deletionResult) {
      console.error('Database deletion function returned false');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database deletion function failed',
          message: 'User data deletion was not completed successfully'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    console.log('✓ Successfully deleted all user data from database');
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.50.5';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface DeleteAccountRequest {
  user_id: string;
  confirmation_email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        {
          status: 405,
    // Use the database function to delete all user data
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
    console.log('Calling database function to delete all user data...');
      }
    const { data: deletionResult, error: deletionError } = await supabase
    );
      .rpc('delete_user_completely', { target_user_id: user_id });

    
  } catch (error) {
    if (deletionError) {
    console.error('Error deleting account:', error);
      console.error('Error in database deletion function:', deletionError);
    
      return new Response(
    return new Response(
        JSON.stringify({ 
      JSON.stringify({ 
          success: false, 
        success: false, 
          error: `Failed to delete user data: ${deletionError.message}`,
        error: error.message || 'Failed to delete account',
          details: deletionError.toString()
        details: error.toString()
        }),
      }),
        {
      {
          status: 500,
        status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      }
      );
    );
    }
  }
    
});