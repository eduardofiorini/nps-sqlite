import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.50.5';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ReactivateUserRequest {
  user_id: string;
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
    const { user_id }: ReactivateUserRequest = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
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

    // Check if user has admin permissions
    const { data: adminData, error: adminError } = await supabase
      .from('user_admin')
      .select('permissions')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError || !adminData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied: Admin privileges required' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const permissions = adminData.permissions || {};
    if (!permissions.view_users) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied: Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`Admin ${user.id} reactivating user: ${user_id}`);

    try {
      // Update user metadata to remove deactivation
      const { error: updateError } = await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: {
          is_deactivated: false,
          deactivated_at: null,
          deactivated_by: null,
          reactivated_at: new Date().toISOString(),
          reactivated_by: user.id
        }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        throw updateError;
      }

      console.log(`✓ Successfully reactivated user: ${user_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'User reactivated successfully'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );

    } catch (error) {
      console.error('Error reactivating user:', error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to reactivate user: ${error.message}`,
          details: error.toString()
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

  } catch (error) {
    console.error('Error in reactivate-user-admin function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});