import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

// Key for storing user data in localStorage
const USER_STORAGE_KEY = 'nps_user_data';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string, planId?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  login: () => Promise.resolve({ success: false }),
  register: () => Promise.resolve(false),
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to process Supabase user to application User type
const processSupabaseUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
  if (!supabaseUser) return null;
  
  // Check if user is admin
  let isAdmin = false;
  try {
    if (isSupabaseConfigured()) {
      console.log('Checking admin status for user:', supabaseUser.id);
      const { data, error } = await supabase
        .from('user_admin')
        .select('id')
        .eq('user_id', supabaseUser.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // User not found in admin table - not an admin
          console.log('User not found in admin table:', supabaseUser.id);
          isAdmin = false;
        } else {
          console.error('Error checking admin status:', error);
          isAdmin = false;
        }
      } else if (data) {
        console.log('User found in admin table:', supabaseUser.id);
        isAdmin = true;
      }
    } else {
      // Demo mode - no admin privileges unless in database
      console.log('Demo mode - no admin validation');
      isAdmin = false;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    isAdmin = false;
  }
  
  console.log('Admin check result for', supabaseUser.email, ':', isAdmin);
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    role: isAdmin ? 'admin' : 'user',
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on component mount
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        console.log('Loaded user from localStorage:', parsedUser.email);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    
    // Set loading to false immediately if we have stored user data
    setLoading(false);
  }, []);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          console.log('Initial auth session check:', session?.user?.email || 'No session');
          
          if (session?.user) {
            const processedUser = await processSupabaseUser(session.user);
            setUser(processedUser);
            
            // Save to localStorage
            if (processedUser) {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(processedUser));
              console.log('Saved user to localStorage from session:', processedUser.email);
            }
          } else {
            // Try to load from localStorage as fallback
            const storedUserData = localStorage.getItem(USER_STORAGE_KEY);
            if (!user && storedUserData) {
              setUser(JSON.parse(storedUserData));
            }
          }
        } else {
          console.log('Supabase not configured, using localStorage only');
        }
      } catch (error) {
        console.error('Error getting auth session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();

    // Only listen for auth changes if Supabase is configured
    let subscription: any = null;
    
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log('Auth state changed:', _event, session?.user?.email || 'No session');
        
        if (session?.user) {
          const processedUser = await processSupabaseUser(session.user);
          setUser(processedUser);
          
          // Update localStorage when auth state changes
          if (processedUser) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(processedUser));
            console.log('Updated user in localStorage:', processedUser.email);
          }
        } 
        else if (_event === 'SIGNED_OUT') {
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
        
        setLoading(false);
      });
      
      subscription = data.subscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user]);
  
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Validate input
      if (!email || !password) {
        return { success: false, message: 'Email e senha são obrigatórios' };
      }

      // Try Supabase authentication first if configured
      if (isSupabaseConfigured()) {
        try {
          console.log('Attempting Supabase login for:', email);
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Supabase auth error:', error.message);
            return { success: false, message: error.message };
          } else if (data.user) {
            console.log('Supabase login successful for:', email);
            const processedUser = await processSupabaseUser(data.user);
            setUser(processedUser);
            
            // Store user in localStorage
            if (processedUser) {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(processedUser));
              console.log('User stored in localStorage:', processedUser.email, 'Role:', processedUser.role);
            }
            
            return { success: true };
          }
        } catch (authError) {
          console.error('Supabase connection error:', authError);
          return { success: false, message: 'Erro de conexão com o servidor' };
        }
      }
      
      // If Supabase is not configured, return error
      return { success: false, message: 'Supabase não está configurado' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erro de conexão. Tente novamente.' };
    }
  };

  const register = async (email: string, password: string, name: string, planId?: string): Promise<boolean> => {
    try {
      // Validate input
      if (!email || !password || !name) {
        return false;
      }

      // Try Supabase registration if configured
      if (isSupabaseConfigured()) {
        try {
          console.log('Attempting Supabase registration for:', email);
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                planId,
              }
            }
          });

          if (!error && data.user) {
            console.log('Supabase registration successful for:', email);
            const processedUser = await processSupabaseUser(data.user);
            setUser(processedUser);
            
            // Store user in localStorage
            if (processedUser) {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(processedUser));
              console.log('User stored in localStorage:', processedUser.email, 'Role:', processedUser.role);
            }
            
            return true;
          } else if (error) {
            console.error('Supabase registration error:', error);
            return false;
          }
        } catch (authError) {
          console.error('Supabase registration error:', authError);
          return false;
        }
      }
      
      // If Supabase is not configured, return false
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      
      // Clear all auth data from localStorage
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem('nps_supabase_auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login,
        register, 
        logout, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};