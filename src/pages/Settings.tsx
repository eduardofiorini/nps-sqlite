import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { AppConfig } from '../types';
import { getSources, getSituations, getGroups, getAppConfig } from '../utils/supabaseStorage';
import { supabase } from '../lib/supabase';
import { Save, Globe, Moon, Sun, BarChart, Users, Tag, Building, FileText, Phone, Mail, MapPin, Hash, Server, MessageSquare, Smartphone, Shield, Eye, EyeOff, CheckCircle, AlertTriangle, Zap, Info } from 'lucide-react';

const Settings: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState<AppConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error'>('success');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [showZenviaTestModal, setShowZenviaTestModal] = useState(false);
  const [zenviaTestResult, setZenviaTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
    service?: string;
  } | null>(null);
  
  useEffect(() => {
    setFormData(config);
  }, [config]);
  
  const handleChange = (field: string, value: string | number | boolean) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData({ ...formData, [field]: value });
    } else if (keys.length === 2) {
      setFormData({
        ...formData,
        [keys[0]]: {
          ...((formData as any)[keys[0]] || {}),
          [keys[1]]: value
        }
      });
    } else if (keys.length === 3) {
      setFormData({
        ...formData,
        [keys[0]]: {
          ...((formData as any)[keys[0]] || {}),
          [keys[1]]: {
            ...(((formData as any)[keys[0]] || {})[keys[1]] || {}),
            [keys[2]]: value
          }
        }
      });
    } else if (keys.length === 4) {
      setFormData({
        ...formData,
        [keys[0]]: {
          ...((formData as any)[keys[0]] || {}),
          [keys[1]]: {
            ...(((formData as any)[keys[0]] || {})[keys[1]] || {}),
            [keys[2]]: {
              ...((((formData as any)[keys[0]] || {})[keys[1]] || {})[keys[2]] || {}),
              [keys[3]]: value
            }
          }
        }
      });
    }
  };
  
  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const testConnection = async (service: string, serviceConfig?: any) => {
    setTestingConnection(prev => ({ ...prev, [service]: true }));
    
    try {
      if (service === 'SMTP') {
        // Get the current SMTP configuration
        const smtpConfig = serviceConfig || formData.integrations?.smtp;
        
        if (!smtpConfig) {
          throw new Error('SMTP configuration is missing');
        }
        
        if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password || !smtpConfig.fromName || !smtpConfig.fromEmail) {
          throw new Error('SMTP configuration is incomplete. Please fill in all fields.');
        }
        
        // Call the Supabase Edge Function to send a test email
        const { data: authData } = await supabase.auth.getSession();
        const token = authData.session?.access_token;
        
        if (!token) {
          throw new Error('Authentication token is missing. Please log in again.');
        }
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-test-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ smtpConfig })
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to send test email');
        }
        
        setTestEmailResult({
          success: true,
          message: `Email de teste enviado com sucesso para ${authData.session?.user?.email}`
        });
        
        setShowTestEmailModal(true);
        setSaveMessage('Email de teste enviado com sucesso!');
        setSaveMessageType('success');
      } else if (service === 'ZenVia E-mail') {
        // Get the current ZenVia Email configuration
        const emailConfig = serviceConfig || formData.integrations?.zenvia?.email;
        
        if (!emailConfig) {
          throw new Error('ZenVia Email configuration is missing');
        }
        
        if (!emailConfig.apiKey || !emailConfig.fromName || !emailConfig.fromEmail) {
          throw new Error('ZenVia Email configuration is incomplete. Please fill in all fields.');
        }
        
        // Call the Supabase Edge Function to send a test email via ZenVia
        const { data: authData } = await supabase.auth.getSession();
        const token = authData.session?.access_token;
        
        if (!token) {
          throw new Error('Authentication token is missing. Please log in again.');
        }
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zenvia-test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            serviceType: 'email',
            config: emailConfig
          })
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to send test email via ZenVia');
        }
        
        setZenviaTestResult({
          success: true,
          message: result.message || `Email de teste enviado com sucesso para ${authData.session?.user?.email}`,
          details: result.details,
          service: 'email'
        });
        
        setShowZenviaTestModal(true);
        setSaveMessage('Email de teste ZenVia enviado com sucesso!');
        setSaveMessageType('success');
      } else if (service === 'ZenVia SMS' || service === 'ZenVia WhatsApp') {
        // Get the current configuration
        const serviceType = service === 'ZenVia SMS' ? 'sms' : 'whatsapp';
        const currentServiceConfig = service === 'ZenVia SMS' 
          ? (serviceConfig || formData.integrations?.zenvia?.sms)
          : (serviceConfig || formData.integrations?.zenvia?.whatsapp);
        
        if (!currentServiceConfig) {
          throw new Error(`${service} configuration is missing`);
        }
        
        if (!currentServiceConfig.apiKey || !currentServiceConfig.from) {
          throw new Error(`${service} configuration is incomplete. Please fill in all fields.`);
        }
        
        // Get user profile to check if phone number is set
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('phone')
          .single();
          
        if (!userProfile?.phone) {
          throw new Error(`Seu perfil não tem um número de telefone configurado. Por favor, atualize seu perfil com um número de telefone válido para testar o serviço de ${serviceType === 'sms' ? 'SMS' : 'WhatsApp'}.`);
        }
        
        // Call the Supabase Edge Function
        const { data: authData } = await supabase.auth.getSession();
        const token = authData.session?.access_token;
        
        if (!token) {
          throw new Error('Authentication token is missing. Please log in again.');
        }
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zenvia-test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            serviceType: serviceType,
            config: currentServiceConfig
          })
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || `Failed to send test ${serviceType}`);
        }
        
        setZenviaTestResult({
          success: true,
          message: result.message || `${serviceType === 'sms' ? 'SMS' : 'WhatsApp'} de teste enviado com sucesso para ${userProfile.phone}`,
          details: result.details,
          service: serviceType
        });
        
        setShowZenviaTestModal(true);
        setSaveMessage(`${service} testado com sucesso!`);
        setSaveMessageType('success');
      }
    } catch (error) {
      console.error(`Error testing ${service} connection:`, error);
      setTestEmailResult({
        success: false,
        message: error.message || `Falha ao testar conexão ${service}`
      });
      
      if (service === 'SMTP') {
        setShowTestEmailModal(true);
      }
      
      if (service === 'ZenVia E-mail' || service === 'ZenVia SMS' || service === 'ZenVia WhatsApp') {
        setShowZenviaTestModal(true);
      }
      
      setSaveMessage(`Erro ao testar conexão ${service}: ${error.message}`);
      setSaveMessageType('error');
    } finally {
      setTestingConnection(prev => ({ ...prev, [service]: false }));
      
      // Clear message after 5 seconds
      const timeout = setTimeout(() => {
        setSaveMessage('');
      }, 5000);
    }
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
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {saveMessage && (
          <div className={`p-3 ${
            saveMessageType === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
          } rounded-md border`}>
            {saveMessage}
          </div>
        )}

        {/* Configurações Gerais */}
        <Card>
          <CardHeader title={t('settings.generalSettings')} />
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  {t('settings.themeColorLabel')}
                </label>
                <div className="flex items-center space-x-3">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange('themeColor', '#00ac75')}
                    className="whitespace-nowrap"
                  >
                    Resetar Padrão
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Cor padrão: #00ac75
                </p>
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  {t('settings.language')}
                </label>
                <div className="flex items-center">
                  <div className="mr-2 text-gray-500 dark:text-gray-400">
                    <Globe size={20} />
                  </div>
                  <select
                    value={formData.language}
                    onChange={(e) => {
                      handleChange('language', e.target.value);
                      setLanguage(e.target.value as 'en' | 'pt-BR' | 'es');
                    }}
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="es">Español</option>
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
            </div>
          </CardContent>
        </Card>

        {/* Dados da Empresa */}
        <Card>
          <CardHeader title={t('settings.companyData')} />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  label={t('settings.companyName')}
                  value={formData.company?.name || ''}
                  onChange={(e) => handleChange('company.name', e.target.value)}
                  placeholder={language === 'pt-BR' ? 'Nome da sua empresa' : 'Your company name'}
                  fullWidth
                  className="pl-10"
                />
                <div className="absolute top-9 left-3 text-gray-400">
                  <Building size={16} />
                </div>
              </div>

              <div className="relative">
                <Input
                  label={t('settings.document')}
                  value={formData.company?.document || ''}
                  onChange={(e) => handleChange('company.document', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  fullWidth
                  className="pl-10"
                />
                <div className="absolute top-9 left-3 text-gray-400">
                  <FileText size={16} />
                </div>
              </div>

              <div className="md:col-span-2 relative">
                <Input
                  label={t('settings.address')}
                  value={formData.company?.address || ''}
                  onChange={(e) => handleChange('company.address', e.target.value)}
                  placeholder={language === 'pt-BR' ? 'Endereço completo da empresa' : 'Complete company address'}
                  fullWidth
                  className="pl-10"
                />
                <div className="absolute top-9 left-3 text-gray-400">
                  <MapPin size={16} />
                </div>
              </div>

              <div className="relative">
                <Input
                  label="E-mail"
                  type="email"
                  value={formData.company?.email || ''}
                  onChange={(e) => handleChange('company.email', e.target.value)}
                  placeholder={language === 'pt-BR' ? 'contato@empresa.com' : 'contact@company.com'}
                  fullWidth
                  className="pl-10"
                />
                <div className="absolute top-9 left-3 text-gray-400">
                  <Mail size={16} />
                </div>
              </div>

              <div className="relative">
                <Input
                  label={t('profile.phone')}
                  value={formData.company?.phone || ''}
                  onChange={(e) => handleChange('company.phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  fullWidth
                  className="pl-10"
                />
                <div className="absolute top-9 left-3 text-gray-400">
                  <Phone size={16} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de E-mail */}
        <Card>
          <CardHeader title={t('settings.emailSettings')} />
          <CardContent>
            <div className="space-y-8">
              {/* SMTP Configuration */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Server size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SMTP</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {formData.integrations?.smtp?.enabled && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection('SMTP', formData.integrations?.smtp)}
                        isLoading={testingConnection.SMTP}
                        icon={<CheckCircle size={14} />}
                      >
                        {t('settings.testConnection')}
                      </Button>
                    )}
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.integrations?.smtp?.enabled || false}
                        onChange={(e) => handleChange('integrations.smtp.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00ac75]/30 dark:peer-focus:ring-[#00ac75]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#00ac75]"></div>
                    </label>
                  </div>
                </div>

                {formData.integrations?.smtp?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('settings.smtpServer')}
                      value={formData.integrations?.smtp?.host || ''}
                      onChange={(e) => handleChange('integrations.smtp.host', e.target.value)}
                      placeholder="smtp.gmail.com"
                      fullWidth
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label={t('settings.port')}
                        type="number"
                        value={formData.integrations?.smtp?.port || 587}
                        onChange={(e) => handleChange('integrations.smtp.port', parseInt(e.target.value))}
                        placeholder="587"
                        fullWidth
                      />
                      <div className="flex items-end">
                        <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.integrations?.smtp?.secure || false}
                            onChange={(e) => handleChange('integrations.smtp.secure', e.target.checked)}
                            className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">SSL/TLS</span>
                        </label>
                      </div>
                    </div>

                    <Input
                      label={t('settings.username')}
                      value={formData.integrations?.smtp?.username || ''}
                      onChange={(e) => handleChange('integrations.smtp.username', e.target.value)}
                      placeholder={language === 'pt-BR' ? 'seu@email.com' : 'your@email.com'}
                      fullWidth
                    />

                    <div className="relative">
                      <Input
                        label={t('settings.password')}
                        type={showPasswords.smtp ? 'text' : 'password'}
                        value={formData.integrations?.smtp?.password || ''}
                        onChange={(e) => handleChange('integrations.smtp.password', e.target.value)}
                        placeholder="••••••••"
                        fullWidth
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('smtp')}
                        className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.smtp ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <Input
                      label={t('settings.senderName')}
                      value={formData.integrations?.smtp?.fromName || ''}
                      onChange={(e) => handleChange('integrations.smtp.fromName', e.target.value)}
                      placeholder={language === 'pt-BR' ? 'Minha Empresa' : 'My Company'}
                      fullWidth
                    />

                    <Input
                      label={t('settings.senderEmail')}
                      type="email"
                      value={formData.integrations?.smtp?.fromEmail || ''}
                      onChange={(e) => handleChange('integrations.smtp.fromEmail', e.target.value)}
                      placeholder={language === 'pt-BR' ? 'noreply@empresa.com' : 'noreply@company.com'}
                      fullWidth
                    />
                  </div>
                )}
              </div>

              {/* ZenVia E-mail Configuration */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Zap size={20} className="text-purple-600 dark:text-purple-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ZenVia E-mail</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {formData.integrations?.zenvia?.email?.enabled && (
                      <Button
                        type="button"
                        className="whitespace-nowrap"
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection('ZenVia E-mail')}
                        isLoading={testingConnection['ZenVia E-mail']}
                        icon={<CheckCircle size={14} />}
                      >
                        {t('common.test')} API
                      </Button>
                    )}
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.integrations?.zenvia?.email?.enabled || false}
                        onChange={(e) => handleChange('integrations.zenvia.email.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00ac75]/30 dark:peer-focus:ring-[#00ac75]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#00ac75]"></div>
                    </label>
                  </div>
                </div>

                {formData.integrations?.zenvia?.email?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label={t('settings.apiKey')}
                        type={showPasswords.zenviaEmail ? 'text' : 'password'}
                        value={formData.integrations?.zenvia?.email?.apiKey || ''}
                        onChange={(e) => handleChange('integrations.zenvia.email.apiKey', e.target.value)}
                        placeholder="••••••••••••••••"
                        fullWidth
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('zenviaEmail')}
                        className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.zenviaEmail ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <Input
                      label={t('settings.senderEmail')}
                      type="email"
                      value={formData.integrations?.zenvia?.email?.fromEmail || ''}
                      onChange={(e) => handleChange('integrations.zenvia.email.fromEmail', e.target.value)}
                      placeholder={language === 'pt-BR' ? 'noreply@empresa.com' : 'noreply@company.com'}
                      fullWidth
                    />

                    <div className="md:col-span-2">
                      <Input
                        label={t('settings.senderName')}
                        value={formData.integrations?.zenvia?.email?.fromName || ''}
                        onChange={(e) => handleChange('integrations.zenvia.email.fromName', e.target.value)}
                        placeholder={language === 'pt-BR' ? 'Minha Empresa' : 'My Company'}
                        fullWidth
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de SMS e WhatsApp */}
        <Card>
          <CardHeader title={t('settings.smsWhatsappSettings')} />
          <CardContent>
            <div className="space-y-8">
              {/* ZenVia SMS Configuration */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <MessageSquare size={20} className="text-green-600 dark:text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ZenVia SMS</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {formData.integrations?.zenvia?.sms?.enabled && (
                      <Button
                        type="button"
                        className="whitespace-nowrap"
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection('ZenVia SMS')}
                        isLoading={testingConnection['ZenVia SMS']}
                        icon={<CheckCircle size={14} />}
                      >
                        {t('common.test')} API
                      </Button>
                    )}
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.integrations?.zenvia?.sms?.enabled || false}
                        onChange={(e) => handleChange('integrations.zenvia.sms.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00ac75]/30 dark:peer-focus:ring-[#00ac75]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#00ac75]"></div>
                    </label>
                  </div>
                </div>

                {formData.integrations?.zenvia?.sms?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label={t('settings.apiKey')}
                        type={showPasswords.zenviaSms ? 'text' : 'password'}
                        value={formData.integrations?.zenvia?.sms?.apiKey || ''}
                        onChange={(e) => handleChange('integrations.zenvia.sms.apiKey', e.target.value)}
                        placeholder="••••••••••••••••"
                        fullWidth
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('zenviaSms')}
                        className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.zenviaSms ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <Input
                      label={language === 'pt-BR' ? 'Remetente (From)' : 'Sender (From)'}
                      value={formData.integrations?.zenvia?.sms?.from || ''}
                      onChange={(e) => handleChange('integrations.zenvia.sms.from', e.target.value)}
                      placeholder={language === 'pt-BR' ? 'MinhaEmpresa' : 'MyCompany'}
                      fullWidth
                    />
                  </div>
                )}
              </div>

              {/* ZenVia WhatsApp Configuration */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Smartphone size={20} className="text-green-600 dark:text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ZenVia WhatsApp</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {formData.integrations?.zenvia?.whatsapp?.enabled && (
                      <Button
                        type="button"
                        className="whitespace-nowrap"
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection('ZenVia WhatsApp')}
                        isLoading={testingConnection['ZenVia WhatsApp']}
                        icon={<CheckCircle size={14} />}
                      >
                        {t('common.test')} API
                      </Button>
                    )}
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.integrations?.zenvia?.whatsapp?.enabled || false}
                        onChange={(e) => handleChange('integrations.zenvia.whatsapp.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00ac75]/30 dark:peer-focus:ring-[#00ac75]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#00ac75]"></div>
                    </label>
                  </div>
                </div>

                {formData.integrations?.zenvia?.whatsapp?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label={t('settings.apiKey')}
                        type={showPasswords.zenviaWhatsapp ? 'text' : 'password'}
                        value={formData.integrations?.zenvia?.whatsapp?.apiKey || ''}
                        onChange={(e) => handleChange('integrations.zenvia.whatsapp.apiKey', e.target.value)}
                        placeholder="••••••••••••••••"
                        fullWidth
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('zenviaWhatsapp')}
                        className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.zenviaWhatsapp ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <Input
                      label={t('settings.senderNumber')}
                      value={formData.integrations?.zenvia?.whatsapp?.from || ''}
                      onChange={(e) => handleChange('integrations.zenvia.whatsapp.from', e.target.value)}
                      placeholder="5511999999999"
                      fullWidth
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            variant="primary" 
            icon={<Save size={16} />}
            isLoading={isSaving}
          >
            {t('settings.saveSettings')}
          </Button>
        </div>
      </form>

      {/* Test Email Modal */}
      <Modal
        isOpen={showTestEmailModal}
        onClose={() => setShowTestEmailModal(false)}
        title={testEmailResult?.success ? "Email de Teste Enviado" : "Erro ao Enviar Email"}
        title={testEmailResult?.success ? t('settings.emailTestSent') : t('settings.emailTestError')}
        size="md"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowTestEmailModal(false)}>
              {t('common.close')}
            </Button>
          </div>
        }
      >
        <div className={`p-4 rounded-lg ${
          testEmailResult?.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start">
            {testEmailResult?.success ? (
              <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
            ) : (
              <AlertTriangle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
            )}
            <div>
              <h3 className={`font-medium ${
                testEmailResult?.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {testEmailResult?.success ? t('common.success') : t('common.error')}
              </h3>
              <p className={`mt-1 text-sm ${
                testEmailResult?.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {testEmailResult?.message}
              </p>
              
              {testEmailResult?.success && (
                <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                  <p>{language === 'pt-BR' ? 'Verifique sua caixa de entrada para confirmar o recebimento do email de teste.' : 'Check your inbox to confirm receipt of the test email.'}</p>
                </div>
              )}
              
              {!testEmailResult?.success && (
                <div className="mt-3 text-sm text-red-700 dark:text-red-300">
                  <p>{t('settings.troubleshootingTips')}</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>{language === 'pt-BR' ? 'Verifique se o host e porta estão corretos' : 'Check if host and port are correct'}</li>
                    <li>{language === 'pt-BR' ? 'Confirme se o usuário e senha estão corretos' : 'Confirm if username and password are correct'}</li>
                    <li>{language === 'pt-BR' ? 'Verifique se a opção SSL/TLS está configurada corretamente' : 'Check if SSL/TLS option is configured correctly'}</li>
                    <li>{language === 'pt-BR' ? 'Alguns provedores de email exigem uma "senha de aplicativo" específica' : 'Some email providers require a specific "app password"'}</li>
                    <li>{language === 'pt-BR' ? 'Verifique se o provedor de email permite acesso SMTP' : 'Check if email provider allows SMTP access'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* ZenVia Test Modal */}
      <Modal
        isOpen={showZenviaTestModal}
        onClose={() => setShowZenviaTestModal(false)}
        title={zenviaTestResult?.success 
          ? zenviaTestResult.service === 'email' 
            ? t('settings.zenviaTestSent') + ' (Email)'
            : zenviaTestResult.service === 'sms'
              ? t('settings.zenviaTestSent') + ' (SMS)'
              : t('settings.zenviaTestSent') + ' (WhatsApp)'
          : t('settings.zenviaTestError')
        }
        size="md"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowZenviaTestModal(false)}>
              {t('common.close')}
            </Button>
          </div>
        }
      >
        <div className={`p-4 rounded-lg ${
          zenviaTestResult?.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start">
            {zenviaTestResult?.success ? (
              <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
            ) : (
              <AlertTriangle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
            )}
            <div>
              <h3 className={`font-medium ${
                zenviaTestResult?.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {zenviaTestResult?.success ? t('common.success') : t('common.error')}
              </h3>
              <p className={`mt-1 text-sm ${
                zenviaTestResult?.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {zenviaTestResult?.message}
              </p>
              
              {zenviaTestResult?.success && zenviaTestResult.details && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {language === 'pt-BR' ? 'Detalhes do Envio:' : 'Sending Details:'}
                  </h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(zenviaTestResult.details).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium text-gray-700 dark:text-gray-300 w-24">{key}:</span>
                        <span className="text-gray-600 dark:text-gray-400">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!zenviaTestResult?.success && (
                <div className="mt-3 text-sm text-red-700 dark:text-red-300">
                  <p>{t('settings.troubleshootingTips')}</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>{t('settings.checkCredentials')}</li>
                    <li>{t('settings.checkService')}</li>
                    {zenviaTestResult?.service === 'sms' || zenviaTestResult?.service === 'whatsapp' ? (
                      <>
                        <li>{language === 'pt-BR' ? 'Verifique se o número de telefone do remetente está no formato correto' : 'Check if sender phone number is in correct format'}</li>
                        <li>{t('settings.phoneRequired')}</li>
                      </>
                    ) : (
                      <>
                        <li>{language === 'pt-BR' ? 'Verifique se o email do remetente está correto' : 'Check if sender email is correct'}</li>
                        <li>{t('settings.domainConfiguration')}</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Gerenciamento de Dados */}
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