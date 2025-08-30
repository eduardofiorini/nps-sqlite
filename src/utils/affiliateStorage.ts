import { apiClient } from '../lib/api';
import type { UserAffiliate, AffiliateReferral, AdminAffiliateReferral } from '../types';

// User Affiliate Functions
export const getUserAffiliate = async (): Promise<UserAffiliate | null> => {
  try {
    const result = await apiClient.getAffiliate();
    return {
      ...result.data,
      userId: result.data.user_id,
      affiliateCode: result.data.affiliate_code,
      bankAccount: result.data.bank_account,
      totalReferrals: result.data.total_referrals,
      totalEarnings: result.data.total_earnings,
      totalReceived: result.data.total_received,
      totalPending: result.data.total_pending,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at
    };
  } catch (error) {
    console.error('Error fetching user affiliate:', error);
    return null;
  }
};

// Clean up affiliate localStorage data
const cleanupAffiliateLocalStorage = () => {
  const keysToRemove = [
    'affiliate_data',
    'referrals_data'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('Cleaned up affiliate localStorage data');
};

const generateAffiliateCode = (): string => {
  // Generate a more unique affiliate code
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return (timestamp + random).toUpperCase().substring(0, 8);
};

export const saveUserAffiliate = async (affiliate: UserAffiliate): Promise<UserAffiliate> => {
  try {
    const result = await apiClient.updateAffiliate({
      bank_account: affiliate.bankAccount
    });

    return {
      ...affiliate,
      updatedAt: result.data.updated_at
    };
  } catch (error) {
    console.error('Error saving user affiliate:', error);
    throw error;
  }
};

// Affiliate Referrals Functions
export const getAffiliateReferrals = async (): Promise<AffiliateReferral[]> => {
  try {
    const result = await apiClient.getAffiliateReferrals();
    return result.data?.map((referral: any) => ({
      ...referral,
      affiliateUserId: referral.affiliate_user_id,
      referredUserId: referral.referred_user_id,
      subscriptionId: referral.subscription_id,
      commissionAmount: referral.commission_amount,
      commissionStatus: referral.commission_status,
      paidAt: referral.paid_at,
      createdAt: referral.created_at,
      updatedAt: referral.updated_at,
      referredEmail: referral.referred_email,
      planName: referral.subscription_id ? 'Plano Pago' : 'Período de Teste'
    })) || [];
  } catch (error) {
    console.error('Error fetching affiliate referrals:', error);
    return [];
  }
};

// Admin Functions
export const getAdminAffiliateReferrals = async (): Promise<AdminAffiliateReferral[]> => {
  try {
    const result = await apiClient.getAdminAffiliateReferrals();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching admin affiliate referrals:', error);
    return [];
  }
};

export const updateReferralStatus = async (referralId: string, status: 'pending' | 'paid' | 'cancelled'): Promise<void> => {
  try {
    await apiClient.updateReferralStatus(referralId, status);
  } catch (error) {
    console.error('Error updating referral status:', error);
    throw error;
  }
};

// Function to create referral when user signs up with affiliate code
export const createAffiliateReferral = async (
  affiliateCode: string, 
  referredUserId: string, 
  subscriptionId?: string
): Promise<void> => {
  try {
    const commissionAmount = subscriptionId ? calculateCommission(subscriptionId) : 25.00;
    await apiClient.createAffiliateReferral(affiliateCode, referredUserId, subscriptionId, commissionAmount);
    
    // Clear the stored affiliate code after successful creation
    sessionStorage.removeItem('pending_affiliate_code');
    localStorage.removeItem('pending_affiliate_code');
  } catch (error) {
    console.error('Error creating affiliate referral:', error);
    throw error;
  }
};

const calculateCommission = (priceId: string): number => {
  // 25% commission on monthly subscriptions
  switch (priceId) {
    case 'price_1RjVnGJwPeWVIUa99CJNK4I4': // Iniciante
      return 12.25; // 25% of R$49
    case 'price_1RjVoIJwPeWVIUa9puy9krkj': // Profissional
      return 24.75; // 25% of R$99
    case 'price_1RjVpRJwPeWVIUa9ECuvA3FX': // Empresarial
      return 62.25; // 25% of R$249
    default:
      return 25.00; // Default commission for unknown plans
  }
};

// Function to get affiliate code from URL and store in session
export const getAffiliateCodeFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const affiliateCode = urlParams.get('ref');
  
  if (affiliateCode) {
    // Store in session storage for later use during registration
    sessionStorage.setItem('affiliate_code', affiliateCode);
  }
  
  return affiliateCode;
};

// Function to get stored affiliate code from session
export const getStoredAffiliateCode = (): string | null => {
  return sessionStorage.getItem('affiliate_code');
};

// Function to clear stored affiliate code
export const clearStoredAffiliateCode = (): void => {
  sessionStorage.removeItem('affiliate_code');
};