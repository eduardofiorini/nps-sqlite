import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  User, 
  Mail, 
  Phone,
  Building,
  Briefcase,
  Save,
  Edit,
  Camera,
  Upload,
  X,
  Globe,
  Bell,
  Shield,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserProfile, saveUserProfile } from '../utils/supabaseStorage';
import type { UserProfile } from '../types';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getUserProfile();
        if (userProfile) {
          setProfile(userProfile);
          setAvatarPreview(userProfile.avatar || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (!profile) return;
    
    if (field.includes('.')) {
      // Handle nested fields like preferences.language
      const [parent, child] = field.split('.');
      setProfile(prev => prev ? {
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      } : null);
    } else {
      setProfile(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    if (!profile) return;
    
    setProfile(prev => prev ? {
      ...prev,
      preferences: {
        ...prev.preferences,
        emailNotifications: {
          ...prev.preferences.emailNotifications,
          [field]: value
        }
      }
    } : null);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        if (profile) {
          setProfile({ ...profile, avatar: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    if (profile) {
      setProfile({ ...profile, avatar: '' });
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    
    try {
      // Update language context if changed
      if (profile.preferences.language !== language) {
        setLanguage(profile.preferences.language);
      }
      
      // Save profile
      const savedProfile = await saveUserProfile(profile);
      setProfile(savedProfile);
      
      setSaveMessage('Perfil salvo com sucesso!');
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload profile from storage
    const loadProfile = async () => {
      try {
        const userProfile = await getUserProfile();
        if (userProfile) {
          setProfile(userProfile);
          setAvatarPreview(userProfile.avatar || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadProfile();
    setIsEditing(false);
  };

  if (!user || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
                icon={<Save size={16} />}
              >
                Salvar Alterações
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              icon={<Edit size={16} />}
            >
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            saveMessage.includes('sucesso')
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {saveMessage}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Informações Pessoais" />
            <CardContent>
              {/* Avatar Section */}
              <div className="flex items-center mb-6">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#073143] text-white flex items-center justify-center text-2xl font-bold border-4 border-gray-200 dark:border-gray-600">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {isEditing && (
                    <div className="absolute bottom-0 right-0 flex space-x-1">
                      <label className="w-6 h-6 bg-[#073143] text-white rounded-full flex items-center justify-center hover:bg-[#0a4a5c] transition-colors cursor-pointer">
                        <Camera size={12} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      {avatarPreview && (
                        <button
                          onClick={removeAvatar}
                          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Nome Completo"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                    className="pl-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <User size={16} />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="Email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
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
                    value={profile.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="(11) 99999-9999"
                    fullWidth
                    className="pl-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <Phone size={16} />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="Empresa"
                    value={profile.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nome da empresa"
                    fullWidth
                    className="pl-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <Building size={16} />
                  </div>
                </div>

                <div className="md:col-span-2 relative">
                  <Input
                    label="Cargo"
                    value={profile.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Seu cargo na empresa"
                    fullWidth
                    className="pl-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <Briefcase size={16} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Preferências" />
            <CardContent>
              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Idioma
                  </label>
                  <select
                    value={profile.preferences.language}
                    onChange={(e) => handleInputChange('preferences.language', e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tema
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {isDark ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
                    </span>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                      >
                        Alternar Tema
                      </Button>
                    )}
                  </div>
                </div>

                {/* Email Notifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Bell size={16} className="inline mr-2" />
                    Notificações por Email
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.emailNotifications.newResponses}
                        onChange={(e) => handleNotificationChange('newResponses', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Novas respostas NPS
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.emailNotifications.weeklyReports}
                        onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Relatórios semanais
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.emailNotifications.productUpdates}
                        onChange={(e) => handleNotificationChange('productUpdates', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Atualizações do produto
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Informações da Conta" />
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Ativo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Plano:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Profissional</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Última atualização:</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(profile.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Preferências" />
            <CardContent>
              <div className="space-y-4">
                {/* Language Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Idioma Preferido
                  </label>
                  <select
                    value={profile.preferences.language}
                    onChange={(e) => handleInputChange('preferences.language', e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                  </select>
                </div>

                {/* Theme Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tema da Interface
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {isDark ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
                    </span>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                      >
                        Alternar Tema
                      </Button>
                    )}
                  </div>
                </div>

                {/* Email Notifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Bell size={16} className="inline mr-2" />
                    Notificações por Email
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.emailNotifications.newResponses}
                        onChange={(e) => handleNotificationChange('newResponses', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Novas respostas NPS
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.emailNotifications.weeklyReports}
                        onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Relatórios semanais
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.emailNotifications.productUpdates}
                        onChange={(e) => handleNotificationChange('productUpdates', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Atualizações do produto
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Instructions */}
          {isEditing && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <Upload size={16} className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Dica para Avatar
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Use uma imagem quadrada de pelo menos 200x200px para melhor qualidade.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;