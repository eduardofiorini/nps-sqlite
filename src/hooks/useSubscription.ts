import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getProductByPriceId, STRIPE_PRODUCTS } from '../stripe-config'

interface Subscription {
  subscription_status: string
  price_id: string | null
  current_period_end: number | null
  cancel_at_period_end: boolean
  payment_method_brand: string | null
  payment_method_last4: string | null
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [trialExpired, setTrialExpired] = useState<boolean>(false)
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()

      if (error) {
        throw error
      }
      
      // Check if trial has expired
      if (data) {
        // If subscription status is 'trialing' and current_period_end is in the past
        if (data.subscription_status === 'trialing' && data.current_period_end) {
          // Check if trial has expired
          if (new Date(data.current_period_end * 1000) < new Date()) {
            setTrialExpired(true);
          } else {
            setTrialExpired(false);
          }
        }
      }

      // Also fetch order history
      try {
        const { data: orderData } = await supabase
          .from('stripe_user_orders')
          .select('*')
          .order('order_date', { ascending: false });
        setOrders(orderData || []);
      } catch (orderError) {
        console.error('Error fetching order history:', orderError);
      }

      setSubscription(data)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionPlan = () => {
    if (!subscription?.price_id) return null
    
    const plan = getProductByPriceId(subscription.price_id)
    
    // If no plan found by price ID, return the first product as fallback
    if (!plan && STRIPE_PRODUCTS.length > 0) {
      return STRIPE_PRODUCTS[0]
    }
    
    return plan
  }

  const isActive = subscription?.subscription_status === 'active'
  const isPastDue = subscription?.subscription_status === 'past_due'
  const isCanceled = subscription?.subscription_status === 'canceled'
  const isTrialing = subscription?.subscription_status === 'trialing'

  return {
    subscription,
    loading,
    error,
    orders,
    trialExpired,
    refetch: fetchSubscription,
    isTrialing,
    plan: getSubscriptionPlan(),
    isActive,
    isPastDue,
    isCanceled
  }
}