import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Crown, 
  CreditCard, 
  Settings,
  Check,
  Star,
  Shield,
  Zap,
  Users,
  BarChart3,
  Save,
  Edit,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    position: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const currentPlan = {
    id: 'pro',
    name: 'Profissional',
    price: 79,
    period: 'mês',
    features: [
      'Até 2.500 respostas/mês',
      'Campanhas ilimitadas',
      'Análises e relatórios avançados',
      'Suporte prioritário',
      'Marca personalizada',
      'Acesso à API',
      'Colaboração em equipe'
    ],
    nextBilling: '2025-02-15',
    status: 'active'
  };

  const availablePlans = [
    {
      id: 'starter',
      name: 'Iniciante',
      price: 29,
      period: 'mês',
      description: 'Perfeito para pequenas equipes',
      icon: <Users size={24} />,
      color: 'from-green-400 to-green-600',
      features: [
        'Até 500 respostas/mês',
        '2 campanhas ativas',
        'Análises básicas',
        'Suporte por email'
      ]
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 79,
      period: 'mês',
      description: 'Para empresas em crescimento',
      icon: <BarChart3 size={24} />,
      color: 'from-[#073143] to-[#0a4a5c]',
      current: true,
      features: [
        'Até 2.500 respostas/mês',
        'Campanhas ilimitadas',
        'Análises avançadas',
        'Suporte prioritário',
        'Marca personalizada',
        'Acesso à API'
      ]
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 199,
      period: 'mês',
      description: 'Solução completa para grandes organizações',
      icon: <Zap size={24} />,
      color: 'from-purple-400 to-purple-600',
      features: [
        'Respostas ilimitadas',
        'Campanhas ilimitadas',
        'Insights avançados com IA',
        'Gerente de conta dedicado',
        'Solução white-label',
        'Integração SSO'
      ]
    }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Perfil e Assinatura</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas informações pessoais e plano de assinatura
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader 
              title="Informações Pessoais"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  icon={isEditing ? <Save size={16} /> : <Edit size={16} />}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  isLoading={isSaving}
                >
                  {isEditing ? 'Salvar' : 'Editar'}
                </Button>
              }
            />
            <CardContent>
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#073143] text-white flex items-center justify-center text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-6 h-6 bg-[#073143] text-white rounded-full flex items-center justify-center hover:bg-[#0a4a5c] transition-colors">
                      <Camera size={12} />
                    </button>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <Badge variant="success" className="mt-1">
                    <Crown size={12} className="mr-1" />
                    Plano Profissional
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                />
                <Input
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                />
                <Input
                  label="Telefone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="(11) 99999-9999"
                  fullWidth
                />
                <Input
                  label="Empresa"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Nome da empresa"
                  fullWidth
                />
                <div className="md:col-span-2">
                  <Input
                    label="Cargo"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Seu cargo na empresa"
                    fullWidth
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Configurações da Conta" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Idioma
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'pt-BR')}
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tema
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {isDark ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notificações por Email
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Novas respostas NPS</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Relatórios semanais</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Atualizações do produto</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Info */}
        <div className="space-y-6">
          {/* Current Plan */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Plano Atual" />
            <CardContent>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#073143] to-[#0a4a5c] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentPlan.name}</h3>
                <div className="text-2xl font-bold text-[#073143] dark:text-white mt-1">
                  R${currentPlan.price}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/{currentPlan.period}</span>
                </div>
                <Badge variant="success" className="mt-2">
                  <Check size={12} className="mr-1" />
                  Ativo
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {currentPlan.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check size={14} className="text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </div>
                ))}
                {currentPlan.features.length > 4 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{currentPlan.features.length - 4} recursos adicionais
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Próxima cobrança:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(currentPlan.nextBilling).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Button variant="primary" fullWidth icon={<CreditCard size={16} />}>
                  Gerenciar Cobrança
                </Button>
                <Button variant="outline" fullWidth>
                  Alterar Plano
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Uso do Plano" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Respostas este mês</span>
                    <span className="font-medium text-gray-900 dark:text-white">1,247 / 2,500</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-[#073143] h-2 rounded-full" 
                      style={{ width: '49.88%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Campanhas ativas</span>
                    <span className="font-medium text-gray-900 dark:text-white">8 / ∞</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Renovação em 23 dias
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Ações Rápidas" />
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" fullWidth icon={<Settings size={16} />}>
                  Configurações Avançadas
                </Button>
                <Button variant="outline" fullWidth icon={<Shield size={16} />}>
                  Segurança da Conta
                </Button>
                <Button variant="outline" fullWidth icon={<Mail size={16} />}>
                  Suporte Técnico
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Plans */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title="Planos Disponíveis" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  plan.current
                    ? 'border-[#073143] bg-[#073143]/5 dark:bg-[#073143]/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-[#073143]/50'
                }`}
              >
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="primary">
                      <Star size={12} className="mr-1" />
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                  {plan.icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">R${plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check size={14} className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.current ? "outline" : "primary"}
                  fullWidth
                  disabled={plan.current}
                >
                  {plan.current ? 'Plano Atual' : 'Selecionar Plano'}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;