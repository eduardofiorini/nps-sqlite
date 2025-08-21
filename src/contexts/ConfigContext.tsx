import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAppConfig, saveAppConfig } from '../utils/supabaseStorage';
import { useAuth } from './AuthContext';

interface AppConfig {
  id?: string;
  user_id?: string;
  themeColor: string;
  language: string;
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    document: string;
  };
  integrations: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      enabled: boolean;
      fromName: string;
      password: string;
      username: string;
      fromEmail: string;
    };
    zenvia: {
      sms: {
        from: string;
        apiKey: string;
        enabled: boolean;
      };
      email: {
        apiKey: string;
        enabled: boolean;
        fromName: string;
        fromEmail: string;
      };
      whatsapp: {
        from: string;
        apiKey: string;
        enabled: boolean;
      };
    };
  };
  created_at?: string;
  updated_at?: string;
}

interface ConfigContextType {
  config: AppConfig;
  themeColor: string;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const defaultConfig: AppConfig = {
  themeColor: '#00ac75',
  language: 'pt-BR',
  company: {
    name: '',
    email: '',
    phone: '',
    address: '',
    document: ''
  },
  integrations: {
    smtp: {
      host: '',
      port: 587,
      secure: false,
      enabled: false,
      fromName: '',
      password: '',
      username: '',
      fromEmail: ''
    },
    zenvia: {
      sms: {
        from: '',
        apiKey: '',
        enabled: false
      },
      email: {
        apiKey: '',
        enabled: false,
        fromName: '',
        fromEmail: ''
      },
      whatsapp: {
        from: '',
        apiKey: '',
        enabled: false
      }
    }
  }
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 172, 117'; // fallback RGB for #00ac75
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `${r}, ${g}, ${b}`;
  };

  // Helper function to adjust color brightness
  const adjustColorBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  // Apply theme color to CSS custom properties
  const applyThemeColor = (color: string) => {
    const root = document.documentElement;
    const rgb = hexToRgb(color);
    const hoverColor = adjustColorBrightness(color, 10);
    const lightColor = adjustColorBrightness(color, 40);
    
    root.style.setProperty('--theme-color', color);
    root.style.setProperty('--theme-color-rgb', rgb);
    root.style.setProperty('--theme-color-hover', hoverColor);
    root.style.setProperty('--theme-color-light', lightColor);
  };

  const loadConfig = async () => {
    if (authLoading) {
      return; // Wait for auth to complete
        console.log('User not authenticated, using default config');
        setConfig({
          themeColor: '#00ac75',
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
        return;
    
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userConfig = await getAppConfig();
      
      if (userConfig) {
        setConfig(userConfig);
        applyThemeColor(userConfig.themeColor);
      } else {
        setConfig(defaultConfig);
        applyThemeColor(defaultConfig.themeColor);
      }
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Erro ao carregar configurações');
      setConfig(defaultConfig);
      applyThemeColor(defaultConfig.themeColor);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<AppConfig>) => {
    try {
      setError(null);
      const updatedConfig = { ...config, ...updates };
      
      await saveAppConfig(updatedConfig);
      setConfig(updatedConfig);
      
      // Apply theme color if it was updated
      if (updates.themeColor) {
        applyThemeColor(updates.themeColor);
        // Store theme color in localStorage for immediate access on page reload
        localStorage.setItem('theme_color', updates.themeColor);
      }
    } catch (err) {
      console.error('Error updating config:', err);
      setError('Erro ao salvar configurações');
      throw err;
    }
  };

  useEffect(() => {
    loadConfig();
  }, [user, authLoading]);

  // Apply initial theme color on mount
  useEffect(() => {
    applyThemeColor(config.themeColor);
    // Store theme color in localStorage for immediate access on page reload
    localStorage.setItem('theme_color', config.themeColor);
  }, []);

  const value: ConfigContextType = {
    config,
    themeColor: config.themeColor,
    updateConfig,
    loading,
    error
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};