import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig } from '../types';
import { getAppConfig, saveAppConfig } from '../utils/localStorage';

interface ConfigContextProps {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
}

const ConfigContext = createContext<ConfigContextProps>({
  config: {
    themeColor: '#3B82F6',
    logoUrl: '',
    defaultEmail: 'nps@example.com',
    language: 'en'
  },
  updateConfig: () => {},
});

export const useConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(getAppConfig());
  
  useEffect(() => {
    // Load configuration from localStorage
    const storedConfig = getAppConfig();
    if (storedConfig) {
      setConfig(storedConfig);
    }
  }, []);
  
  const updateConfig = (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    saveAppConfig(updatedConfig);
  };
  
  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};