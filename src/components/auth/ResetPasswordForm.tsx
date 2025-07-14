import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { isSupabaseConfigured } from '../../lib/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    // Check if we have the required tokens
    const type = searchParams.get('type');
    const accessToken = searchParams.get('access_token') || searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token') || searchParams.get('refresh_token');
    
    if (type === 'recovery' && accessToken) {
      setHasValidToken(true);
      
      // Set the session with the recovery token
      const setSession = async () => {
        try {
          if (isSupabaseConfigured()) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('Error setting session:', error);
              setError('Link de recuperação inválido ou expirado.');
              setHasValidToken(false);
            }
          } else {
            // In demo mode, just pretend we have a valid token
            console.log('Demo mode: simulating valid recovery token');
          }
        } catch (err) {
          console.error('Error setting session:', err);
          setError('Ocorreu um erro ao processar o link de recuperação.');
          setHasValidToken(false);
        }
      };
      
      setSession();
    } else {
      setError('Link de recuperação inválido ou expirado. Solicite um novo link.');
      setHasValidToken(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      let success = false;
      
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          password: password
        });
        
        if (error) {
          setError('Erro ao redefinir senha. Tente novamente.');
          throw error;
        }
        
        success = true;
      } else {
        // Demo mode - simulate success
        console.log('Demo mode: simulating password reset success');
        success = true;
      }

      if (success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
                Senha Redefinida!
              </h2>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Sua senha foi alterada com sucesso. Você será redirecionado para o login.
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Right side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Senha Redefinida!
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sua senha foi alterada com sucesso. Você será redirecionado para a página de login em alguns segundos.
              </p>
              
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Ir para Login
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
              Redefina Sua Senha
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Digite sua nova senha para continuar acessando sua conta.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Reset Password Form */}
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
                Nova Senha
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Digite sua nova senha para redefinir o acesso
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
                  label="Nova Senha"
                  type={showPassword ? 'text' : 'password'}
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
              
              <div className="relative">
                <Input
                  label="Confirmar Nova Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-9 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                A senha deve ter pelo menos 6 caracteres e incluir letras e números
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-12 text-base font-medium bg-[#073143] hover:bg-[#0a4a5c] focus:ring-[#073143]"
              >
                {hasValidToken ? 'Redefinir Senha' : 'Voltar ao Login'}
              </Button>
              
              {!hasValidToken && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/forgot-password')}
                    fullWidth
                  >
                    Solicitar Novo Link
                  </Button>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;