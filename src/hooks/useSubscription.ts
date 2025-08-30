import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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

        // For now, return null subscription since we're not implementing Stripe in Node.js backend
        setSubscription(null);
      } catch (err) {
        console.warn('Error fetching subscription:', err);
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
    
    setLoading(true);
    try {
      // For now, just set null subscription
      setSubscription(null);
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