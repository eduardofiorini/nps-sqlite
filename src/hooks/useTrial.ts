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

        let trialStartDate;
        if (isSupabaseConfigured()) {
          // Use localStorage for trial tracking to avoid RLS issues
          const storedTrialStart = localStorage.getItem(`trial_start_date_${user.id}`);
          if (storedTrialStart) {
            trialStartDate = new Date(storedTrialStart);
          } else {
            trialStartDate = new Date();
            localStorage.setItem(`trial_start_date_${user.id}`, trialStartDate.toISOString());
          }
        } else {
          // Demo mode - use localStorage
          const storedTrialStart = localStorage.getItem(`trial_start_date_${user.id}`);
          if (storedTrialStart) {
            trialStartDate = new Date(storedTrialStart);
          } else {
            trialStartDate = new Date();
            localStorage.setItem(`trial_start_date_${user.id}`, trialStartDate.toISOString());
          }
        }

        // Calculate trial end date (7 days from start)
        const trialEndDate = new Date(trialStartDate);
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const now = new Date();
        const timeRemaining = trialEndDate.getTime() - now.getTime();

        console.log('Trial calculation:', {
          trialStartDate: trialStartDate.toISOString(),
          trialEndDate: trialEndDate.toISOString(),
          now: now.toISOString(),
          timeRemaining,
          isExpired: timeRemaining <= 0,
          hasActiveSubscription: subscription?.status === 'active'
        });
        if (timeRemaining <= 0) {
          // Trial expired
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
        // On error, assume trial is expired to be safe
        // For testing, set trial start to 8 days ago to simulate expired trial
        let calculatedTrialStartDate = new Date();
        calculatedTrialStartDate.setDate(calculatedTrialStartDate.getDate() - 8);
        
        setTrialInfo({
          isTrialActive: false,
          isTrialExpired: true,
          daysRemaining: 0,
          hoursRemaining: 0,
          minutesRemaining: 0,
          trialStartDate: calculatedTrialStartDate,
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