import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserAffiliate, AffiliateReferral, AdminAffiliateReferral } from '../types';

// Helper function to get current user ID
const getCurrentUserId = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return user.id;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// User Affiliate Functions
export const getUserAffiliate = async (): Promise<UserAffiliate | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;
    
    // Use local storage for affiliate data
    const localData = getLocalAffiliateData();
    const userKey = `affiliate_${userId}`;
    
    if (localData[userKey]) {
      return localData[userKey];
    }
    
    // Create new affiliate if doesn't exist
    const newAffiliate = createLocalAffiliate(userId);
    localData[userKey] = newAffiliate;
    saveLocalAffiliateData(localData);
    
    return newAffiliate;
  } catch (error) {
    console.error('Error fetching user affiliate:', error);
    return getDemoAffiliate();
  }
};

const getDemoAffiliate = (): UserAffiliate => ({
  id: 'demo-affiliate',
  userId: 'demo-user',
  affiliateCode: 'DEMO123',
  bankAccount: {
    type: '',
    bank: '',
    agency: '',
    account: '',
    pixKey: '',
    pixType: ''
  },
  totalReferrals: 0,
  totalEarnings: 0,
  totalReceived: 0,
  totalPending: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const createUserAffiliate = async (): Promise<UserAffiliate> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  
  return createLocalAffiliate(userId);
};

const createLocalAffiliate = (userId: string): UserAffiliate => {
  return {
    id: `affiliate_${userId}`,
    userId,
    affiliateCode: generateAffiliateCode(),
    bankAccount: {
      type: '',
      bank: '',
      agency: '',
      account: '',
      pixKey: '',
      pixType: ''
    },
    totalReferrals: 0,
    totalEarnings: 0,
    totalReceived: 0,
    totalPending: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

const generateAffiliateCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const saveUserAffiliate = async (affiliate: UserAffiliate): Promise<UserAffiliate> => {
  // Save to local storage
  const localData = getLocalAffiliateData();
  const userKey = `affiliate_${affiliate.userId}`;
  
  const updatedAffiliate = {
    ...affiliate,
    updatedAt: new Date().toISOString()
  };
  
  localData[userKey] = updatedAffiliate;
  saveLocalAffiliateData(localData);
  
  return updatedAffiliate;
};

// Affiliate Referrals Functions
export const getAffiliateReferrals = async (): Promise<AffiliateReferral[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    
    // Use local storage for referrals
    const localReferrals = getLocalReferralsData();
    return localReferrals.filter(referral => referral.affiliateUserId === userId);
  } catch (error) {
    console.error('Error fetching affiliate referrals:', error);
    return [];
  }
};

// Admin Functions
export const getAdminAffiliateReferrals = async (): Promise<AdminAffiliateReferral[]> => {
  try {
    // Use local storage for admin view
    const localReferrals = getLocalReferralsData();
    const localAffiliates = getLocalAffiliateData();
    
    return localReferrals.map(referral => {
      const affiliateKey = `affiliate_${referral.affiliateUserId}`;
      const affiliate = localAffiliates[affiliateKey];
      
      return {
        id: referral.id,
        createdAt: referral.createdAt,
        commissionAmount: referral.commissionAmount,
        commissionStatus: referral.commissionStatus,
        paidAt: referral.paidAt,
        subscriptionId: referral.subscriptionId,
        affiliateCode: affiliate?.affiliateCode || 'UNKNOWN',
        affiliateName: 'Usuário Afiliado',
        affiliateEmail: 'afiliado@exemplo.com',
        referredName: 'Usuário Indicado',
        referredEmail: referral.referredEmail || 'indicado@exemplo.com',
        priceId: referral.subscriptionId ? 'price_demo' : undefined,
        subscriptionStatus: referral.subscriptionStatus
      };
    });
  } catch (error) {
    console.error('Error fetching admin affiliate referrals:', error);
    return [];
  }
};

export const updateReferralStatus = async (referralId: string, status: 'pending' | 'paid' | 'cancelled'): Promise<void> => {
  // Update local storage
  const localReferrals = getLocalReferralsData();
  const referralIndex = localReferrals.findIndex(r => r.id === referralId);
  
  if (referralIndex !== -1) {
    localReferrals[referralIndex].commissionStatus = status;
    localReferrals[referralIndex].updatedAt = new Date().toISOString();
    
    if (status === 'paid') {
      localReferrals[referralIndex].paidAt = new Date().toISOString();
    }
    
    saveLocalReferralsData(localReferrals);
  }
};

// Function to create referral when user signs up with affiliate code
export const createAffiliateReferral = async (
  affiliateCode: string, 
  referredUserId: string, 
  subscriptionId?: string
): Promise<void> => {
  try {
    // Find affiliate by code in local storage
    const localAffiliates = getLocalAffiliateData();
    const affiliateEntry = Object.entries(localAffiliates).find(([_, affiliate]) => 
      affiliate.affiliateCode === affiliateCode
    );
    
    if (!affiliateEntry) {
      console.error('Affiliate not found:', affiliateCode);
      return;
    }
    
    const [_, affiliate] = affiliateEntry;
    
    // Calculate commission
    const commissionAmount = subscriptionId ? calculateCommission(subscriptionId) : 25.00;
    
    // Create referral record in local storage
    const localReferrals = getLocalReferralsData();
    const newReferral: AffiliateReferral = {
      id: `referral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      affiliateUserId: affiliate.userId,
      referredUserId,
      subscriptionId,
      commissionAmount,
      commissionStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      referredEmail: 'usuario@exemplo.com',
      planName: subscriptionId ? 'Plano Pago' : 'Período de Teste'
    };
    
    localReferrals.push(newReferral);
    saveLocalReferralsData(localReferrals);
    
    // Update affiliate stats
    affiliate.totalReferrals += 1;
    affiliate.totalEarnings += commissionAmount;
    affiliate.totalPending += commissionAmount;
    affiliate.updatedAt = new Date().toISOString();
    
    const updatedAffiliates = { ...localAffiliates };
    const userKey = `affiliate_${affiliate.userId}`;
    updatedAffiliates[userKey] = affiliate;
    saveLocalAffiliateData(updatedAffiliates);
    
  } catch (error) {
    console.error('Error creating affiliate referral:', error);
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
      return 0;
  }
};

// Local storage helper functions
const getLocalAffiliateData = () => {
  try {
    const data = localStorage.getItem('affiliate_data');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveLocalAffiliateData = (data: any) => {
  localStorage.setItem('affiliate_data', JSON.stringify(data));
};

const getLocalReferralsData = (): AffiliateReferral[] => {
  try {
    const data = localStorage.getItem('referrals_data');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalReferralsData = (data: AffiliateReferral[]) => {
  localStorage.setItem('referrals_data', JSON.stringify(data));
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