import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button';
import Input from '../ui/Input';
import { 
  Check, 
  Users, 
  Zap, 
  Shield, 
  Star,
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import TermsModal from './TermsModal';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const RegisterForm: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Iniciante',
      price: 49,
      period: 'mês',
      description: 'Perfeito para pequenas equipes começando com NPS',
      icon: <Users size={24} />,
      color: 'from-green-400 to-green-600',
      features: [
        'Até 500 respostas/mês',
        '2 campanhas ativas',
        'Análises básicas',
        'Suporte por email',
        'Templates padrão'
      ]
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 99,
      period: 'mês',
      description: 'Recursos avançados para empresas em crescimento',
      icon: <BarChart3 size={24} />,
      color: 'from-[#073143] to-[#0a4a5c]',
      popular: true,
      features: [
        'Até 2.500 respostas/mês',
        'Campanhas ilimitadas',
        'Análises e relatórios avançados',
        'Suporte prioritário',
        'Marca personalizada',
        'Acesso à API',
        'Colaboração em equipe'
      ]
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 249,
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
        'Integração SSO',
        'Integrações personalizadas',
        'Garantia de SLA'
      ]
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('Você deve aceitar os Termos de Uso e Política de Privacidade para continuar');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(formData.email, formData.password, formData.name);
      
      if (success) {
        navigate('/');
      } else {
        setError('Falha no registro. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro durante o registro. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setShowTermsModal(false);
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 mr-3 flex items-center justify-center">
              <img 
                src="/icone.png" 
                alt="Meu NPS" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-[#073143] dark:text-white">Meu NPS</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">Plataforma de Gestão de NPS</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Inicie Seu Teste Gratuito
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Escolha o plano perfeito para seu negócio e comece a coletar feedback valioso dos clientes hoje mesmo.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Pricing Plans */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer ${
                    selectedPlan === plan.id
                      ? 'border-[#073143] shadow-[#073143]/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-[#073143] to-[#0a4a5c] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star size={14} className="mr-1" />
                        Mais Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                      {plan.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        R${plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 sticky top-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Crie Sua Conta
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Inicie seu teste gratuito de 14 dias, sem cartão de crédito
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="relative">
                  <Input
                    label="Nome Completo"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="João Silva"
                    required
                    fullWidth
                    className="pl-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <User size={16} />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="Endereço de Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="joao@empresa.com"
                    required
                    fullWidth
                    className="pl-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <Mail size={16} />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    fullWidth
                    className="pl-10 pr-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirmar Senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    required
                    fullWidth
                    className="pl-10 pr-10"
                  />
                  <div className="absolute top-9 left-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="bg-[#073143]/10 dark:bg-[#073143]/20 rounded-lg p-4 border border-[#073143]/20 dark:border-[#073143]/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#073143] dark:text-white">
                        Plano Selecionado: {plans.find(p => p.id === selectedPlan)?.name}
                      </p>
                      <p className="text-xs text-[#073143]/70 dark:text-gray-300">
                        14 dias grátis, depois R${plans.find(p => p.id === selectedPlan)?.price}/mês
                      </p>
                    </div>
                    <Shield size={20} className="text-[#073143] dark:text-white" />
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143] mt-0.5"
                  />
                  <label htmlFor="accept-terms" className="text-sm text-gray-600 dark:text-gray-400">
                    Eu aceito os{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[#073143] hover:text-[#0a4a5c] dark:text-[#4a9eff] underline"
                    >
                      Termos de Uso e Política de Privacidade
                    </button>
                  </label>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={!acceptedTerms}
                  className="h-12 text-base font-medium bg-[#073143] hover:bg-[#0a4a5c] focus:ring-[#073143]"
                  icon={<ArrowRight size={18} />}
                >
                  Iniciar Teste Gratuito
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Já tem uma conta?{' '}
                  </span>
                  <Link 
                    to="/login" 
                    className="text-sm text-[#073143] hover:text-[#0a4a5c] dark:text-[#4a9eff] font-medium"
                  >
                    Entrar
                  </Link>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Seus dados estão protegidos e serão usados conforme nossa Política de Privacidade
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Por que escolher o Meu NPS?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#073143] to-[#0a4a5c] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Análises em Tempo Real
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Obtenha insights instantâneos sobre a satisfação do cliente com dashboards ao vivo e relatórios.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Colaboração em Equipe
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Trabalhe junto com sua equipe para analisar feedback e implementar melhorias.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Segurança Empresarial
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Seus dados estão protegidos com segurança de nível empresarial e padrões de conformidade.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
};

export default RegisterForm;