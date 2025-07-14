import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/');
      } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro durante o login. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#073143] via-[#0a4a5c] to-[#0d5a75]">
          <img
            src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Business analytics"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-48 h-48 mr-4 flex items-center justify-center">
                <img 
                  src="/logo-white.png" 
                  alt="Meu NPS" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Transforme Feedback em Crescimento
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Colete, analise e aja sobre o feedback dos clientes com nossa plataforma completa de gestão NPS. 
              Impulsione a satisfação do cliente e o sucesso do negócio.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span className="text-white/90">Acompanhamento de NPS em tempo real</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span className="text-white/90">Formulários de pesquisa personalizáveis</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span className="text-white/90">Relatórios avançados e insights</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-20 h-20 mr-3 flex items-center justify-center">
              <img 
                src="/icone.png" 
                alt="Meu NPS" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-[#073143] dark:text-white">Meu NPS</h1>
              <span className="text-xs text-gray-500 dark:text-gray-400">Plataforma de Gestão de NPS</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Entre na sua conta para continuar
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
              
              <div className="relative">
                <Input
                  label="Endereço de Email"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  fullWidth
                  className="pl-12"
                />
                <div className="absolute top-9 left-4 text-gray-400">
                  <Mail size={18} />
                </div>
              </div>
              
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  fullWidth
                  className="pl-12 pr-12"
                />
                <div className="absolute top-9 left-4 text-gray-400">
                  <Lock size={18} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-9 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Lembrar de mim</span>
                </label>
                <a href="#" className="text-sm text-[#073143] hover:text-[#0a4a5c] dark:text-[#4a9eff]">
                  Esqueceu a senha?
                </a>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-12 text-base font-medium bg-[#073143] hover:bg-[#0a4a5c] focus:ring-[#073143]"
              >
                Entrar
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Não tem uma conta?{' '}
                </span>
                <Link 
                  to="/register" 
                  className="text-sm text-[#073143] hover:text-[#0a4a5c] dark:text-[#4a9eff] font-medium"
                >
                  Criar conta
                </Link>
              </div>
              
              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-[#073143] hover:text-[#0a4a5c] dark:text-[#4a9eff]"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Para demonstração, digite qualquer email e senha
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;