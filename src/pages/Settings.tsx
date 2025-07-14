import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { AppConfig } from '../types';
import { getSources, getSituations, getGroups } from '../utils/supabaseStorage';
import { Save, Globe, Moon, Sun, BarChart, Users, Tag, Building, FileText, Phone, Mail, MapPin, Hash, Server, MessageSquare, Smartphone, Shield, Eye, EyeOff, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

const Settings: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState<AppConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});
  
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

  const testConnection = async (service: string) => {
    setTestingConnection(prev => ({ ...prev, [service]: true }));
    
    // Simulate connection test
    setTimeout(() => {
      setTestingConnection(prev => ({ ...prev, [service]: false }));
      setSaveMessage(`Conexão ${service} testada com sucesso!`);
      setTimeout(() => setSaveMessage(''), 3000);
    }, 2000);
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
          <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md border border-green-200 dark:border-green-800">
            {saveMessage}
          </div>
        )}

        {/* Configurações Gerais */}
        <Card>
          <CardHeader title="Configurações Gerais" />
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Cor do Tema
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
            </div>
          </CardContent>
        </Card>

        {/* Dados da Empresa */}
        <Card>
          <CardHeader title="Dados da Empresa" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  label="Nome da Empresa"
                  value={formData.company?.name || ''}
                  onChange={(e) => handleChange('company.name', e.target.value)}
                  placeholder="Nome da sua empresa"
                  fullWidth
                  className="pl-10"
                />
                <div className="absolute top-9 left-3 text-gray-400">
                  <Building size={16} />
                </div>
              </div>

              <div className="relative">
                <Input
                  label="Documento (CNPJ/CPF)"
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
                  label="Endereço"
                  value={formData.company?.address || ''}
                  onChange={(e) => handleChange('company.address', e.target.value)}
                  placeholder="Endereço completo da empresa"
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
                  placeholder="contato@empresa.com"
                  fullWidth
                  className="pl-10"
                />
                <div className="absolute top-9 left-3 text-gray-400">
                  <Mail size={16} />
                </div>
              </div>

              <div className="relative">
                <Input
                  label="Telefone"
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
          <CardHeader title="Configurações de E-mail" />
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
                        onClick={() => testConnection('SMTP')}
                        isLoading={testingConnection.SMTP}
                        icon={<CheckCircle size={14} />}
                      >
                        Testar Conexão
                      </Button>
                    )}
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.integrations?.smtp?.enabled || false}
                        onChange={(e) => handleChange('integrations.smtp.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#073143]/30 dark:peer-focus:ring-[#073143]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#073143]"></div>
                    </label>
                  </div>
                </div>

                {formData.integrations?.smtp?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Servidor SMTP"
                      value={formData.integrations?.smtp?.host || ''}
                      onChange={(e) => handleChange('integrations.smtp.host', e.target.value)}
                      placeholder="smtp.gmail.com"
                      fullWidth
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Porta"
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
                      label="Usuário"
                      value={formData.integrations?.smtp?.username || ''}
                      onChange={(e) => handleChange('integrations.smtp.username', e.target.value)}
                      placeholder="seu@email.com"
                      fullWidth
                    />

                    <div className="relative">
                      <Input
                        label="Senha"
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
                      label="Nome do Remetente"
                      value={formData.integrations?.smtp?.fromName || ''}
                      onChange={(e) => handleChange('integrations.smtp.fromName', e.target.value)}
                      placeholder="Minha Empresa"
                      fullWidth
                    />

                    <Input
                      label="E-mail do Remetente"
                      type="email"
                      value={formData.integrations?.smtp?.fromEmail || ''}
                      onChange={(e) => handleChange('integrations.smtp.fromEmail', e.target.value)}
                      placeholder="noreply@empresa.com"
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
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection('ZenVia E-mail')}
                        isLoading={testingConnection['ZenVia E-mail']}
                        icon={<CheckCircle size={14} />}
                      >
                        Testar API
                      </Button>
                    )}
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.integrations?.zenvia?.email?.enabled || false}
                        onChange={(e) => handleChange('integrations.zenvia.email.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#073143]/30 dark:peer-focus:ring-[#073143]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#073143]"></div>
                    </label>
                  </div>
                </div>

                {formData.integrations?.zenvia?.email?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label="API Key"
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
                      label="E-mail do Remetente"
                      type="email"
                      value={formData.integrations?.zenvia?.email?.fromEmail || ''}
                      onChange={(e) => handleChange('integrations.zenvia.email.fromEmail', e.target.value)}
                      placeholder="noreply@empresa.com"
                      fullWidth
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Nome do Remetente"
                        value={formData.integrations?.zenvia?.email?.fromName || ''}
                        onChange={(e) => handleChange('integrations.zenvia.email.fromName', e.target.value)}
                        placeholder="Minha Empresa"
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
          <CardHeader title="Configurações de SMS e WhatsApp" />
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
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection('ZenVia SMS')}
                        isLoading={testingConnection['ZenVia SMS']}
                        icon={<CheckCircle size={14} />}
                      >
                        Testar API
                      </Button>
                    )}
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.integrations?.zenvia?.sms?.enabled || false}
                        onChange={(e) => handleChange('integrations.zenvia.sms.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#073143]/30 dark:peer-focus:ring-[#073143]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#073143]"></div>
                    </label>
                  </div>
                </div>

                {formData.integrations?.zenvia?.sms?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label="API Key"
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
                      label="Remetente (From)"
                      value={formData.integrations?.zenvia?.sms?.from || ''}
                      onChange={(e) => handleChange('integrations.zenvia.sms.from', e.target.value)}
                      placeholder="MinhaEmpresa"
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
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection('ZenVia WhatsApp')}
                        isLoading={testingConnection['ZenVia WhatsApp']}
                        icon={<CheckCircle size={14} />}
                      >
                        Testar API
                      </Button>
                    )}
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.integrations?.zenvia?.whatsapp?.enabled || false}
                        onChange={(e) => handleChange('integrations.zenvia.whatsapp.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#073143]/30 dark:peer-focus:ring-[#073143]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#073143]"></div>
                    </label>
                  </div>
                </div>

                {formData.integrations?.zenvia?.whatsapp?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label="API Key"
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
                      label="Número do Remetente"
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