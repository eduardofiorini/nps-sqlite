import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError('Erro ao enviar e-mail de recuperação. Verifique o endereço e tente novamente.');
      } else {
        setIsSuccess(true);
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
                Recupere Sua Conta
              </h2>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Não se preocupe! Enviaremos instruções para redefinir sua senha por e-mail.
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
                E-mail Enviado!
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enviamos um link de recuperação para <strong>{email}</strong>. 
                Verifique sua caixa de entrada e siga as instruções.
              </p>
              
              <div className="space-y-4">
                <Link to="/login">
                  <Button variant="primary" fullWidth icon={<ArrowLeft size={16} />}>
                    Voltar ao Login
                  </Button>
                </Link>
                
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="w-full text-sm text-[#073143] hover:text-[#0a4a5c] dark:text-[#4a9eff]"
                >
                  Tentar outro e-mail
                </button>
              </div>
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
              Recupere Sua Conta
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Não se preocupe! Enviaremos instruções para redefinir sua senha por e-mail.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Forgot Password Form */}
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
                Esqueceu sua senha?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Digite seu e-mail para receber instruções de recuperação
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
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-12 text-base font-medium bg-[#073143] hover:bg-[#0a4a5c] focus:ring-[#073143]"
              >
                Enviar Link de Recuperação
              </Button>
              
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-[#073143] hover:text-[#0a4a5c] dark:text-[#4a9eff] font-medium flex items-center justify-center"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Voltar ao Login
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;