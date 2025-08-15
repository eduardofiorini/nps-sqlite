import { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { useTrial } from './useTrial';
import { getCampaigns, getResponses } from '../utils/supabaseStorage';
import { stripeProducts } from '../stripe-config';

export interface PlanLimits {
  campaigns: number | 'unlimited';
  responsesPerMonth: number | 'unlimited';
  users: number | 'unlimited';
}

export interface UsageData {
  campaigns: number;
  responsesThisMonth: number;
  users: number;
}

export interface PlanLimitInfo {
  limits: PlanLimits;
  usage: UsageData;
  canCreateCampaign: boolean;
  canReceiveResponse: boolean;
  isTrialActive: boolean;
  planName: string;
  upgradeRequired: boolean;
}

const getTrialLimits = (): PlanLimits => ({
  campaigns: 2,
  responsesPerMonth: 100,
  users: 1
});

const getPlanLimits = (priceId: string | null): PlanLimits => {
  const product = stripeProducts.find(p => p.priceId === priceId);
  
  if (!product) {
    return getTrialLimits();
  }

  // Map plan features to limits
  if (product.name.includes('Iniciante')) {
    return {
      campaigns: 2,
      responsesPerMonth: 500,
      users: 1
    };
  } else if (product.name.includes('Profissional')) {
    return {
      campaigns: 'unlimited',
      responsesPerMonth: 2500,
      users: 5
    };
  } else if (product.name.includes('Empresarial')) {
    return {
      campaigns: 'unlimited',
      responsesPerMonth: 'unlimited',
      users: 'unlimited'
    };
  }

  return getTrialLimits();
};

export const usePlanLimits = (): PlanLimitInfo => {
  const { subscription } = useSubscription();
  const { trialInfo } = useTrial();
  const [usage, setUsage] = useState<UsageData>({
    campaigns: 0,
    responsesThisMonth: 0,
    users: 1
  });
  const [loading, setLoading] = useState(true);

  // Determine current plan limits
  const isTrialActive = trialInfo.isTrialActive && !subscription?.status;
  const hasActiveSubscription = subscription?.status === 'active';
  
  let limits: PlanLimits;
  let planName: string;
  
  if (hasActiveSubscription) {
    limits = getPlanLimits(subscription.priceId);
    planName = subscription.planName || 'Plano Ativo';
  } else if (isTrialActive) {
    limits = getTrialLimits();
    planName = 'Período de Teste';
  } else {
    // Trial expired or no subscription
    limits = { campaigns: 0, responsesPerMonth: 0, users: 0 };
    planName = 'Sem Plano Ativo';
  }

  useEffect(() => {
    const calculateUsage = async () => {
      try {
        setLoading(true);

        // Get total campaigns
        const campaigns = await getCampaigns();
        const campaignCount = campaigns.length;

        // Calculate responses this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let responsesThisMonth = 0;
        
        // Get responses for all campaigns and count this month's responses
        for (const campaign of campaigns) {
          try {
            const campaignResponses = await getResponses(campaign.id);
            const monthlyResponses = campaignResponses.filter(response => 
              new Date(response.createdAt) >= startOfMonth
            );
            responsesThisMonth += monthlyResponses.length;
          } catch (error) {
            console.warn(`Error getting responses for campaign ${campaign.id}:`, error);
          }
        }

        setUsage({
          campaigns: campaignCount,
          responsesThisMonth,
          users: 1 // For now, single user per account
        });
      } catch (error) {
        console.error('Error calculating usage:', error);
        setUsage({
          campaigns: 0,
          responsesThisMonth: 0,
          users: 1
        });
      } finally {
        setLoading(false);
      }
    };

    calculateUsage();
  }, [subscription, trialInfo]);

  // Check if user can create campaigns
  const canCreateCampaign = 
    limits.campaigns === 'unlimited' || 
    usage.campaigns < limits.campaigns;

  // Check if user can receive responses
  const canReceiveResponse = 
    limits.responsesPerMonth === 'unlimited' || 
    usage.responsesThisMonth < limits.responsesPerMonth;

  // Determine if upgrade is required
  const upgradeRequired = !hasActiveSubscription && !isTrialActive;

  return {
    limits,
    usage,
    canCreateCampaign,
    canReceiveResponse,
    isTrialActive,
    planName,
    upgradeRequired,
  };
};