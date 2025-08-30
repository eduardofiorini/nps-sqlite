import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';
import { User } from '../types';

// Key for storing user data in localStorage
const USER_STORAGE_KEY = 'nps_user_data';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  login: () => Promise.resolve({ success: false }),
  register: () => Promise.resolve({ success: false }),
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Check if we have a stored token
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            const result = await apiClient.getCurrentUser();
            if (result.success) {
              setUser(result.user);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
            } else {
              // Invalid token, clear it
              localStorage.removeItem('auth_token');
              localStorage.removeItem(USER_STORAGE_KEY);
              setUser(null);
            }
          } catch (error) {
            console.error('Error validating token:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
          }
        } else {
          // No token, clear any stale data
          setUser(null);
          localStorage.removeItem(USER_STORAGE_KEY);
          console.log('No auth token, cleared user data');
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email e senha são obrigatórios' };
      }
      
      const result = await apiClient.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
        
        // Check for pending affiliate referral
        const pendingRefCode = sessionStorage.getItem('pending_affiliate_code');
        if (pendingRefCode) {
          try {
            await apiClient.createAffiliateReferral(pendingRefCode, result.user.id);
            sessionStorage.removeItem('pending_affiliate_code');
            localStorage.removeItem('pending_affiliate_code');
          } catch (error) {
            console.error('Error processing affiliate referral:', error);
          }
        }
        
        return { success: true };
      } else {
        return { success: false, message: result.error || 'Erro no login' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erro de conexão. Tente novamente.' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!email || !password || !name) {
        return { success: false, message: 'Email, senha e nome são obrigatórios' };
      }
      
      const result = await apiClient.register(email, password, name);
      
      if (result.success) {
        return { success: true, message: 'Conta criada com sucesso' };
      } else {
        return { success: false, message: result.error || 'Erro no registro' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Erro de conexão. Tente novamente.' };
    }
  };
  
  const logout = async () => {
    try {
      apiClient.logout();
      setUser(null);
      
      // Clear auth data from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem(USER_STORAGE_KEY);
      
      // Clean up other data
      const { cleanupLocalStorage } = await import('../utils/nodeStorage');
      cleanupLocalStorage();
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