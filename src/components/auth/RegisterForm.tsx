import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
              <h1 className="text-2xl font-bold text-[#073143] dark:text-white">Meu NPS</h1>
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
                  Criar Conta
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
            Recursos da Plataforma
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