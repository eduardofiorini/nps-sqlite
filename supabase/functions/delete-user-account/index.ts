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
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get the request body
    const { user_id, confirmation_email }: DeleteAccountRequest = await req.json();

    if (!user_id || !confirmation_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID and confirmation email are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the token from the authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user making the request
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token or user not found' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Verify that the user is trying to delete their own account
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'You can only delete your own account' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Verify email confirmation
    if (user.email !== confirmation_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email confirmation does not match' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`Starting account deletion process for user: ${user_id}`);

    try {
      // Step 1: Delete all user data using the database function
      console.log('Calling delete_user_completely function...');
      const { data: deletionResult, error: deletionError } = await supabase
        .rpc('delete_user_completely', { target_user_id: user_id });

      if (deletionError) {
        console.error('Error in database deletion function:', deletionError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to delete user data: ${deletionError.message}`,
            details: deletionError.toString()
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

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

      // Step 2: Delete the user from auth.users (this should work now that all FK references are gone)
      console.log('Deleting user from auth.users...');
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user_id);

      if (authDeleteError) {
        console.error('Error deleting user from auth:', authDeleteError);
        
        // Even if auth deletion fails, the user data is gone, so this is partial success
        return new Response(
          JSON.stringify({ 
            success: false,
            partial_success: true,
            error: `User data deleted but failed to remove authentication: ${authDeleteError.message}`,
            message: 'Seus dados foram excluídos, mas houve um problema ao remover a autenticação. Entre em contato com o suporte.'
          }),
          {
            status: 200, // Use 200 since data deletion succeeded
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      console.log('✓ Successfully deleted user from auth.users');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Account deleted successfully',
          details: {
            user_id: user_id,
            deleted_at: new Date().toISOString()
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );

    } catch (error) {
      console.error('Unexpected error during account deletion:', error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unexpected error: ${error.message}`,
          details: error.toString()
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

  } catch (error) {
    console.error('Error deleting account:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to delete account',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});