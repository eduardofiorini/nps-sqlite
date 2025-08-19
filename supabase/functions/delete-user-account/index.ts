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
    if (user.id !== user_id || user.email !== confirmation_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Can only delete your own account' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`Starting account deletion for user: ${user_id}`);

    // Delete user data in the correct order (respecting foreign key constraints)
    const deletionSteps = [
      // 1. Delete NPS responses first (no foreign key dependencies)
      { table: 'nps_responses', condition: `campaign_id IN (SELECT id FROM campaigns WHERE user_id = '${user_id}')` },
      
      // 2. Delete campaign forms
      { table: 'campaign_forms', condition: `user_id = '${user_id}'` },
      
      // 3. Delete campaigns
      { table: 'campaigns', condition: `user_id = '${user_id}'` },
      
      // 4. Delete contacts
      { table: 'contacts', condition: `user_id = '${user_id}'` },
      
      // 5. Delete affiliate referrals (both as affiliate and referred)
      { table: 'affiliate_referrals', condition: `affiliate_user_id = '${user_id}' OR referred_user_id = '${user_id}'` },
      
      // 6. Delete user affiliate data
      { table: 'user_affiliates', condition: `user_id = '${user_id}'` },
      
      // 7. Delete sources, situations, groups
      { table: 'sources', condition: `user_id = '${user_id}'` },
      { table: 'situations', condition: `user_id = '${user_id}'` },
      { table: 'groups', condition: `user_id = '${user_id}'` },
      
      // 8. Delete app config
      { table: 'app_configs', condition: `user_id = '${user_id}'` },
      
      // 9. Delete user profile
      { table: 'user_profiles', condition: `user_id = '${user_id}'` },
      
      // 10. Delete admin permissions if any
      { table: 'user_admin', condition: `user_id = '${user_id}'` },
      
      // 11. Delete Stripe data (keep for audit purposes, just mark as deleted)
      { table: 'stripe_customers', condition: `user_id = '${user_id}'`, soft: true },
      { table: 'stripe_subscriptions', condition: `customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = '${user_id}')`, soft: true },
    ];

    // Execute deletions
    for (const step of deletionSteps) {
      try {
        if (step.soft) {
          // Soft delete - just mark as deleted
          const { error } = await supabase
            .from(step.table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('user_id', user_id);
          
          if (error) {
            console.warn(`Warning: Could not soft delete from ${step.table}:`, error);
          } else {
            console.log(`Soft deleted data from ${step.table}`);
          }
        } else {
          // Hard delete
          const { error } = await supabase.rpc('delete_user_data_from_table', {
            table_name: step.table,
            condition_clause: step.condition
          });
          
          if (error) {
            console.warn(`Warning: Could not delete from ${step.table}:`, error);
            // Continue with other deletions even if one fails
          } else {
            console.log(`Deleted data from ${step.table}`);
          }
        }
      } catch (error) {
        console.warn(`Error deleting from ${step.table}:`, error);
        // Continue with other deletions
      }
    }

    // Finally, delete the auth user account
    try {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user_id);
      
      if (deleteUserError) {
        console.error('Error deleting auth user:', deleteUserError);
        // Even if auth deletion fails, we've cleaned up the data
      } else {
        console.log('Successfully deleted auth user');
      }
    } catch (error) {
      console.warn('Warning: Could not delete auth user:', error);
    }

    console.log(`Account deletion completed for user: ${user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account deleted successfully',
        deleted_at: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

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