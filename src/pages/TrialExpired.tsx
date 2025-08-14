import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { 
  AlertTriangle, 
  Lock, 
  CheckCircle, 
  LogOut 
} from 'lucide-react';
import { motion } from 'framer-motion';

const TrialExpired: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full"
      >
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-red-500 p-4 flex items-center">
            <AlertTriangle size={24} className="text-white mr-3" />
            <h1 className="text-xl font-bold text-white">Seu período de teste gratuito expirou</h1>
          </div>
          
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Lock size={32} className="text-red-600 dark:text-red-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Acesso bloqueado
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                Seu período de teste gratuito expirou. Entre em contato conosco para continuar utilizando a plataforma.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Seus dados estão seguros
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Todos os seus dados e configurações permanecem intactos. Entre em contato conosco 
                    para reativar sua conta e ter acesso a todas as suas campanhas e respostas.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                icon={<LogOut size={16} />}
              >
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Precisa de ajuda? Entre em contato conosco em <a href="mailto:contato@meunps.com" className="text-[#073143] dark:text-[#4a9eff]">contato@meunps.com</a>
        </div>
      </motion.div>
    </div>
  );
};

export default TrialExpired;