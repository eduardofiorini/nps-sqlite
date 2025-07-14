import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { 
  AlertTriangle, 
  CreditCard, 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  LogOut 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { STRIPE_PRODUCTS } from '../stripe-config';

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
                Seu período de teste gratuito de 7 dias expirou. Para continuar utilizando todos os recursos do Meu NPS, 
                escolha um plano de assinatura abaixo.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {STRIPE_PRODUCTS.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 p-6 hover:border-[#073143] hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h3>
                  
                  <div className="text-2xl font-bold text-[#073143] dark:text-white mb-4">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(product.price / 100)}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mês</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {product.description}
                  </p>
                  
                  <Link to="/billing">
                    <Button 
                      variant="primary" 
                      fullWidth 
                      icon={<ArrowRight size={16} />}
                    >
                      Assinar Agora
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Seus dados estão seguros
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Todos os seus dados e configurações permanecem intactos. Ao assinar um plano, 
                    você terá acesso imediato a todas as suas campanhas e respostas.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <Link to="/billing">
                <Button 
                  variant="primary" 
                  icon={<CreditCard size={16} />}
                  className="mb-4 sm:mb-0"
                >
                  Ir para Assinaturas
                </Button>
              </Link>
              
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
          Precisa de ajuda? Entre em contato com nosso suporte em <a href="mailto:suporte@meunps.com" className="text-[#073143] dark:text-[#4a9eff]">suporte@meunps.com</a>
        </div>
      </motion.div>
    </div>
  );
};

export default TrialExpired;