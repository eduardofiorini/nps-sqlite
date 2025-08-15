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

        if (isSupabaseConfigured()) {
          // Get trial start date from user profile
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('trial_start_date')
            .eq('user_id', user.id)
            .single();

          if (error || !profile?.trial_start_date) {
            // If no profile or trial date, create one
            const now = new Date();
            const { error: updateError } = await supabase
              .from('user_profiles')
              .upsert({
                user_id: user.id,
                trial_start_date: now.toISOString(),
              }, { onConflict: 'user_id' });

            if (updateError) {
              console.error('Error updating trial start date:', updateError);
            }
            
            trialStartDate = now;
          } else {
            trialStartDate = new Date(profile.trial_start_date);
          }
        } else {
          // Demo mode - use localStorage
          const storedTrialStart = localStorage.getItem('trial_start_date');
          if (storedTrialStart) {
            trialStartDate = new Date(storedTrialStart);
          } else {
            trialStartDate = new Date();
            localStorage.setItem('trial_start_date', trialStartDate.toISOString());
          }
        }

        // Calculate trial end date (7 days from start)
        const trialEndDate = new Date(trialStartDate);
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const now = new Date();
        const timeRemaining = trialEndDate.getTime() - now.getTime();

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
      } catch (error) {
        console.error('Error calculating trial info:', error);
        // Default to expired trial on error
        setTrialInfo({
          isTrialActive: false,
          isTrialExpired: true,
          daysRemaining: 0,
          hoursRemaining: 0,
          minutesRemaining: 0,
          trialStartDate: null,
          trialEndDate: null,
        });
      } finally {
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