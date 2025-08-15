import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginForm: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const { themeColor } = useConfig();
  const navigate = useNavigate();
  
  // Redirect if user is already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResendConfirmation(false);
    setResendMessage('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/overview');
      } else {
        // Check if it's an email confirmation error
        if (result.message?.includes('confirmado') || result.message?.includes('confirmed')) {
          setShowResendConfirmation(true);
        }
        setError(result.message || 'Erro no login. Tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro durante o login. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendConfirmation = async () => {
    if (!email) {
      setResendMessage('Por favor, digite seu email primeiro');
      return;
    }
    
    setIsResending(true);
    setResendMessage('');
    
    try {
      const { supabase } = await import('../../lib/supabase');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        setResendMessage('Erro ao reenviar email. Tente novamente.');
      } else {
        setResendMessage('Email de confirmação reenviado! Verifique sua caixa de entrada.');
        setShowResendConfirmation(false);
      }
    } catch (err) {
      setResendMessage('Erro ao reenviar email. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br"
          style={{
            background: `linear-gradient(to bottom right, ${themeColor}, color-mix(in srgb, ${themeColor} 80%, black 20%), color-mix(in srgb, ${themeColor} 60%, black 40%))`
          }}
        >
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
              <h1 className="text-2xl font-bold dark:text-white" style={{ color: themeColor }}>Meu NPS</h1>
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
                  
                  {/* Resend confirmation option */}
                  {showResendConfirmation && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                        Não recebeu o email de confirmação?
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResendConfirmation}
                        isLoading={isResending}
                        className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-600 dark:hover:bg-red-900/30"
                      >
                        Reenviar Email de Confirmação
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Resend confirmation success message */}
              {resendMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg text-sm ${
                    resendMessage.includes('reenviado')
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                  }`}
                >
                  {resendMessage}
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
                    className="w-4 h-4 border-gray-300 rounded"
                    style={{ 
                      accentColor: themeColor,
                      '--tw-ring-color': themeColor
                    } as React.CSSProperties}
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Lembrar de mim</span>
                </label>
                <a 
                  href="/forgot-password" 
                  className="text-sm hover:opacity-80"
                  style={{ color: themeColor }}
                >
                  {language === 'pt-BR' ? 'Esqueceu a senha?' : language === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot password?'}
                </a>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-12 text-base font-medium"
              >
                Entrar
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'pt-BR' ? 'Não tem uma conta?' : language === 'es' ? '¿No tienes una cuenta?' : "Don't have an account?"}{' '}
                </span>
                <Link 
                  to="/register" 
                  className="text-sm font-medium hover:opacity-80"
                  style={{ color: themeColor }}
                >
                  {language === 'pt-BR' ? 'Criar conta' : language === 'es' ? 'Crear cuenta' : 'Create account'}
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;