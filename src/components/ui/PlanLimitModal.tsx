import React from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import Button from './Button';
import Badge from './Badge';
import { Crown, AlertTriangle, TrendingUp, Users, MessageSquare, Zap } from 'lucide-react';
import { PlanLimitInfo } from '../../hooks/usePlanLimits';
import { stripeProducts } from '../../stripe-config';

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitInfo: PlanLimitInfo;
  limitType: 'campaigns' | 'responses';
}

const PlanLimitModal: React.FC<PlanLimitModalProps> = ({
  isOpen,
  onClose,
  limitInfo,
  limitType
}) => {
  const getTitle = () => {
    if (limitType === 'campaigns') {
      return 'Limite de Campanhas Atingido';
    }
    return 'Limite de Respostas Atingido';
  };

  const getDescription = () => {
    if (limitType === 'campaigns') {
      return `Você atingiu o limite de ${limitInfo.limits.campaigns} campanhas do seu plano atual.`;
    }
    return `Você atingiu o limite de ${limitInfo.limits.responsesPerMonth} respostas por mês do seu plano atual.`;
  };

  const getCurrentPlan = () => {
    if (limitInfo.isTrialActive) {
      return 'Período de Teste (7 dias)';
    }
    return limitInfo.planName;
  };

  const getRecommendedPlan = () => {
    if (limitType === 'campaigns') {
      // Recommend Professional plan for unlimited campaigns
      return stripeProducts.find(p => p.name.includes('Profissional'));
    } else {
      // Recommend based on current usage
      if (limitInfo.usage.responsesThisMonth > 500) {
        return stripeProducts.find(p => p.name.includes('Profissional'));
      }
      return stripeProducts.find(p => p.name.includes('Iniciante'));
    }
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="lg"
      footer={
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <div className="flex space-x-3">
            <Link to="/dashboard/pricing">
              <Button variant="primary" icon={<Crown size={16} />}>
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Alert */}
        <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Limite do Plano Atingido
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {getDescription()}
            </p>
          </div>
        </div>

        {/* Current Usage */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Uso Atual - {getCurrentPlan()}
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <TrendingUp size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Campanhas:</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {limitInfo.usage.campaigns} / {limitInfo.limits.campaigns === 'unlimited' ? '∞' : limitInfo.limits.campaigns}
                </span>
                {limitInfo.limits.campaigns !== 'unlimited' && (
                  <div className="ml-2 w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        limitInfo.usage.campaigns >= limitInfo.limits.campaigns ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min((limitInfo.usage.campaigns / limitInfo.limits.campaigns) * 100, 100)}%` 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <MessageSquare size={16} className="text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Respostas (este mês):</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {limitInfo.usage.responsesThisMonth} / {limitInfo.limits.responsesPerMonth === 'unlimited' ? '∞' : limitInfo.limits.responsesPerMonth}
                </span>
                {limitInfo.limits.responsesPerMonth !== 'unlimited' && (
                  <div className="ml-2 w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        limitInfo.usage.responsesThisMonth >= limitInfo.limits.responsesPerMonth ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min((limitInfo.usage.responsesThisMonth / limitInfo.limits.responsesPerMonth) * 100, 100)}%` 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Plan */}
        {recommendedPlan && (
          <div className="border border-[#00ac75] rounded-lg p-4 bg-[#00ac75]/5 dark:bg-[#00ac75]/10">
            <div className="flex items-center mb-3">
              <Crown size={20} className="text-[#00ac75] mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Plano Recomendado
              </h4>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">
                  {recommendedPlan.name.replace('Meu NPS - ', '')}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {recommendedPlan.description}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-2xl font-bold text-[#00ac75]">
                    R${recommendedPlan.price.toFixed(0)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">/mês</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {recommendedPlan.features[1] || 'Campanhas ilimitadas'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare size={14} className="text-blue-500 mr-1" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {recommendedPlan.features[0] || 'Mais respostas'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits of Upgrading */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
            <Zap size={16} className="mr-2" />
            Benefícios do Upgrade
          </h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            {limitType === 'campaigns' ? (
              <>
                <li className="flex items-center">
                  <TrendingUp size={14} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Criar campanhas ilimitadas
                </li>
                <li className="flex items-center">
                  <MessageSquare size={14} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Coletar mais respostas por mês
                </li>
                <li className="flex items-center">
                  <Users size={14} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Colaboração em equipe
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center">
                  <MessageSquare size={14} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Coletar mais respostas por mês
                </li>
                <li className="flex items-center">
                  <TrendingUp size={14} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Análises e relatórios avançados
                </li>
                <li className="flex items-center">
                  <Crown size={14} className="mr-2 text-blue-600 dark:text-blue-400" />
                  Marca personalizada
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Trial Info */}
        {limitInfo.isTrialActive && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Período de Teste Ativo
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Você ainda tem {limitInfo.isTrialActive ? 
                `${Math.max(0, Math.floor((new Date(trialInfo.trialEndDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias` : 
                '0 dias'
              } restantes no seu período de teste. 
              Escolha um plano para continuar usando todos os recursos após o teste.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PlanLimitModal;