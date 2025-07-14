import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
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
  Settings,
  AlertTriangle,
  Key,
  Trash2,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserProfile, saveUserProfile } from '../utils/supabaseStorage';
import type { UserProfile } from '../types';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      const { supabase } = await import('../lib/supabase');
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) {
        throw error;
      }
      
      // Reset form and show success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setShowPasswordModal(false);
      setSaveMessage('Senha alterada com sucesso!');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Erro ao alterar senha. Verifique sua senha atual e tente novamente.');
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.email) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const { supabase } = await import('../lib/supabase');
      
      // Delete user data
      const { error: deleteError } = await supabase.rpc('delete_user_data');
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        throw error;
      }
      
      // Log out and redirect to login page
      await logout();
      navigate('/login');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSaveMessage('Erro ao excluir conta. Entre em contato com o suporte.');
    }
  };
  
  const handleDataExport = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (userError) throw userError;
      
      // Get campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user?.id);
        
      if (campaignsError) throw campaignsError;
      
      // Get contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user?.id);
        
      if (contactsError) throw contactsError;
      
      // Get groups
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', user?.id);
        
      if (groupsError) throw groupsError;
      
      // Get sources
      const { data: sources, error: sourcesError } = await supabase
        .from('sources')
        .select('*')
        .eq('user_id', user?.id);
        
      if (sourcesError) throw sourcesError;
      
      // Get situations
      const { data: situations, error: situationsError } = await supabase
        .from('situations')
        .select('*')
        .eq('user_id', user?.id);
        
      if (situationsError) throw situationsError;
      
      // Get app config
      const { data: appConfig, error: appConfigError } = await supabase
        .from('app_configs')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (appConfigError && appConfigError.code !== 'PGRST116') throw appConfigError;
      
      // Compile all data
      const exportData = {
        user: {
          id: user?.id,
          email: user?.email,
          name: userData?.name,
          phone: userData?.phone,
          company: userData?.company,
          position: userData?.position,
          preferences: userData?.preferences,
          created_at: userData?.created_at
        },
        campaigns,
        contacts,
        groups,
        sources,
        situations,
        app_config: appConfig
      };
      
      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meu-nps-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSaveMessage('Dados exportados com sucesso!');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      setSaveMessage('Erro ao exportar dados. Tente novamente.');
    }
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
          
          {/* Password and Security */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Senha e Segurança" />
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Alterar Senha</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Atualize sua senha para manter sua conta segura
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordModal(true)}
                    icon={<Key size={16} />}
                  >
                    Alterar Senha
                  </Button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Exportar Meus Dados</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Baixe uma cópia de todos os seus dados pessoais
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleDataExport}
                      icon={<Download size={16} />}
                    >
                      Exportar Dados
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-red-600 dark:text-red-400">Excluir Minha Conta</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Exclua permanentemente sua conta e todos os seus dados
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => setShowDeleteModal(true)}
                      icon={<Trash2 size={16} />}
                    >
                      Excluir Conta
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Privacy and Data Protection */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Privacidade e Proteção de Dados" />
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">LGPD e GDPR</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil e o Regulamento Geral de Proteção de Dados (GDPR) da União Europeia.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Seus Direitos de Privacidade</h4>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.dataConsent?.marketing || false}
                        onChange={(e) => {
                          if (profile) {
                            setProfile({
                              ...profile,
                              preferences: {
                                ...profile.preferences,
                                dataConsent: {
                                  ...(profile.preferences.dataConsent || {}),
                                  marketing: e.target.checked
                                }
                              }
                            });
                          }
                        }}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Aceito receber comunicações de marketing e novidades
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.dataConsent?.analytics || false}
                        onChange={(e) => {
                          if (profile) {
                            setProfile({
                              ...profile,
                              preferences: {
                                ...profile.preferences,
                                dataConsent: {
                                  ...(profile.preferences.dataConsent || {}),
                                  analytics: e.target.checked
                                }
                              }
                            });
                          }
                        }}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Aceito o uso de dados para análises e melhorias do serviço
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.dataConsent?.thirdParty || false}
                        onChange={(e) => {
                          if (profile) {
                            setProfile({
                              ...profile,
                              preferences: {
                                ...profile.preferences,
                                dataConsent: {
                                  ...(profile.preferences.dataConsent || {}),
                                  thirdParty: e.target.checked
                                }
                              }
                            });
                          }
                        }}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Aceito o compartilhamento de dados com parceiros confiáveis
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Seus Direitos</h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Direito de acesso aos seus dados pessoais</li>
                    <li>• Direito de retificação de dados incorretos</li>
                    <li>• Direito ao esquecimento (exclusão de dados)</li>
                    <li>• Direito à portabilidade dos dados</li>
                    <li>• Direito de revogar consentimento a qualquer momento</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
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
      
      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError('');
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }}
        title="Alterar Senha"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handlePasswordChange}
            >
              Alterar Senha
            </Button>
          </div>
        }
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800 rounded-md border">
              {passwordError}
            </div>
          )}
          
          <Input
            label="Senha Atual"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            placeholder="Digite sua senha atual"
            fullWidth
            required
          />
          
          <Input
            label="Nova Senha"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            placeholder="Digite sua nova senha"
            fullWidth
            required
          />
          
          <Input
            label="Confirmar Nova Senha"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            placeholder="Confirme sua nova senha"
            fullWidth
            required
          />
          
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Requisitos de senha:</p>
            <ul className="list-disc list-inside">
              <li>Mínimo de 6 caracteres</li>
              <li>Recomendado: Incluir letras maiúsculas e minúsculas</li>
              <li>Recomendado: Incluir números e caracteres especiais</li>
            </ul>
          </div>
        </form>
      </Modal>
      
      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
        }}
        title="Excluir Conta"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
              disabled={deleteConfirmation !== user?.email || isDeleting}
            >
              Excluir Permanentemente
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Esta ação não pode ser desfeita
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Todos os seus dados serão permanentemente excluídos, incluindo:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-1 list-disc list-inside">
                <li>Campanhas e respostas NPS</li>
                <li>Contatos e grupos</li>
                <li>Configurações e preferências</li>
                <li>Histórico de pagamentos</li>
              </ul>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Para confirmar a exclusão, digite seu email <strong>{user?.email}</strong> abaixo:
          </p>
          
          <Input
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder={user?.email}
            fullWidth
          />
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Conformidade com LGPD e GDPR
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              De acordo com a Lei Geral de Proteção de Dados (LGPD) e o Regulamento Geral de Proteção de Dados (GDPR), 
              você tem o direito de solicitar a exclusão de seus dados pessoais. Esta ação excluirá permanentemente 
              sua conta e todos os dados associados a ela.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;