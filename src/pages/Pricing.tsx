import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { stripeProducts } from '../stripe-config';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { 
  Check, 
  ArrowRight, 
  Star, 
  Zap, 
  Building, 
  Users, 
  Crown,
  Shield,
  Headphones,
  Globe,
  Smartphone,
  BarChart3,
  X,
  AlertTriangle,
  CreditCard,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const { themeColor } = useConfig();
  const { subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const isSupabaseConfigured = () => {
    return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      alert('Funcionalidade de assinatura não disponível no modo demo. Configure o Supabase para habilitar pagamentos.');
      return;
    }

    setLoadingPriceId(priceId);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (!token) {
        alert('Sessão expirada. Faça login novamente para continuar.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          mode: 'subscription',
          success_url: `${window.location.origin}/subscription-success`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPriceId(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.subscriptionId) return;

    setIsCancelling(true);

    try {
      if (isSupabaseConfigured()) {
        // Call Stripe API to cancel subscription
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;

        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscription_id: subscription.subscriptionId,
            reason: cancelReason
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to cancel subscription');
        }
      } else {
        // Demo mode - simulate cancellation
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Refresh subscription data
      await refreshSubscription();

      setShowCancelModal(false);
      setCancelReason('');
      
      // Show success message
      alert('Assinatura cancelada com sucesso. Você continuará tendo acesso até o final do período atual.');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Erro ao cancelar assinatura. Tente novamente.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getProductIcon = (productName: string) => {
    if (productName.includes('Iniciante')) {
      return <Users size={32} className="text-white" />;
    } else if (productName.includes('Profissional')) {
      return <Zap size={32} className="text-white" />;
    } else if (productName.includes('Empresarial')) {
      return <Building size={32} className="text-white" />;
    }
    return <Star size={32} className="text-white" />;
  };

  const isCurrentPlan = (priceId: string) => {
    return subscription?.priceId === priceId && subscription?.status === 'active';
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Planos e Preços
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Escolha o plano ideal para sua empresa
          </p>
          
          <div className="inline-flex items-center px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            <Crown size={16} className="mr-2" />
            7 dias grátis • Sem cartão de crédito
          </div>
        </motion.div>

        {/* Current Subscription Info */}
        {subscription && subscription.status === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                      <Crown size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        Assinatura Atual: {subscription.planName}
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300 text-sm flex items-center">
                        <Calendar size={14} className="mr-1" />
                        Próxima cobrança: {formatDate(subscription.currentPeriodEnd)}
                        {subscription.cancelAtPeriodEnd && (
                          <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                            (Cancelamento agendado)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelModal(true)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cancelar Assinatura
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {stripeProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="relative"
            >
              {product.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-[#00ac75] text-white px-4 py-1 rounded-full text-xs font-medium">
                    Mais Popular
                  </div>
                </div>
              )}
              
              <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
                product.popular 
                  ? 'border-2 border-[#00ac75] shadow-md' 
                  : 'border border-gray-200 dark:border-gray-700'
              } ${isCurrentPlan(product.priceId) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                
                {isCurrentPlan(product.priceId) && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="success" className="text-xs">
                      PLANO ATUAL
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${product.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    {getProductIcon(product.name)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2"> 
                    {product.name.replace('Meu NPS - ', '')}
                  </h3>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        R${product.price.toFixed(0)}
                      </span>
                      <span className="text-lg text-gray-600 dark:text-gray-400 ml-1">/mês</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                    {product.description}
                  </p>
                  
                  <ul className="space-y-2 mb-8 text-left">
                    {product.features.slice(0, 4).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {product.features.length > 4 && (
                      <li className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
                        +{product.features.length - 4} recursos adicionais
                      </li>
                    )}
                  </ul>
                  
                  <div>
                    {isCurrentPlan(product.priceId) ? (
                      <Button
                        variant="outline"
                        fullWidth
                        disabled
                        className="h-12 text-sm font-medium"
                      >
                        <Crown size={16} className="mr-2" />
                        Seu Plano Atual
                      </Button>
                    ) : (
                      <Button
                        variant={product.popular ? "primary" : "outline"}
                        fullWidth
                        onClick={() => handleSubscribe(product.priceId)}
                        isLoading={loadingPriceId === product.priceId}
                        className={`h-12 text-sm font-medium ${
                          product.popular 
                            ? '' 
                            : 'hover:border-[#00ac75] hover:text-[#00ac75]'
                        }`}
                        icon={<ArrowRight size={16} />}
                      >
                        {subscription?.status === 'active' ? 'Alterar Plano' : 'Iniciar Teste'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Show Comparison Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
            icon={showComparison ? <X size={16} /> : <BarChart3 size={16} />}
          >
            {showComparison ? 'Ocultar Comparação' : 'Comparar Recursos'}
          </Button>
        </motion.div>

        {/* Features Comparison - Collapsible */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Comparação de Recursos
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-medium">
                          Recursos
                        </th>
                        {stripeProducts.map(product => (
                          <th key={product.id} className="text-center py-3 px-4">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {product.name.replace('Meu NPS - ', '')}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                          Respostas/mês
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 text-sm">500</td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 text-sm">2.500</td>
                        <td className="py-3 px-4 text-center text-green-600 dark:text-green-400 font-medium text-sm">Ilimitadas</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                          Campanhas
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 text-sm">2</td>
                        <td className="py-3 px-4 text-center text-green-600 dark:text-green-400 font-medium text-sm">Ilimitadas</td>
                        <td className="py-3 px-4 text-center text-green-600 dark:text-green-400 font-medium text-sm">Ilimitadas</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                          Relatórios avançados
                        </td>
                        <td className="py-3 px-4 text-center">
                          <X size={16} className="text-gray-400 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check size={16} className="text-green-500 mx-auto" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Check size={16} className="text-green-500 mx-auto" />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                          Suporte
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 text-sm">Email</td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 text-sm">Prioritário</td>
                        <td className="py-3 px-4 text-center text-green-600 dark:text-green-400 font-medium text-sm">Dedicado</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Simple FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Posso alterar meu plano?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Sim, você pode alterar seu plano a qualquer momento.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Como funciona o teste gratuito?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  7 dias grátis com acesso completo. Cancele quando quiser.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Simple Contact */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Dúvidas? Entre em contato: <a href="mailto:contato@meunps.com" className="text-[#00ac75] hover:underline">contato@meunps.com</a>
          </p>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Assinatura"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              Manter Assinatura
            </Button>
            <Button 
              variant="danger" 
              onClick={handleCancelSubscription}
              isLoading={isCancelling}
              icon={<X size={16} />}
            >
              Confirmar Cancelamento
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Tem certeza que deseja cancelar?
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Você perderá acesso a todos os recursos premium, mas seus dados serão mantidos.
              </p>
            </div>
          </div>

          {subscription && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Detalhes da sua assinatura:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plano atual:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{subscription.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Acesso até:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                {subscription.paymentMethodLast4 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cartão:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {subscription.paymentMethodBrand?.toUpperCase()} •••• {subscription.paymentMethodLast4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              O que acontece após o cancelamento:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Você manterá acesso até {formatDate(subscription?.currentPeriodEnd)}</li>
              <li>• Seus dados e campanhas serão preservados</li>
              <li>• Você pode reativar a qualquer momento</li>
              <li>• Não haverá cobrança no próximo ciclo</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Pricing;