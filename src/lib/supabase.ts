import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const STORAGE_KEY = 'nps_supabase_auth'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables, using fallback values for development')
}

// Ensure we have a valid URL before creating the client
let supabase;
try {
  // Test if the URL is valid and not empty
  if (supabaseUrl) {
    new URL(supabaseUrl);
  
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true, 
        storageKey: STORAGE_KEY,
        storage: window.localStorage,
        debug: import.meta.env.DEV, // Enable debug logs in development
      }
    });
    
    // Test the connection by getting the session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Error getting Supabase session:', error);
      } else {
        console.log('Session check successful:', data.session ? 'Session exists' : 'No session');
      }
    });
  } else {
    throw new Error('Empty Supabase URL');
  }
} catch (error: any) {
  console.error('Invalid Supabase URL:', error);
  
  // Create a comprehensive mock client for demo mode
  const createMockQueryBuilder = () => ({
    select: () => createMockQueryBuilder(),
    eq: () => createMockQueryBuilder(),
    order: () => createMockQueryBuilder(),
    limit: () => createMockQueryBuilder(),
    contains: () => createMockQueryBuilder(),
    or: () => createMockQueryBuilder(),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve) => resolve({ data: null, error: null })
  });
  
  const createMockMutationBuilder = () => ({
    eq: () => createMockMutationBuilder(),
    select: () => createMockMutationBuilder(),
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve) => resolve({ data: null, error: null })
  });
  
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Demo mode') }),
      signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Demo mode') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: new Error('Demo mode') }),
      updateUser: () => Promise.resolve({ data: { user: null }, error: new Error('Demo mode') })
    },
    from: () => ({
      select: () => createMockQueryBuilder(),
      insert: () => createMockMutationBuilder(),
      update: () => createMockMutationBuilder(),
      upsert: () => createMockMutationBuilder(),
      delete: () => createMockMutationBuilder()
    })
  };
}

export { supabase };

// Add a helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  // Check if we have real Supabase credentials (not demo/placeholder values)
  try {
    // Test if the URL is valid and not empty
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
    console.warn('Supabase not configured:', error);
    return false; 
  }
}