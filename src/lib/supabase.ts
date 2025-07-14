import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables, using fallback values for development')
}

// Ensure we have a valid URL before creating the client
let supabase;
try {
  // Test if the URL is valid
  new URL(supabaseUrl);
  
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      debug: import.meta.env.DEV, // Enable debug logs in development
    }
  });
} catch (error) {
  console.error('Invalid Supabase URL:', error);
  // Create a dummy client that won't make actual API calls
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Demo mode') }),
      signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Demo mode') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    })
  };
}

export { supabase };

// Add a helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  // Check if we have real Supabase credentials (not demo/placeholder values)
  try {
    // Test if the URL is valid
    new URL(supabaseUrl);
    
    const hasRealUrl = supabaseUrl && 
                       supabaseUrl !== 'https://localhost:54321' && 
                       supabaseUrl !== 'YOUR_SUPABASE_URL' &&
                       supabaseUrl.includes('.supabase.co');
                       
    const hasRealKey = supabaseAnonKey && 
                       supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' &&
                       supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';
                       
    return hasRealUrl && hasRealKey;
  } catch (error) {
    // If URL is invalid, Supabase is not configured
    return false;
  }
}