import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from './useSubscription';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface TrialInfo {
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
}

export const useTrial = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({
    isTrialActive: false,
    isTrialExpired: false,
    daysRemaining: 0,
    hoursRemaining: 0,
    minutesRemaining: 0,
    trialStartDate: null,
    trialEndDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTrialInfo({
        isTrialActive: false,
        isTrialExpired: false,
        daysRemaining: 0,
        hoursRemaining: 0,
        minutesRemaining: 0,
        trialStartDate: null,
        trialEndDate: null,
      });
      setLoading(false);
      return;
    }

    const calculateTrialInfo = async () => {
      try {
        // If user has active subscription, no trial restrictions
        if (subscription?.status === 'active') {
          setTrialInfo({
            isTrialActive: false,
            isTrialExpired: false,
            daysRemaining: 0,
            hoursRemaining: 0,
            minutesRemaining: 0,
            trialStartDate: null,
            trialEndDate: null,
          });
          setLoading(false);
          return;
        }

        let trialStartDate: Date;
        const trialStorageKey = `trial_start_date_${user.id}`;
        
        // For testing with specific user ID, force expired trial
        if (user.id === '39d95758-9a20-489a-9db5-ebd8eec5df36') {
          console.log('🧪 Testing mode: Forcing expired trial for user', user.id);
          
          // Check if we already have a stored expired trial date
          const storedExpiredTrial = localStorage.getItem(`${trialStorageKey}_expired`);
          if (storedExpiredTrial) {
            trialStartDate = new Date(storedExpiredTrial);
            console.log('📅 Using stored expired trial date:', trialStartDate);
          } else {
            // Set trial to 8 days ago and store it permanently
            trialStartDate = new Date();
            trialStartDate.setDate(trialStartDate.getDate() - 8);
            localStorage.setItem(`${trialStorageKey}_expired`, trialStartDate.toISOString());
            console.log('📅 Created new expired trial date:', trialStartDate);
          }
        } else {
          // Normal trial logic for other users
          const storedTrialStart = localStorage.getItem(trialStorageKey);
          if (storedTrialStart) {
            trialStartDate = new Date(storedTrialStart);
            console.log('📅 Using existing trial start date:', trialStartDate);
          } else {
            trialStartDate = new Date();
            localStorage.setItem(trialStorageKey, trialStartDate.toISOString());
            console.log('📅 Created new trial start date:', trialStartDate);
          }
        }

        // Calculate trial end date (7 days from start)
        const trialEndDate = new Date(trialStartDate);
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const now = new Date();
        const timeRemaining = trialEndDate.getTime() - now.getTime();

        console.log('🔍 Trial calculation:', {
          userId: user.id,
          trialStartDate: trialStartDate.toISOString(),
          trialEndDate: trialEndDate.toISOString(),
          now: now.toISOString(),
          timeRemaining,
          timeRemainingDays: timeRemaining / (1000 * 60 * 60 * 24),
          isExpired: timeRemaining <= 0,
          hasActiveSubscription: subscription?.status === 'active'
        });
        
        if (timeRemaining <= 0) {
          // Trial expired
          console.log('❌ Trial EXPIRED - setting expired state');
          setTrialInfo({
            isTrialActive: false,
            isTrialExpired: true,
            daysRemaining: 0,
            hoursRemaining: 0,
            minutesRemaining: 0,
            trialStartDate,
            trialEndDate,
          });
        } else {
          // Trial still active
          console.log('✅ Trial ACTIVE - calculating remaining time');
          const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
          const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

          setTrialInfo({
            isTrialActive: true,
            isTrialExpired: false,
            daysRemaining,
            hoursRemaining,
            minutesRemaining,
            trialStartDate,
            trialEndDate,
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error calculating trial info:', error);
        console.log('💥 Error in trial calculation, setting expired state');
        
        setTrialInfo({
          isTrialActive: false,
          isTrialExpired: true,
          daysRemaining: 0,
          hoursRemaining: 0,
          minutesRemaining: 0,
          trialStartDate: new Date(),
          trialEndDate: null,
        });
        setLoading(false);
      }
    };

    calculateTrialInfo();

    // Update trial info every minute
    const interval = setInterval(calculateTrialInfo, 60000);
    return () => clearInterval(interval);
  }, [user, subscription]);

  return { trialInfo, loading };
};