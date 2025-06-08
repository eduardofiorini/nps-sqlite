import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  CreditCard, 
  Calendar, 
  Crown, 
  Check,
  Star,
  Zap,
  Users,
  BarChart3,
  Download,
  AlertTriangle,
  ArrowRight,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getSubscription, saveSubscription } from '../utils/localStorage';
import type { Subscription, Plan } from '../types';

const Billing: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Iniciante',
      price: 29,
      period: 'month',
      description: 'Perfeito para pequenas equipes começando com NPS',
      icon: 'Users',
      color: 'from-green-400 to-green-600',
      limits: {
        responses: 500,
        campaigns: 2,
        users: 3
      },
      features: [
        'Até 500 respostas/mês',
        '2 campanhas ativas',
        'Análises básicas',
        'Suporte por email',
        'Templates padrão'
      ]
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 79,
      period: 'month',
      description: 'Recursos avançados para empresas em crescimento',
      icon: 'BarChart3',
      color: 'from-[#073143] to-[#0a4a5c]',
      popular: true,
      limits: {
        responses: 2500,
        campaigns: 'unlimited',
        users: 10
      },
      features: [
        'Até 2.500 respostas/mês',
        'Campanhas ilimitadas',
        'Análises e relatórios avançados',
        'Suporte prioritário',
        'Marca personalizada',
        'Acesso à API',
        'Colaboração em equipe'
      ]
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 199,
      period: 'month',
      description: 'Solução completa para grandes organizações',
      icon: 'Zap',
      color: 'from-purple-400 to-purple-600',
      limits: {
        responses: 'unlimited',
        campaigns: 'unlimited',
        users: 'unlimited'
      },
      features: [
        'Respostas ilimitadas',
        'Campanhas ilimitadas',
        'Insights avançados com IA',
        'Gerente de conta dedicado',
        'Solução white-label',
        'Integração SSO',
        'Integrações personalizadas',
        'Garantia de SLA'
      ]
    }
  ];

  const currentPlan = plans.find(p => p.id === subscription?.planId) || plans[1];

  const billingHistory = [
    {
      id: '1',
      date: '2025-01-15',
      amount: 79,
      status: 'paid',
      description: 'Plano Profissional - Janeiro 2025',
      invoice: 'INV-2025-001'
    },
    {
      id: '2',
      date: '2024-12-15',
      amount: 79,
      status: 'paid',
      description: 'Plano Profissional - Dezembro 2024',
      invoice: 'INV-2024-012'
    },
    {
      id: '3',
      date: '2024-11-15',
      amount: 79,
      status: 'paid',
      description: 'Plano Profissional - Novembro 2024',
      invoice: 'INV-2024-011'
    }
  ];

  const usageStats = {
    responses: { used: 1247, limit: 2500 },
    campaigns: { used: 8, limit: 'unlimited' },
    users: { used: 3, limit: 10 }
  };

  useEffect(() => {
    const sub = getSubscription();
    setSubscription(sub);
    setIsLoading(false);
  }, []);

  const handlePlanChange = (planId: string) => {
    if (!subscription) return;
    
    const updatedSubscription = {
      ...subscription,
      planId,
      updatedAt: new Date().toISOString()
    };
    
    saveSubscription(updatedSubscription);
    setSubscription(updatedSubscription);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users size={24} />;
      case 'BarChart3':
        return <BarChart3 size={24} />;
      case 'Zap':
        return <Zap size={24} />;
      default:
        return <BarChart3 size={24} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativo</Badge>;
      case 'canceled':
        return <Badge variant="danger">Cancelado</Badge>;
      case 'past_due':
        return <Badge variant="warning">Em Atraso</Badge>;
      case 'trialing':
        return <Badge variant="info">Teste Gratuito</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUsagePercentage = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assinatura e Cobrança</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seu plano, cobrança e histórico de pagamentos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan & Usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Plano Atual" />
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${currentPlan.color} flex items-center justify-center text-white mr-4`}>
                    {getIconComponent(currentPlan.icon)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentPlan.name}</h3>
                    <div className="text-2xl font-bold text-[#073143] dark:text-white">
                      R${currentPlan.price}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/{currentPlan.period === 'month' ? 'mês' : 'ano'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(subscription?.status || 'active')}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Próxima cobrança: {subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentPlan.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check size={14} className="text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex space-x-3">
                <Button variant="primary" icon={<CreditCard size={16} />}>
                  Atualizar Método de Pagamento
                </Button>
                <Button variant="outline">
                  Alterar Plano
                </Button>
                <Button variant="outline">
                  Cancelar Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Uso do Plano" />
            <CardContent>
              <div className="space-y-6">
                {/* Responses */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Respostas este mês</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {usageStats.responses.used.toLocaleString()} / {usageStats.responses.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-[#073143] h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${getUsagePercentage(usageStats.responses.used, usageStats.responses.limit)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(getUsagePercentage(usageStats.responses.used, usageStats.responses.limit))}% utilizado
                  </p>
                </div>

                {/* Campaigns */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Campanhas ativas</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {usageStats.campaigns.used} / {usageStats.campaigns.limit === 'unlimited' ? '∞' : usageStats.campaigns.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: usageStats.campaigns.limit === 'unlimited' ? '100%' : `${getUsagePercentage(usageStats.campaigns.used, usageStats.campaigns.limit as number)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {usageStats.campaigns.limit === 'unlimited' ? 'Ilimitado' : `${Math.round(getUsagePercentage(usageStats.campaigns.used, usageStats.campaigns.limit as number))}% utilizado`}
                  </p>
                </div>

                {/* Users */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuários da equipe</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {usageStats.users.used} / {usageStats.users.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${getUsagePercentage(usageStats.users.used, usageStats.users.limit as number)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(getUsagePercentage(usageStats.users.used, usageStats.users.limit as number))}% utilizado
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <Calendar size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Seu plano renova em {subscription ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} dias
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader 
              title="Histórico de Cobrança"
              action={
                <Button variant="outline" size="sm" icon={<Download size={16} />}>
                  Exportar
                </Button>
              }
            />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {billingHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          R${item.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={item.status === 'paid' ? 'success' : 'warning'}>
                            {item.status === 'paid' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                            Baixar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Método de Pagamento" />
            <CardContent>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CreditCard size={24} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    •••• •••• •••• 4242
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Visa • Expira 12/2027
                  </p>
                </div>
              </div>
              <Button variant="outline" fullWidth className="mt-4">
                Atualizar Cartão
              </Button>
            </CardContent>
          </Card>

          {/* Next Billing */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Próxima Cobrança" />
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  R${currentPlan.price}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Plano {currentPlan.name}:</span>
                    <span className="text-gray-900 dark:text-white">R${currentPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Impostos:</span>
                    <span className="text-gray-900 dark:text-white">R$0</span>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">R${currentPlan.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start">
                <Shield size={20} className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Precisa de Ajuda?
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Nossa equipe está aqui para ajudar com questões de cobrança.
                  </p>
                  <Button variant="outline" size="sm" fullWidth>
                    Contatar Suporte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Plans */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title="Planos Disponíveis" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  plan.id === subscription?.planId
                    ? 'border-[#073143] bg-[#073143]/5 dark:bg-[#073143]/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-[#073143]/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="primary">
                      <Star size={12} className="mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                {plan.id === subscription?.planId && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="success">
                      <Crown size={12} className="mr-1" />
                      Atual
                    </Badge>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                  {getIconComponent(plan.icon)}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">R${plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/{plan.period === 'month' ? 'mês' : 'ano'}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check size={14} className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.id === subscription?.planId ? "outline" : "primary"}
                  fullWidth
                  disabled={plan.id === subscription?.planId}
                  onClick={() => plan.id !== subscription?.planId && handlePlanChange(plan.id)}
                  icon={plan.id !== subscription?.planId ? <ArrowRight size={16} /> : undefined}
                >
                  {plan.id === subscription?.planId ? 'Plano Atual' : 'Selecionar Plano'}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;