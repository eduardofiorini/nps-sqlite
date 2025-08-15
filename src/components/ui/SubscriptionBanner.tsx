import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import { Card, CardContent } from './Card';
import Button from './Button';
import Badge from './Badge';
import { Crown, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const SubscriptionBanner: React.FC = () => {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return null;
  }

  // Don't show banner if user has active subscription
  if (subscription?.status === 'active') {
    return null;
  }

  // Show different banners based on subscription status
  if (!subscription || subscription.status === 'not_started') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-[#00ac75] to-[#009966] border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <Crown size={24} className="mr-3" />
                <div>
                  <h3 className="font-semibold">Desbloqueie Todo o Potencial</h3>
                  <p className="text-sm text-white/90">
                    Escolha um plano e comece a coletar feedback valioso dos clientes
                  </p>
                </div>
              </div>
              <Link to="/pricing">
                <Button
                  variant="outline"
                  className="bg-white text-[#00ac75] border-white hover:bg-gray-100"
                >
                  Ver Planos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show banner for expired/cancelled subscriptions
  if (subscription.status === 'canceled' || subscription.status === 'past_due') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle size={24} className="text-red-600 dark:text-red-400 mr-3" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    {subscription.status === 'canceled' ? 'Assinatura Cancelada' : 'Pagamento Pendente'}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {subscription.status === 'canceled' 
                      ? 'Reative sua assinatura para continuar usando todos os recursos'
                      : 'Atualize seu método de pagamento para manter o acesso'
                    }
                  </p>
                </div>
              </div>
              <Link to="/pricing">
                <Button
                  variant="danger"
                  icon={<CreditCard size={16} />}
                >
                  {subscription.status === 'canceled' ? 'Reativar' : 'Atualizar Pagamento'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
};

export default SubscriptionBanner;