import React from 'react';
import { Link } from 'react-router-dom';
import { useTrial } from '../../hooks/useTrial';
import { useSubscription } from '../../hooks/useSubscription';
import { Card, CardContent } from './Card';
import Button from './Button';
import { Clock, Crown, AlertTriangle, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const UnifiedBanner: React.FC = () => {
  const { trialInfo, loading: trialLoading } = useTrial();
  const { subscription, loading: subscriptionLoading } = useSubscription();

  if (trialLoading || subscriptionLoading) {
    return null;
  }

  // Don't show banner if user has active subscription
  if (subscription?.status === 'active') {
    return null;
  }

  // Show trial countdown if trial is active
  if (trialInfo.isTrialActive) {
    const { daysRemaining, hoursRemaining, minutesRemaining } = trialInfo;
    const isUrgent = daysRemaining <= 1;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className={`border-0 ${
          isUrgent 
            ? 'bg-gradient-to-r from-red-500 to-orange-500' 
            : 'bg-gradient-to-r from-[#00ac75] to-[#009966]'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center">
                {isUrgent ? (
                  <AlertTriangle size={24} className="mr-3 animate-pulse" />
                ) : (
                  <Clock size={24} className="mr-3" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {isUrgent ? 'Seu teste gratuito está acabando!' : 'Período de teste gratuito'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-white/90">
                    <span className="flex items-center">
                      <span className="font-bold text-xl mr-1">{daysRemaining}</span>
                      {daysRemaining === 1 ? 'dia' : 'dias'}
                    </span>
                    <span className="flex items-center">
                      <span className="font-bold text-xl mr-1">{hoursRemaining}</span>
                      {hoursRemaining === 1 ? 'hora' : 'horas'}
                    </span>
                    <span className="flex items-center">
                      <span className="font-bold text-xl mr-1">{minutesRemaining}</span>
                      {minutesRemaining === 1 ? 'minuto' : 'minutos'}
                    </span>
                    <span className="text-white/80">restantes</span>
                  </div>
                </div>
              </div>
              <Link to="/user/pricing">
                <Button
                  variant="outline"
                  className="bg-white text-gray-900 border-white hover:bg-gray-100"
                  icon={<Crown size={16} />}
                >
                  {isUrgent ? 'Assinar Agora' : 'Ver Planos'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show subscription prompt if no trial and no subscription
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
              <Link to="/user/pricing">
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
              <Link to="/user/pricing">
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

export default UnifiedBanner;