import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.50.5';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface DeactivateUserRequest {
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
    const { user_id }: DeactivateUserRequest = await req.json();

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

    // Prevent admin from deactivating their own account
    if (user.id === user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'You cannot deactivate your own account' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`Admin ${user.id} deactivating user: ${user_id}`);

    try {
      // Update user metadata to mark as deactivated
      const { error: updateError } = await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: {
          is_deactivated: true,
          deactivated_at: new Date().toISOString(),
          deactivated_by: user.id
        }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        throw updateError;
      }

      // Deactivate all user campaigns
      const { error: campaignError } = await supabase
        .from('campaigns')
        .update({ active: false })
        .eq('user_id', user_id);

      if (campaignError) {
        console.warn('Error deactivating user campaigns:', campaignError);
        // Don't fail the request if campaign deactivation fails
      }

      console.log(`✓ Successfully deactivated user: ${user_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'User deactivated successfully'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );

    } catch (error) {
      console.error('Error deactivating user:', error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to deactivate user: ${error.message}`,
          details: error.toString()
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

  } catch (error) {
    console.error('Error in deactivate-user-admin function:', error);
    
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