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
const processSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    role: 'user',
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
  }, []);

  useEffect(() => {
    // Only attempt to get session if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping auth session check');
      setLoading(false);
      return;
    }
    
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial auth session check:', session ? 'Session found' : 'No session');
        
        if (session?.user) {
          const processedUser = processSupabaseUser(session.user);
          setUser(processedUser);
          
          // Save to localStorage
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(processedUser));
          console.log('Saved user to localStorage from session:', processedUser.email);
        } else {
          // Try to load from localStorage as fallback
          const storedUserData = localStorage.getItem(USER_STORAGE_KEY);
          if (!user && storedUserData) {
            setUser(JSON.parse(storedUserData));
          }
        }
      } catch (error) {
        console.error('Error getting auth session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
      
      if (session?.user) {
        const processedUser = processSupabaseUser(session.user);
        setUser(processedUser);
        
        // Update localStorage when auth state changes
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(processedUser));
        console.log('Updated user in localStorage:', processedUser.email);
      } 
      else if (_event === 'SIGNED_OUT') {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Check if Supabase is configured first
      if (!isSupabaseConfigured()) {
        // Demo mode - create mock user if credentials provided
        if (!email || !password) {
          console.error('Login error: Email and password are required');
          return { success: false, message: 'Email e senha são obrigatórios' };
        }
        
        // Create a mock user for demo purposes
        const mockUser: User = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: email,
          name: email.split('@')[0] || 'User',
          role: 'user'
        };
        setUser(mockUser);
        
        // Store mock user in localStorage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        
        return { success: true };
      }
      
      // Only attempt Supabase authentication if properly configured
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message === 'Email not confirmed') {
          return { success: false, message: 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada.' };
        }
        
        // Handle database errors by falling back to demo mode
        if (error.message === 'Database error granting user' || error.message.includes('unexpected_failure')) {
          console.warn('Database error detected, falling back to demo mode');
          if (email && password) {
            const mockUser: User = {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: email,
              name: email.split('@')[0] || 'User',
              role: 'user'
            };
            setUser(mockUser);
            
            // Store mock user in localStorage
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
            
            return { success: true };
          }
        }
        
        console.error('Login error:', error.message);
        
        if (error.message === 'Invalid login credentials') {
          return { success: false, message: 'Credenciais inválidas. Verifique seu email e senha.' };
        }
        
        return { success: false, message: error.message };
      }

      if (data.user) {
        const processedUser = processSupabaseUser(data.user);
        setUser(processedUser);
        
        // Store user in localStorage
        if (processedUser) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(processedUser));
        }
        
        return { success: true };
      }

      return { success: false, message: 'Falha no login. Tente novamente.' };
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to demo mode if Supabase fails
      if (!isSupabaseConfigured() && email && password) {
        console.log('Falling back to demo mode due to network/configuration error');
        const mockUser: User = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: email,
          name: email.split('@')[0] || 'User',
          role: 'user'
        };
        setUser(mockUser);
        
        // Store mock user in localStorage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        
        return { success: true };
      }
      
      return { success: false, message: 'Erro de conexão. Tente novamente.' };
    }
  };

  const register = async (email: string, password: string, name: string, planId?: string): Promise<boolean> => {
    try {
      // Check if Supabase is configured first
      if (!isSupabaseConfigured()) {
        // Demo mode - create mock user if credentials provided
        if (!email || !password || !name) {
          console.error('Registration error: Email and password are required');
          return false;
        }
        
        // Create a mock user for demo purposes
        const mockUser: User = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: email,
          name: name || email.split('@')[0] || 'User',
          role: 'user'
        };
        setUser(mockUser);
        
        // Store mock user in localStorage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        
        return true;
      }
      
      // Only attempt Supabase registration if properly configured
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

      if (error) {
        console.error('Registration error:', error.message);
        return false;
      }

      if (data.user) {
        // For email confirmation disabled, user will be automatically signed in
        
        // Create a trial subscription for the user
        try {
          // Calculate trial end date (7 days from now)
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 7);
          
          // Create subscription record with trial status
          const { error: subscriptionError } = await supabase
            .from('stripe_subscriptions')
            .insert({
              customer_id: data.user.id,
              subscription_status: 'trialing',
              price_id: planId ? `price_${planId}` : 'price_pro', // Default to pro plan
              current_period_start: Math.floor(Date.now() / 1000),
              current_period_end: Math.floor(trialEndDate.getTime() / 1000),
              cancel_at_period_end: false,
              status: 'trialing'
            });
            
          if (subscriptionError) {
            console.error('Error creating trial subscription:', subscriptionError);
          }
        } catch (subscriptionError) {
          console.error('Error setting up trial subscription:', subscriptionError);
        }
        
        const processedUser = processSupabaseUser(data.user);
        setUser(processedUser);
        
        // Store user in localStorage
        if (processedUser) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(processedUser));
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      
      // If Supabase is not configured, fall back to demo mode
      if (!isSupabaseConfigured() && email && password) {
        const mockUser: User = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: email,
          name: name || email.split('@')[0] || 'User',
          role: 'user'
        };
        setUser(mockUser);
        
        // Store mock user in localStorage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        
        return true;
      }
      
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      
      // Clear user from localStorage
      localStorage.removeItem(USER_STORAGE_KEY);
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