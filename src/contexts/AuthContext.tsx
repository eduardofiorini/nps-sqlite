import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getAuthUser, setAuthUser, logout as logoutUser } from '../utils/localStorage';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  login: () => Promise.resolve(false),
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = getAuthUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);
  
  // For demo purposes, this is a mock login that accepts any email/password
  // In a real application, this would validate credentials against a backend
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) return false;
    
    // Mock validation - in a real app this would check against a backend
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: 'admin',
    };
    
    setUser(mockUser);
    setAuthUser(mockUser);
    
    return true;
  };
  
  const logout = () => {
    setUser(null);
    logoutUser();
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        logout, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};