import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';
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
  Shield,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSubscription } from '../hooks/useSubscription';
import { STRIPE_PRODUCTS, formatPrice } from '../stripe-config';
import type { Plan } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const Billing: React.FC = () => {
  const { 
    subscription, 
    loading, 
    error, 
    orders, 
    isActive, 
    isPastDue, 
    isCanceled,
    isTrialing,
    plan,
    daysLeftInTrial,
    refetch 
  } = useSubscription();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  
  // Usage stats (would be fetched from API in a real app)
  const [usageStats, setUsageStats] = useState({
    responses: { used: 0, limit: 500 },
    campaigns: { used: 0, limit: 2 },
    users: { used: 1, limit: 1 }
  });
  
  useEffect(() => {
    // Check for success/demo parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const demo = urlParams.get('demo');
    
    if (success === 'true') {
      if (demo === 'true') {
        // Demo mode - simulate successful subscription
        console.log('Demo checkout success detected');
        // You could show a success message or update the UI here
      } else {
        // Real Stripe success - refresh subscription data
        console.log('Real Stripe checkout success detected');
        setTimeout(() => {
          refetch();
        }, 2000); // Give Stripe webhook time to process
      }
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Fetch usage stats
    const fetchUsageStats = async () => {
      try {
        // Get responses count
        const { count: responsesCount } = await supabase
          .from('nps_responses')
          .select('*', { count: 'exact', head: true });
        
        // Get campaigns count
        const { count: campaignsCount } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true });
        
        // Get team members count
        const { count: usersCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });
        
        // Update usage stats
        setUsageStats({
          responses: { 
            used: responsesCount || 0, 
            limit: plan?.id === 'starter' ? 500 : 
                  plan?.id === 'pro' ? 2500 : 'unlimited'
          },
          campaigns: { 
            used: campaignsCount || 0, 
            limit: plan?.id === 'starter' ? 2 : 'unlimited'
          },
          users: { 
            used: usersCount || 1, 
            limit: plan?.id === 'starter' ? 1 : 
                  plan?.id === 'pro' ? 5 : 'unlimited'
          }
        });
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      }
    };
    
    if (plan) {
      fetchUsageStats();
    }
  }, [plan]);

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    
    
    try {
      // Check if Supabase is configured - if not, simulate demo checkout
      if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, simulating checkout in demo mode');
        
        // Create a mock checkout URL that opens in a new tab
        // Simulate successful checkout by redirecting to success page
        setTimeout(() => {
          window.location.href = `${window.location.origin}/billing?success=true&demo=true`;
        }, 1000);
        setCheckoutLoading(false);
        return;
      }
      
      // Get the Supabase URL from environment variable
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL environment variable is not set');
      }
      
      // Get the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            price_id: priceId,
            success_url: `${window.location.origin}/billing?success=true`,
            cancel_url: `${window.location.origin}/billing?canceled=true`,
            mode: 'subscription'
          })
        });
      
        if (!response.ok) {
          let errorMessage = `Server error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If we can't parse JSON, use the status text
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned from server');
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        
        // If we can't reach the Edge Function, fall back to demo mode
        console.log('Edge Function unreachable, falling back to demo mode');
        setTimeout(() => {
          window.location.href = `${window.location.origin}/billing?success=true&demo=true`;
        }, 1000);
        return;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Failed to create checkout session');
      
      // If there's an error, we can still fall back to demo mode
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log('Network error, falling back to demo mode');
        setTimeout(() => {
          window.location.href = `${window.location.origin}/billing?success=true&demo=true`;
        }, 1000);
      }
    } finally {
      setCheckoutLoading(false);
    }
  };
  
  const getUsagePercentage = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
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
            Gerencie seu plano e visualize o histórico de pagamentos
          </p>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-lg border border-red-200 dark:border-red-800">
            Erro ao carregar dados: {error}
          </div>
        )}
      </div>

      {/* Current Plan */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title="Plano Atual" />
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              {isTrialing ? (
                <>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                      <Clock size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        Período de Teste
                        <Badge variant="info" className="ml-3">
                          {daysLeftInTrial} dias restantes
                        </Badge>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Seu período de teste termina em {new Date((subscription?.current_period_end || 0) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </>
              ) : isActive ? (
                <>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                      <Crown size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        {plan?.name || 'Plano Profissional'}
                        <Badge variant="success" className="ml-3">Ativo</Badge>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Próxima cobrança em {new Date((subscription?.current_period_end || 0) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </>
              ) : isPastDue ? (
                <>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-4">
                      <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        {plan?.name || 'Plano Profissional'}
                        <Badge variant="warning" className="ml-3">Pagamento Pendente</Badge>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Por favor, atualize seu método de pagamento
                      </p>
                    </div>
                  </div>
                </>
              ) : isCanceled ? (
                <>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4">
                      <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        {plan?.name || 'Plano Profissional'}
                        <Badge variant="danger" className="ml-3">Cancelado</Badge>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Sua assinatura foi cancelada
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                      <CreditCard size={24} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Sem assinatura ativa
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Escolha um plano abaixo para começar
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {subscription?.payment_method_brand && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center">
                  <CreditCard size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
                  </span>
                </div>
              )}
              
              {isActive && !subscription?.cancel_at_period_end && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Handle cancel subscription
                  }}
                >
                  Cancelar Assinatura
                </Button>
              )}
              
              {isActive && subscription?.cancel_at_period_end && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Handle reactivate subscription
                  }}
                >
                  Reativar Assinatura
                </Button>
              )}
              
              {(isPastDue || isCanceled || !isActive) && !isTrialing && (
                <Button
                  variant="primary"
                  onClick={() => {
                    // Handle update payment method
                  }}
                >
                  Atualizar Pagamento
                </Button>
              )}
            </div>
          </div>
          
          {/* Usage Stats */}
          {(isActive || isTrialing) && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Uso do Plano</h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Respostas NPS
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usageStats.responses.used} / {usageStats.responses.limit === 'unlimited' ? 'Ilimitado' : usageStats.responses.limit}
                    </span>
                  </div>
                  {usageStats.responses.limit !== 'unlimited' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${getUsagePercentage(usageStats.responses.used, usageStats.responses.limit as number)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Campanhas Ativas
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usageStats.campaigns.used} / {usageStats.campaigns.limit === 'unlimited' ? 'Ilimitado' : usageStats.campaigns.limit}
                    </span>
                  </div>
                  {usageStats.campaigns.limit !== 'unlimited' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${getUsagePercentage(usageStats.campaigns.used, usageStats.campaigns.limit as number)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Membros da Equipe
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usageStats.users.used} / {usageStats.users.limit === 'unlimited' ? 'Ilimitado' : usageStats.users.limit}
                    </span>
                  </div>
                  {usageStats.users.limit !== 'unlimited' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${getUsagePercentage(usageStats.users.used, usageStats.users.limit as number)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title="Histórico de Pagamentos" />
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        Assinatura Meu NPS
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatPrice(order.amount_total, order.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={
                            order.payment_status === 'paid' ? 'success' : 
                            order.payment_status === 'pending' ? 'warning' : 'danger'
                          }
                        >
                          {order.payment_status === 'paid' ? 'Pago' : 
                           order.payment_status === 'pending' ? 'Pendente' : 'Falhou'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4 w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <CreditCard size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhum pagamento ainda</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seu histórico de pagamentos aparecerá aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title="Planos Disponíveis" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {STRIPE_PRODUCTS.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-700 rounded-lg border-2 p-6 transition-all duration-300 ${
                  plan?.priceId === product.priceId
                    ? 'border-[#073143] shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-[#073143] dark:hover:border-[#073143]'
                }`}
              >
                {product.id === 'prod_Pro' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#073143] to-[#0a4a5c] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star size={14} className="mr-1" />
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h3>
                
                <div className="text-2xl font-bold text-[#073143] dark:text-white mb-4">
                  {formatPrice(product.price, product.currency)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mês</span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {product.description}
                </p>
                
                <ul className="space-y-3 mb-6">
                  {product.features?.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan?.priceId === product.priceId ? "outline" : "primary"}
                  fullWidth 
                  onClick={() => handleCheckout(product.priceId)}
                  isLoading={checkoutLoading && product.priceId === STRIPE_PRODUCTS.find(p => p.id === 'prod_Pro')?.priceId}
                  disabled={(plan?.priceId === product.priceId) || (checkoutLoading && product.priceId === STRIPE_PRODUCTS.find(p => p.id === 'prod_Pro')?.priceId)}
                >
                  {plan?.priceId === product.priceId ? 'Plano Atual' : 'Selecionar Plano'}
                </Button>
              </motion.div>
            ))}
          </div>
          
          {checkoutError && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              <div className="flex items-start">
                <AlertTriangle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Erro ao processar pagamento</h4>
                  <p className="mt-1 text-sm">{checkoutError}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Security & Compliance */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title="Segurança e Conformidade" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                <Shield size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Dados Protegidos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Seus dados são criptografados e armazenados com segurança.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                <CreditCard size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Pagamentos Seguros</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Processamento de pagamentos seguro via Stripe.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                <Zap size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Atualizações Automáticas</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receba novas funcionalidades automaticamente.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;