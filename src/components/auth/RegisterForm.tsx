import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { stripeProducts } from '../../stripe-config';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { 
  Check, 
  Users, 
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
  const [searchParams] = useSearchParams();
  
  // Map plan names to product IDs
  const getPlanIdFromName = (planName: string): string => {
    const planMap: Record<string, string> = {
      'iniciante': 'prod_SepSP5opHKX1bn',
      'profissional': 'prod_SepTpOOlWoAQVJ', 
      'empresarial': 'prod_SepUQbVbq2G9Ww'
    };
    return planMap[planName.toLowerCase()] || 'prod_SepTpOOlWoAQVJ'; // Default to professional
  };
  
  // Get initial plan from URL parameter
  const getInitialPlan = (): string => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      return getPlanIdFromName(planParam);
    }
    return 'prod_SepTpOOlWoAQVJ'; // Default to professional plan
  };
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedPlan, setSelectedPlan] = useState(getInitialPlan());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const getProductIcon = (productName: string) => {
    if (productName.includes('Iniciante')) {
      return <Users size={24} className="text-white" />;
    } else if (productName.includes('Profissional')) {
      return <BarChart3 size={24} className="text-white" />;
    } else if (productName.includes('Empresarial')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>;
    }
    return <BarChart3 size={24} className="text-white" />;
  };

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
      const result = await register(formData.email, formData.password, formData.name);
      
      if (result.success) {
         navigate('/dashboard/campaigns');
      } else {
        setError(result.message || 'Falha no registro. Verifique os dados e tente novamente.');
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

  const selectedPlanData = stripeProducts.find(product => product.id === selectedPlan);

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
              <h1 className="text-2xl font-bold text-[#00ac75] dark:text-white">Meu NPS</h1>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pricing Plans */}
          <div className="lg:col-span-2">
            {/* Free Trial Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-lg font-medium">
                <span className="mr-2">🎉</span>
                7 dias grátis em todos os planos
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {stripeProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedPlan === product.id
                      ? 'border-[#00ac75] bg-[#00ac75]/5 dark:bg-[#00ac75]/10'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedPlan(product.id)}
                >
                  {product.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 text-xs font-medium text-white bg-[#00ac75] rounded-full">
                        ⭐ Mais Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className={`w-12 h-12 ${product.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      {getProductIcon(product.name)}
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2"> 
                      {product.name.replace('Meu NPS - ', '')}
                    </h4>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        R${product.price.toFixed(0)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/mês</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      {product.description}
                    </p>
                    
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 text-left">
                      {product.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedPlan === product.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-[#00ac75] rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              key="registration-form"
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 sticky top-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Crie Sua Conta
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
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

                {/* Selected Plan Display */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Plano Selecionado: {selectedPlanData?.name.replace('Meu NPS - ', '')}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        7 dias grátis, depois R${selectedPlanData?.price.toFixed(0)}/mês
                      </p>
                    </div>
                    <div className="w-6 h-6 bg-[#00ac75] rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 text-[#00ac75] border-gray-300 rounded mt-0.5 focus:ring-[#00ac75]"
                  />
                  <label htmlFor="accept-terms" className="text-sm text-gray-600 dark:text-gray-400">
                    Eu aceito os{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[#00ac75] underline hover:opacity-80"
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
                  className="h-12 text-base font-medium bg-[#00ac75] hover:bg-[#009966] focus:ring-[#00ac75]"
                  icon={<ArrowRight size={18} />}
                >
                  → Iniciar Teste Gratuito de 7 dias
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Já tem uma conta?{' '}
                  </span>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-[#00ac75] hover:opacity-80"
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
            </motion.div>
          </div>
        </div>
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