import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';

interface SubscriptionContextProps {
  isTrialExpired: boolean;
  daysLeftInTrial: number | null;
  isSubscriptionActive: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextProps>({
  isTrialExpired: false,
  daysLeftInTrial: null,
  isSubscriptionActive: false,
});

export const useSubscriptionContext = () => useContext(SubscriptionContext);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { subscription, trialExpired, isActive, isTrialing, loading: subLoading } = useSubscription();
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only check subscription if user is authenticated and not loading
    if (authLoading || !isAuthenticated) return;
    
    console.log("Checking subscription status:", { subLoading, subscription, trialExpired, isTrialing });

    // If subscription data is loaded
    if (!subLoading && subscription) {
      // Check if trial has expired
      if (trialExpired) {
        console.log("Trial has expired");
        setIsTrialExpired(true);
        setDaysLeftInTrial(0);
        
        // Redirect to trial expired page if not already there
        if (window.location.pathname !== '/trial-expired' && 
            window.location.pathname !== '/billing' &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          navigate('/trial-expired');
        }
      } else if (isTrialing && subscription.current_period_end) {
        // Calculate days left in trial
        const trialEndDate = new Date(subscription.current_period_end * 1000);
        const today = new Date();
        const diffTime = trialEndDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log("Trial days remaining:", diffDays, "Trial end date:", trialEndDate.toISOString());
        
        setDaysLeftInTrial(diffDays > 0 ? diffDays : 0);
        setIsTrialExpired(diffDays <= 0);
        
        // If trial has just expired, redirect to trial expired page
        if (diffDays <= 0 && 
            window.location.pathname !== '/trial-expired' && 
            window.location.pathname !== '/billing' &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          navigate('/trial-expired');
        }
      } else {
        setIsTrialExpired(false);
        setDaysLeftInTrial(null);
        console.log("No trial or active subscription");
      }
    } else if (!subLoading && isAuthenticated) {
      // If no subscription data but loading is complete, set default trial values for demo
      console.log("No subscription data found, setting demo trial values");
      setDaysLeftInTrial(7);
      setIsTrialExpired(false);
    }
  }, [isAuthenticated, authLoading, subLoading, subscription, trialExpired, isTrialing, navigate]);

  return (
    <SubscriptionContext.Provider
      value={{
        isTrialExpired,
        daysLeftInTrial,
        isSubscriptionActive: isActive,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};