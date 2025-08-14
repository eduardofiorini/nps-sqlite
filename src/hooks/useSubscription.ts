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
  const [daysLeftInTrial, setDaysLeftInTrial] = useState<number | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        console.log('No active session, skipping subscription fetch')
        setLoading(false)
        return
      }

      // Get subscription data
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .maybeSingle()

      if (error) {
        console.error('Error fetching subscription:', error)
        throw error
      }
      
      // Check if trial has expired
      if (data) {
        console.log('Subscription data:', data)
        
        // If subscription status is 'trialing' and current_period_end is in the past
        if (data.subscription_status === 'trialing' && data.current_period_end) {
          // Check if trial has expired
          if (new Date(data.current_period_end * 1000) < new Date()) {
            setTrialExpired(true)
          } else {
            setTrialExpired(false)
            
            // Calculate days left in trial
            const trialEndDate = new Date(data.current_period_end * 1000)
            const today = new Date()
            const diffTime = trialEndDate.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            setDaysLeftInTrial(diffDays > 0 ? diffDays : 0)
          }
        } else if (data.subscription_status === 'trialing') {
          // If we don't have an end date but status is trialing, set a default
          setDaysLeftInTrial(7)
          setTrialExpired(false)
        }
      } else {
        // If no subscription data, set default trial values for demo
        setDaysLeftInTrial(7)
        setTrialExpired(false)
      }

      // Also fetch order history
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('user_orders')
          .select('*')
          .order('order_date', { ascending: false })
          
        if (orderError) throw orderError
        setOrders(orderData || [])
      } catch (orderError) {
        console.error('Error fetching order history:', orderError)
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
    daysLeftInTrial,
    refetch: fetchSubscription,
    isTrialing,
    plan: getSubscriptionPlan(),
    isActive,
    isPastDue,
    isCanceled
  }
}