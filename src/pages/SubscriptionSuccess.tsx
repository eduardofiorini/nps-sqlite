import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CheckCircle, ArrowRight, CreditCard, Calendar, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscription, refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription data after successful payment
    const refreshData = async () => {
      setIsLoading(true);
      // Wait a bit for Stripe webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refreshSubscription();
      setIsLoading(false);
    };

    refreshData();
  }, [refreshSubscription]);

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-500 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle size={40} className="text-green-500" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Pagamento Realizado com Sucesso!
            </h1>
            <p className="text-green-100">
              Sua assinatura foi ativada e você já pode usar todos os recursos
            </p>
          </div>

          <CardContent className="p-8">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ac75] mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Carregando informações da assinatura...
                </p>
              </div>
            ) : subscription ? (
              <div className="space-y-6">
                {/* Subscription Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CreditCard size={20} className="mr-2" />
                    Detalhes da Assinatura
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Plano
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {subscription.planName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </label>
                      <div className="flex items-center">
                        <Badge variant="success" className="mt-1">
                          {subscription.status === 'active' ? 'Ativo' : subscription.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Próxima Cobrança
                      </label>
                      <p className="text-gray-900 dark:text-white flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                    
                    {subscription.paymentMethodLast4 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Método de Pagamento
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {subscription.paymentMethodBrand?.toUpperCase()} •••• {subscription.paymentMethodLast4}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* What's Next */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    O que fazer agora?
                  </h3>
                  <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                    <li className="flex items-center">
                      <Check size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                      Crie sua primeira campanha NPS
                    </li>
                    <li className="flex items-center">
                      <Check size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                      Configure suas fontes e grupos de contatos
                    </li>
                    <li className="flex items-center">
                      <Check size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                      Personalize o design das suas pesquisas
                    </li>
                    <li className="flex items-center">
                      <Check size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                      Comece a coletar feedback dos clientes
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigate('/campaigns/new')}
                    icon={<ArrowRight size={18} />}
                    className="h-12 text-base font-medium"
                  >
                    Criar Primeira Campanha
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/overview')}
                    className="h-12 text-base font-medium"
                  >
                    Ir para Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Não foi possível carregar os detalhes da assinatura.
                </p>
                <Button
                  variant="outline"
                  onClick={() => refreshSubscription()}
                >
                  Tentar Novamente
                </Button>
              </div>
            )}

            {/* Session ID for debugging */}
            {sessionId && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  ID da Sessão: {sessionId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SubscriptionSuccess;