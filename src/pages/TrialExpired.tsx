import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { 
  AlertTriangle, 
  Lock, 
  CheckCircle, 
  LogOut,
  Crown,
  ArrowRight,
  Mail,
  Phone
} from 'lucide-react';
import { motion } from 'framer-motion';

const TrialExpired: React.FC = () => {
  const { logout } = useAuth();
  const { themeColor } = useConfig();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Lock size={40} className="text-red-500" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Período de Teste Expirado
            </h1>
            <p className="text-red-100 text-lg">
              Seu teste gratuito de 7 dias chegou ao fim
            </p>
          </div>
          
          <CardContent className="p-8 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Continue aproveitando todos os recursos
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                Escolha um plano para continuar coletando feedback valioso dos seus clientes 
                e transformando dados em crescimento real para seu negócio.
              </p>
            </div>
            
            {/* What you accomplished during trial */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-start">
                <CheckCircle size={24} className="text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                    Seus dados estão seguros
                  </h4>
                  <p className="text-green-700 dark:text-green-300">
                    Todas as suas campanhas, respostas e configurações estão preservadas. 
                    Assim que você escolher um plano, terá acesso imediato a tudo novamente.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button
                  variant="primary"
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold w-full sm:w-auto"
                  style={{ backgroundColor: themeColor }}
                  icon={<Crown size={20} />}
                >
                  Ver Planos e Preços
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-semibold w-full sm:w-auto"
                onClick={handleLogout}
                icon={<LogOut size={20} />}
              >
                Fazer Logout
              </Button>
            </div>
            
            {/* Contact information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Precisa de ajuda ou tem dúvidas?
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-600 dark:text-gray-400">
                <a 
                  href="mailto:contato@meunps.com" 
                  className="flex items-center hover:text-[#00ac75] transition-colors"
                >
                  <Mail size={16} className="mr-2" />
                  contato@meunps.com
                </a>
                <a 
                  href="tel:+5511999999999" 
                  className="flex items-center hover:text-[#00ac75] transition-colors"
                >
                  <Phone size={16} className="mr-2" />
                  (11) 99999-9999
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TrialExpired;