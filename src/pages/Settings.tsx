import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { AppConfig } from '../types';
import { Save, Globe, Moon, Sun, BarChart, Users, Tag } from 'lucide-react';

const Settings: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState<AppConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  useEffect(() => {
    setFormData(config);
  }, [config]);
  
  const handleChange = (field: keyof AppConfig, value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    // Simulating a delay for saving
    setTimeout(() => {
      updateConfig(formData);
      setIsSaving(false);
      setSaveMessage(t('settings.saved'));
      
      // Clear the save message after a few seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    }, 500);
  };

  const dataManagementItems = [
    {
      title: t('settings.sources'),
      description: t('settings.sourcesDesc'),
      icon: <BarChart size={20} />,
      path: '/settings/sources',
      color: 'bg-blue-500'
    },
    {
      title: t('settings.situations'),
      description: t('settings.situationsDesc'),
      icon: <Tag size={20} />,
      path: '/settings/situations',
      color: 'bg-green-500'
    },
    {
      title: t('settings.groups'),
      description: t('settings.groupsDesc'),
      icon: <Users size={20} />,
      path: '/settings/groups',
      color: 'bg-purple-500'
    }
  ];
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
      
      <Card>
        <CardHeader title={t('settings.appConfig')} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            {saveMessage && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md border border-green-200 dark:border-green-800">
                {saveMessage}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  {t('settings.themeColor')}
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => handleChange('themeColor', e.target.value)}
                    className="w-12 h-10 p-0 border-0 rounded"
                  />
                  <Input
                    value={formData.themeColor}
                    onChange={(e) => handleChange('themeColor', e.target.value)}
                    className="ml-2"
                    placeholder="#HEX"
                  />
                </div>
              </div>
              
              <Input
                label={t('settings.logoUrl')}
                value={formData.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
                fullWidth
              />
              
              <Input
                label={t('settings.defaultEmail')}
                value={formData.defaultEmail}
                onChange={(e) => handleChange('defaultEmail', e.target.value)}
                type="email"
                placeholder="nps@example.com"
                fullWidth
              />
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  {t('settings.language')}
                </label>
                <div className="flex items-center">
                  <div className="mr-2 text-gray-500 dark:text-gray-400">
                    <Globe size={20} />
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'pt-BR')}
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="pt-BR">Português (Brasil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  {t('settings.theme')}
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                      !isDark 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Sun size={16} className="mr-2" />
                    {t('settings.light')}
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                      isDark 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Moon size={16} className="mr-2" />
                    {t('settings.dark')}
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  type="submit" 
                  variant="primary" 
                  icon={<Save size={16} />}
                  isLoading={isSaving}
                >
                  {t('settings.saveSettings')}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={t('settings.dataManagement')} />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataManagementItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
              >
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center text-white mr-3`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
        NPS Master v0.1.0 • © 2025 All rights reserved
      </div>
    </div>
  );
};

export default Settings;