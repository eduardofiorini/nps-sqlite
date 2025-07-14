import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig } from '../types';
import { getAppConfig, saveAppConfig } from '../utils/supabaseStorage';
import { useAuth } from './AuthContext';

interface ConfigContextProps {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
}

const ConfigContext = createContext<ConfigContextProps>({
  config: {
    themeColor: '#073143',
    logoUrl: '',
    defaultEmail: 'nps@meunps.com',
    language: 'en'
  },
  updateConfig: () => {},
});

export const useConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<AppConfig>({
    themeColor: '#073143',
    language: 'pt-BR',
    company: {
      name: '',
      document: '',
      address: '',
      email: '',
      phone: '',
    },
    integrations: {
      smtp: {
        enabled: false,
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromName: '',
        fromEmail: '',
      },
      zenvia: {
        email: {
          enabled: false,
          apiKey: '',
          fromEmail: '',
          fromName: '',
        },
        sms: {
          enabled: false,
          apiKey: '',
          from: '',
        },
        whatsapp: {
          enabled: false,
          apiKey: '',
          from: '',
        },
      },
    },
  });
  
  useEffect(() => {
    // Load configuration from Supabase
    const loadConfig = async () => {
      // Only load config if user is authenticated and auth is not loading
      if (authLoading || !isAuthenticated) {
        return;
      }
      
      try {
        const storedConfig = await getAppConfig();
        if (storedConfig) {
          setConfig(storedConfig);
        }
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };
    
    loadConfig();
  }, [isAuthenticated, authLoading]);
  
  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    try {
      await saveAppConfig(updatedConfig);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };
  
  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};