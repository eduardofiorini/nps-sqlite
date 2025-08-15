import React from 'react';
import { Link } from 'react-router-dom';
import { useTrial } from '../../hooks/useTrial';
import { Card, CardContent } from './Card';
import Button from './Button';
import { Clock, Crown, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const TrialBanner: React.FC = () => {
  const { trialInfo, loading } = useTrial();

  if (loading || !trialInfo.isTrialActive) {
    return null;
  }

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
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
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
            <Link to="/pricing">
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
};

export default TrialBanner;