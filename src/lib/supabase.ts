import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
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
        storage: localStorage,
        debug: import.meta.env.DEV, // Enable debug logs in development
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000), // 10 second timeout
          }).catch(error => {
            console.warn('Supabase fetch error:', error.message);
            // Return a rejected promise that can be handled by the mock client
            throw new Error(`Connection failed: ${error.message}`);
          });
        }
      }
    });
    
    // Test the connection by getting the session with error handling
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        // Check if it's an expected invalid session error
        if (error.message.includes('user_not_found') || error.message.includes('invalid_jwt')) {
          console.info('Invalid session detected, will be handled by AuthContext:', error.message);
        } else {
          console.warn('Supabase session error, falling back to demo mode:', error.message);
        }
        // Don't throw error, just log warning
      } else {
        console.log('Session check successful:', data.session ? 'Session exists' : 'No session');
      }
    }).catch(error => {
      // Check if it's an expected invalid session error
      if (error.message.includes('user_not_found') || error.message.includes('invalid_jwt')) {
        console.info('Invalid session detected, will be handled by AuthContext:', error.message);
      } else {
        console.warn('Supabase connection failed, using demo mode:', error.message);
      }
      // Don't throw error, just log warning
    });
  } else {
    throw new Error('Empty Supabase URL');
  }
} catch (error: any) {
  console.warn('Supabase configuration issue, using demo mode:', error.message);
  
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
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Demo mode - Supabase not configured') }),
      signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Demo mode - Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: new Error('Demo mode - Supabase not configured') }),
      updateUser: () => Promise.resolve({ data: { user: null }, error: new Error('Demo mode - Supabase not configured') }),
      setSession: () => Promise.resolve({ data: { session: null }, error: new Error('Demo mode - Supabase not configured') }),
      resend: () => Promise.resolve({ data: null, error: new Error('Demo mode - Supabase not configured') })
    },
    from: () => ({
      select: () => createMockQueryBuilder(),
      insert: () => createMockMutationBuilder(),
      update: () => createMockMutationBuilder(),
      upsert: () => createMockMutationBuilder(),
      delete: () => createMockMutationBuilder()
    }),
    rpc: () => Promise.resolve({ data: null, error: new Error('Demo mode - Supabase not configured') })
  };
}

export { supabase };

// Add a helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  // Check if we have real Supabase credentials (not demo/placeholder values)
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase URL or key is missing');
      return false;
    }

    // Test if URL is valid
    try {
      new URL(supabaseUrl);
    } catch (e) {
      console.warn('Invalid Supabase URL format');
      return false;
    }

    // Check for placeholder values
    if (
      supabaseUrl === 'https://localhost:54321' || 
      supabaseUrl === 'YOUR_SUPABASE_URL'
    ) {
      console.warn('Supabase URL appears to be a placeholder');
      return false;
    }

    // Check for placeholder or demo key
    if (
      supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY' ||
      supabaseAnonKey.includes('supabase-demo')
    ) {
      console.warn('Supabase key appears to be a placeholder');
      return false;
    }

    return true;
  } catch (error) {
    // If URL is invalid, Supabase is not configured
    console.warn('Supabase not configured:', error);
    return false; 
  }
}