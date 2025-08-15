import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { stripeProducts } from '../stripe-config';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Check, ArrowRight, Star, Zap, Building, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

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

  const getProductIcon = (productName: string) => {
    if (productName.includes('Iniciante')) {
      return <Users size={24} className="text-white" />;
    } else if (productName.includes('Profissional')) {
      return <Zap size={24} className="text-white" />;
    } else if (productName.includes('Empresarial')) {
      return <Building size={24} className="text-white" />;
    }
    return <Star size={24} className="text-white" />;
  };

  const isCurrentPlan = (priceId: string) => {
    return subscription?.priceId === priceId && subscription?.status === 'active';
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Escolha o Plano Ideal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Selecione o plano que melhor atende às necessidades da sua empresa para gestão de NPS
          </p>
        </motion.div>

        {/* Current Subscription Banner */}
        {subscription && subscription.status === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <Check size={20} className="text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Plano atual: {subscription.planName}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stripeProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {product.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge variant="primary" className="px-4 py-1 text-sm font-medium">
                    ⭐ Mais Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
                product.popular 
                  ? 'border-2 border-[#00ac75] shadow-lg' 
                  : 'border border-gray-200 dark:border-gray-700'
              }`}>
                <CardHeader>
                  <div className="text-center">
                    <div className={`w-16 h-16 ${product.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      {getProductIcon(product.name)}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {product.name.replace('Meu NPS - ', '')}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        R${product.price.toFixed(0)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/mês</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400">
                      {product.description}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {product.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check size={16} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto">
                    {isCurrentPlan(product.priceId) ? (
                      <Button
                        variant="outline"
                        fullWidth
                        disabled
                        className="h-12 text-base font-medium"
                      >
                        Plano Atual
                      </Button>
                    ) : (
                      <Button
                        variant={product.popular ? "primary" : "outline"}
                        fullWidth
                        onClick={() => handleSubscribe(product.priceId)}
                        isLoading={loadingPriceId === product.priceId}
                        className="h-12 text-base font-medium"
                        icon={<ArrowRight size={18} />}
                      >
                        {subscription?.status === 'active' ? 'Alterar Plano' : 'Assinar Agora'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Perguntas Frequentes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Posso alterar meu plano a qualquer momento?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                As alterações são aplicadas imediatamente e o valor é ajustado proporcionalmente.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Como funciona o período de teste?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todos os planos incluem 7 dias de teste gratuito. Você pode cancelar a qualquer 
                momento durante o período de teste sem cobrança.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quais métodos de pagamento são aceitos?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aceitamos cartões de crédito e débito das principais bandeiras (Visa, Mastercard, 
                American Express) através do Stripe, garantindo segurança total.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Posso cancelar minha assinatura?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sim, você pode cancelar sua assinatura a qualquer momento. O acesso continuará 
                até o final do período pago atual.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Precisa de um plano personalizado?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Para empresas com necessidades específicas, oferecemos soluções personalizadas 
              com recursos exclusivos e suporte dedicado.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="text-[#00ac75] border-[#00ac75] hover:bg-[#00ac75] hover:text-white"
            >
              Falar com Vendas
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;