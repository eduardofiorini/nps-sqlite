import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getProductByPriceId } from '../stripe-config';

export interface SubscriptionData {
  customerId: string | null;
  subscriptionId: string | null;
  status: string | null;
  priceId: string | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  paymentMethodBrand: string | null;
  paymentMethodLast4: string | null;
  planName: string | null;
  planDescription: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          console.log('Supabase not configured, skipping subscription fetch');
          setSubscription(null);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (fetchError) {
          console.warn('Error fetching subscription:', fetchError);
          // Don't set error for missing data, just set null subscription
          setSubscription(null);
          return;
        }

        if (data) {
          const product = getProductByPriceId(data.price_id);
          
          setSubscription({
            customerId: data.customer_id,
            subscriptionId: data.subscription_id,
            status: data.subscription_status,
            priceId: data.price_id,
            currentPeriodStart: data.current_period_start,
            currentPeriodEnd: data.current_period_end,
            cancelAtPeriodEnd: data.cancel_at_period_end,
            paymentMethodBrand: data.payment_method_brand,
            paymentMethodLast4: data.payment_method_last4,
            planName: product?.name || null,
            planDescription: product?.description || null,
          });
        } else {
          setSubscription(null);
        }
      } catch (err) {
        console.warn('Error in fetchSubscription:', err);
        // In case of network errors or other issues, just set null subscription
        setSubscription(null);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const refreshSubscription = async () => {
    if (!user) return;
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping subscription refresh');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        console.warn('Error refreshing subscription:', fetchError);
        setSubscription(null);
        return;
      }

      if (data) {
        const product = getProductByPriceId(data.price_id);
        
        setSubscription({
          customerId: data.customer_id,
          subscriptionId: data.subscription_id,
          status: data.subscription_status,
          priceId: data.price_id,
          currentPeriodStart: data.current_period_start,
          currentPeriodEnd: data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          paymentMethodBrand: data.payment_method_brand,
          paymentMethodLast4: data.payment_method_last4,
          planName: product?.name || null,
          planDescription: product?.description || null,
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.warn('Error refreshing subscription:', err);
      setSubscription(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    loading,
    error,
    refreshSubscription,
  };
};