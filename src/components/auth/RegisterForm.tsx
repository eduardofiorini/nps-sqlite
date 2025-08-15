import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { 
  Check, 
  Users, 
  Zap, 
  Shield, 
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

const RegisterForm: React.FC = () => {
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
  const { themeColor } = useConfig();
  const navigate = useNavigate();

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
      console.error('Registration error:', err);
      setError('Ocorreu um erro durante o registro. Tente novamente.');
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
              <h1 className="text-2xl font-bold dark:text-white" style={{ color: themeColor }}>Meu NPS</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">Plataforma de Gestão de NPS</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Crie Sua Conta
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comece a coletar feedback valioso dos clientes hoje mesmo com nossa plataforma completa de NPS.
          </p>
        </motion.div>


        {/* Registration Form */}
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Crie Sua Conta
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Comece a usar nossa plataforma de NPS hoje mesmo
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

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded mt-0.5"
                    style={{ 
                      accentColor: themeColor,
                      '--tw-ring-color': themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="accept-terms" className="text-sm text-gray-600 dark:text-gray-400">
                    Eu aceito os{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="underline hover:opacity-80"
                      style={{ color: themeColor }}
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
                  className="h-12 text-base font-medium"
                  icon={<ArrowRight size={18} />}
                >
                  Criar Conta
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Já tem uma conta?{' '}
                  </span>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium hover:opacity-80"
                    style={{ color: themeColor }}
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Recursos da Plataforma
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: `linear-gradient(to right, #00ac75, color-mix(in srgb, #00ac75 80%, black 20%))`
                }}
              >
                <BarChart3 size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Análises em Tempo Real
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Obtenha insights instantâneos sobre a satisfação do cliente com dashboards ao vivo.
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
                Trabalhe junto com sua equipe para analisar feedback e melhorar a experiência do cliente.
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
                Seus dados estão protegidos com segurança de nível empresarial e conformidade com LGPD.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pricing Plans Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Planos e Preços
            </h3>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              <span className="mr-2">🎉</span>
              7 dias grátis em todos os planos
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Iniciante Plan */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Iniciante
                </h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">R$ 49</span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Até 500 respostas/mês
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    3 campanhas ativas
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Relatórios básicos
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Suporte por email
                  </li>
                </ul>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Ideal para pequenos negócios
                </div>
              </div>
            </div>

            {/* Profissional Plan */}
            <div className="border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-200 relative" style={{ borderColor: themeColor }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 text-xs font-medium text-white rounded-full" style={{ backgroundColor: themeColor }}>
                  Mais Popular
                </span>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Profissional
                </h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">R$ 99</span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Até 2.000 respostas/mês
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Campanhas ilimitadas
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Relatórios avançados
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Integrações API
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Suporte prioritário
                  </li>
                </ul>
                <div className="text-xs font-medium" style={{ color: themeColor }}>
                  Ideal para empresas em crescimento
                </div>
              </div>
            </div>

            {/* Empresarial Plan */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Empresarial
                </h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">R$ 249</span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Respostas ilimitadas
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Campanhas ilimitadas
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Relatórios personalizados
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Múltiplos usuários
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    Suporte dedicado
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    White-label
                  </li>
                </ul>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Para grandes empresas
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Todos os planos incluem 7 dias de teste gratuito. Cancele a qualquer momento.
            </p>
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