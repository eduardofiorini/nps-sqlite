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
      // In a real implementation, you would call Stripe API to cancel the subscription
      // For now, we'll simulate the cancellation
      console.log('Cancelling subscription:', subscription.subscriptionId);
      console.log('Reason:', cancelReason);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 mr-4 flex items-center justify-center">
              <img 
                src="/icone.png" 
                alt="Meu NPS" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-[#00ac75] dark:text-white">Meu NPS</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">Plataforma de Gestão de NPS</span>
            </div>
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Planos e Preços
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Escolha o plano perfeito para transformar o feedback dos seus clientes em crescimento real para o seu negócio
          </p>
          
          {/* Free Trial Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-lg font-semibold mt-8 shadow-lg"
          >
            <Crown size={24} className="mr-3" />
            🎉 7 dias grátis em todos os planos - Sem cartão de crédito
          </motion.div>
        </motion.div>

        {/* Current Subscription Info */}
        {subscription && subscription.status === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
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
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
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
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
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
                  <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ MAIS POPULAR
                  </div>
                </div>
              )}
              
              <Card className={`h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                product.popular 
                  ? 'border-2 border-gradient-to-r from-orange-400 to-pink-500 shadow-xl scale-105' 
                  : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
              } ${isCurrentPlan(product.priceId) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                
                {isCurrentPlan(product.priceId) && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="success" className="text-xs font-bold">
                      PLANO ATUAL
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={`w-20 h-20 ${product.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    {getProductIcon(product.name)}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3"> 
                    {product.name.replace('Meu NPS - ', '')}
                  </h3>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        R${product.price.toFixed(0)}
                      </span>
                      <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">/mês</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Cobrado mensalmente
                    </p>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {product.description}
                  </p>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col px-6 pb-8">
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                      Recursos Inclusos:
                    </h4>
                    <ul className="space-y-3">
                      {product.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <Check size={12} className="text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-auto">
                    {isCurrentPlan(product.priceId) ? (
                      <Button
                        variant="outline"
                        fullWidth
                        disabled
                        className="h-14 text-base font-semibold border-2"
                      >
                        <Crown size={18} className="mr-2" />
                        Seu Plano Atual
                      </Button>
                    ) : (
                      <Button
                        variant={product.popular ? "primary" : "outline"}
                        fullWidth
                        onClick={() => handleSubscribe(product.priceId)}
                        isLoading={loadingPriceId === product.priceId}
                        className={`h-14 text-base font-semibold transition-all duration-300 ${
                          product.popular 
                            ? 'bg-gradient-to-r from-[#00ac75] to-[#009966] hover:from-[#009966] hover:to-[#008855] shadow-lg hover:shadow-xl' 
                            : 'border-2 hover:border-[#00ac75] hover:text-[#00ac75]'
                        }`}
                        icon={<ArrowRight size={18} />}
                      >
                        {subscription?.status === 'active' ? 'Alterar para Este Plano' : 'Começar Teste Grátis'}
                      </Button>
                    )}
                    
                    {!isCurrentPlan(product.priceId) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                        7 dias grátis • Cancele a qualquer momento
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Compare Todos os Recursos
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Veja em detalhes o que cada plano oferece
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-6 text-gray-900 dark:text-white font-semibold">
                        Recursos
                      </th>
                      {stripeProducts.map(product => (
                        <th key={product.id} className="text-center py-4 px-6">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {product.name.replace('Meu NPS - ', '')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            R${product.price}/mês
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Respostas por mês
                      </td>
                      <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">500</td>
                      <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">2.500</td>
                      <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-semibold">Ilimitadas</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Campanhas ativas
                      </td>
                      <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">2</td>
                      <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-semibold">Ilimitadas</td>
                      <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-semibold">Ilimitadas</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Relatórios avançados
                      </td>
                      <td className="py-4 px-6 text-center">
                        <X size={20} className="text-gray-400 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check size={20} className="text-green-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check size={20} className="text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Marca personalizada
                      </td>
                      <td className="py-4 px-6 text-center">
                        <X size={20} className="text-gray-400 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check size={20} className="text-green-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check size={20} className="text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Acesso à API
                      </td>
                      <td className="py-4 px-6 text-center">
                        <X size={20} className="text-gray-400 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check size={20} className="text-green-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check size={20} className="text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        Suporte
                      </td>
                      <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">Email</td>
                      <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">Prioritário</td>
                      <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-semibold">Dedicado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-4 gap-6 mb-16"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Segurança Total</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dados protegidos com criptografia de ponta a ponta
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Suporte 24/7</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Equipe especializada sempre disponível
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe size={32} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Multi-idioma</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Português, Inglês e Espanhol
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone size={32} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Mobile First</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Otimizado para todos os dispositivos
            </p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tire suas dúvidas sobre nossos planos e funcionalidades
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🔄 Posso alterar meu plano a qualquer momento?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As alterações são aplicadas imediatamente e o valor é ajustado proporcionalmente.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🆓 Como funciona o período de teste?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Todos os planos incluem 7 dias de teste gratuito com acesso completo. 
                  Você pode cancelar a qualquer momento durante o período de teste sem cobrança.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  💳 Quais métodos de pagamento são aceitos?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aceitamos cartões de crédito e débito das principais bandeiras (Visa, Mastercard, 
                  American Express) através do Stripe, garantindo segurança total nas transações.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  ❌ Posso cancelar minha assinatura?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Sim, você pode cancelar sua assinatura a qualquer momento sem multas. 
                  O acesso continuará até o final do período pago atual.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 border-0">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Precisa de um plano personalizado?
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Para empresas com necessidades específicas, oferecemos soluções personalizadas 
                  com recursos exclusivos, integrações customizadas e suporte dedicado.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white text-gray-900 border-white hover:bg-gray-100 h-14 px-8"
                    icon={<Headphones size={20} />}
                  >
                    Falar com Vendas
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-white border-white hover:bg-white hover:text-gray-900 h-14 px-8"
                    icon={<BarChart3 size={20} />}
                  >
                    Agendar Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo do cancelamento (opcional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Nos ajude a melhorar contando o motivo do cancelamento..."
            />
          </div>

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