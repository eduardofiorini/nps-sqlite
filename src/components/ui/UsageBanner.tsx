import React from 'react';
import { Link } from 'react-router-dom';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { Card, CardContent } from './Card';
import Button from './Button';
import Badge from './Badge';
import { AlertTriangle, TrendingUp, MessageSquare, Crown, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const UsageBanner: React.FC = () => {
  const limitInfo = usePlanLimits();

  // Don't show banner if user has unlimited plan or no usage
  if (limitInfo.limits.campaigns === 'unlimited' && limitInfo.limits.responsesPerMonth === 'unlimited') {
    return null;
  }

  // Calculate usage percentages
  const campaignUsagePercent = limitInfo.limits.campaigns === 'unlimited' 
    ? 0 
    : (limitInfo.usage.campaigns / limitInfo.limits.campaigns) * 100;
    
  const responseUsagePercent = limitInfo.limits.responsesPerMonth === 'unlimited' 
    ? 0 
    : (limitInfo.usage.responsesThisMonth / limitInfo.limits.responsesPerMonth) * 100;

  // Show warning when usage is above 80%
  const showCampaignWarning = campaignUsagePercent >= 80;
  const showResponseWarning = responseUsagePercent >= 80;
  const showAnyWarning = showCampaignWarning || showResponseWarning;

  // Don't show banner if usage is low
  if (!showAnyWarning && campaignUsagePercent < 50 && responseUsagePercent < 50) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className={`border-0 ${
        showAnyWarning 
          ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center">
              {showAnyWarning ? (
                <AlertTriangle size={24} className="mr-3" />
              ) : (
                <Info size={24} className="mr-3" />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {showAnyWarning ? 'Atenção: Limite Próximo' : 'Uso do Plano'}
                </h3>
                <div className="flex items-center space-x-6 text-sm text-white/90">
                  {limitInfo.limits.campaigns !== 'unlimited' && (
                    <div className="flex items-center">
                      <TrendingUp size={16} className="mr-1" />
                      <span>
                        Campanhas: {limitInfo.usage.campaigns}/{limitInfo.limits.campaigns}
                        {showCampaignWarning && ' ⚠️'}
                      </span>
                    </div>
                  )}
                  {limitInfo.limits.responsesPerMonth !== 'unlimited' && (
                    <div className="flex items-center">
                      <MessageSquare size={16} className="mr-1" />
                      <span>
                        Respostas: {limitInfo.usage.responsesThisMonth}/{limitInfo.limits.responsesPerMonth}
                        {showResponseWarning && ' ⚠️'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-white/80 mt-1">
                  Plano atual: {limitInfo.planName}
                </div>
              </div>
            </div>
            <Link to="/dashboard/pricing">
              <Button
                variant="outline"
                className="bg-white text-gray-900 border-white hover:bg-gray-100"
                icon={<Crown size={16} />}
              >
                {showAnyWarning ? 'Fazer Upgrade' : 'Ver Planos'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UsageBanner;