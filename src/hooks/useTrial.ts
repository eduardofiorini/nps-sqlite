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
          const { data: profiles, error } = await supabase
            .from('user_profiles')
            .select('trial_start_date')
            .eq('user_id', user.id);

          if (error) {
            console.error('Error fetching user profile:', error);
            // Fallback to localStorage for trial date
            const storedTrialStart = localStorage.getItem(`trial_start_date_${user.id}`);
            if (storedTrialStart) {
              trialStartDate = new Date(storedTrialStart);
            } else {
              trialStartDate = new Date();
              localStorage.setItem(`trial_start_date_${user.id}`, trialStartDate.toISOString());
            }
          } else if (!profiles || profiles.length === 0 || !profiles[0]?.trial_start_date) {
            // If no profile or trial date, create one
            const now = new Date();
            
            // Try to insert/update profile with trial start date
            const { error: upsertError } = await supabase
              .from('user_profiles')
              .upsert({
                user_id: user.id,
                name: user.name,
                trial_start_date: now.toISOString(),
              }, { onConflict: 'user_id' });

            if (upsertError) {
              console.error('Error creating/updating user profile:', upsertError);
              // Fallback to localStorage
              localStorage.setItem(`trial_start_date_${user.id}`, now.toISOString());
            }
            
            trialStartDate = now;
          } else {
            trialStartDate = new Date(profiles[0].trial_start_date);
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