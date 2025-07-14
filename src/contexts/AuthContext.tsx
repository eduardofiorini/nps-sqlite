import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  login: () => Promise.resolve(false),
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
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Only attempt to get session if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(processSupabaseUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(processSupabaseUser(session?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if Supabase is configured first
      if (!isSupabaseConfigured()) {
        // Demo mode - create mock user if credentials provided
        if (!email || !password) {
          console.error('Login error: Email and password are required');
          return false;
        }
        
        // Create a mock user for demo purposes
        const mockUser: User = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: email,
          name: email.split('@')[0] || 'User',
          role: 'user'
        };
        setUser(mockUser);
        return true;
      }
      
      // Only attempt Supabase authentication if properly configured
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        setUser(processSupabaseUser(data.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to demo mode if Supabase fails
      if (!isSupabaseConfigured() && email && password) {
        const mockUser: User = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: email,
          name: email.split('@')[0] || 'User',
          role: 'user'
        };
        setUser(mockUser);
        return true;
      }
      
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
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
        return true;
      }
      
      // Only attempt Supabase registration if properly configured
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error.message);
        return false;
      }

      if (data.user) {
        // For email confirmation disabled, user will be automatically signed in
        setUser(processSupabaseUser(data.user));
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
        return true;
      }
      
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
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