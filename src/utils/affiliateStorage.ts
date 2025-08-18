import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserAffiliate, AffiliateReferral, AdminAffiliateReferral } from '../types';

// Local storage keys
const AFFILIATE_STORAGE_KEY = 'affiliate_data';
const REFERRALS_STORAGE_KEY = 'affiliate_referrals';

// Helper function to get current user ID
const getCurrentUserId = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return 'demo-user';
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return user.id;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper function to get current user profile
const getCurrentUserProfile = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return { name: 'Demo User', email: 'demo@example.com' };
    }
    
    const userId = await getCurrentUserId();
    if (!userId) return null;
    
    const { data } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('user_id', userId)
      .single();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    return {
      name: data?.name || 'Usuário',
      email: user?.email || ''
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { name: 'Usuário', email: '' };
  }
};

// Local storage helpers
const getLocalAffiliateData = (): Record<string, UserAffiliate> => {
  try {
    const data = localStorage.getItem(AFFILIATE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveLocalAffiliateData = (data: Record<string, UserAffiliate>) => {
  localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(data));
};

const getLocalReferralsData = (): AffiliateReferral[] => {
  try {
    const data = localStorage.getItem(REFERRALS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalReferralsData = (data: AffiliateReferral[]) => {
  localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(data));
};

// User Affiliate Functions
export const getUserAffiliate = async (): Promise<UserAffiliate | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;
    
    const affiliateData = getLocalAffiliateData();
    
    if (!affiliateData[userId]) {
      // Create affiliate record if it doesn't exist
      const newAffiliate = await createUserAffiliate();
      return newAffiliate;
    }
    
    // Calculate current stats
    const referrals = getLocalReferralsData().filter(r => r.affiliateUserId === userId);
    const totalReferrals = referrals.length;
    const totalEarnings = referrals.reduce((sum, r) => sum + r.commissionAmount, 0);
    const totalReceived = referrals.filter(r => r.commissionStatus === 'paid').reduce((sum, r) => sum + r.commissionAmount, 0);
    const totalPending = referrals.filter(r => r.commissionStatus === 'pending').reduce((sum, r) => sum + r.commissionAmount, 0);
    
    return {
      ...affiliateData[userId],
      totalReferrals,
      totalEarnings,
      totalReceived,
      totalPending
    };
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
  
  // Generate affiliate code
  const affiliateCode = generateAffiliateCode();
  
  const newAffiliate: UserAffiliate = {
    id: `affiliate-${userId}`,
    userId,
    affiliateCode,
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
  
  const affiliateData = getLocalAffiliateData();
  affiliateData[userId] = newAffiliate;
  saveLocalAffiliateData(affiliateData);
  
  return newAffiliate;
};

const generateAffiliateCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const saveUserAffiliate = async (affiliate: UserAffiliate): Promise<UserAffiliate> => {
  const affiliateData = getLocalAffiliateData();
  const updatedAffiliate = {
    ...affiliate,
    updatedAt: new Date().toISOString()
  };
  
  affiliateData[affiliate.userId] = updatedAffiliate;
  saveLocalAffiliateData(affiliateData);
  
  return updatedAffiliate;
};

// Affiliate Referrals Functions
export const getAffiliateReferrals = async (): Promise<AffiliateReferral[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    
    const referrals = getLocalReferralsData();
    return referrals.filter(r => r.affiliateUserId === userId);
  } catch (error) {
    console.error('Error fetching affiliate referrals:', error);
    return [];
  }
};

// Admin Functions
export const getAdminAffiliateReferrals = async (): Promise<AdminAffiliateReferral[]> => {
  try {
    const referrals = getLocalReferralsData();
    const affiliateData = getLocalAffiliateData();
    
    const adminReferrals: AdminAffiliateReferral[] = [];
    
    for (const referral of referrals) {
      const affiliate = Object.values(affiliateData).find(a => a.userId === referral.affiliateUserId);
      
      if (affiliate) {
        // Get user profiles for names
        const affiliateProfile = await getUserProfileById(referral.affiliateUserId);
        const referredProfile = await getUserProfileById(referral.referredUserId);
        
        adminReferrals.push({
          id: referral.id,
          createdAt: referral.createdAt,
          commissionAmount: referral.commissionAmount,
          commissionStatus: referral.commissionStatus,
          paidAt: referral.paidAt,
          subscriptionId: referral.subscriptionId,
          affiliateCode: affiliate.affiliateCode,
          affiliateName: affiliateProfile?.name || 'Usuário',
          affiliateEmail: affiliateProfile?.email || '',
          referredName: referredProfile?.name || 'Usuário',
          referredEmail: referredProfile?.email || '',
          priceId: referral.subscriptionId ? 'price_paid' : undefined,
          subscriptionStatus: referral.subscriptionStatus
        });
      }
    }
    
    return adminReferrals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching admin affiliate referrals:', error);
    return [];
  }
};

const getUserProfileById = async (userId: string) => {
  try {
    if (!isSupabaseConfigured()) {
      return { name: 'Demo User', email: 'demo@example.com' };
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('user_id', userId)
      .single();
    
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    
    return {
      name: profile?.name || 'Usuário',
      email: user?.user?.email || ''
    };
  } catch (error) {
    return { name: 'Usuário', email: '' };
  }
};

export const updateReferralStatus = async (referralId: string, status: 'pending' | 'paid' | 'cancelled'): Promise<void> => {
  const referrals = getLocalReferralsData();
  const referralIndex = referrals.findIndex(r => r.id === referralId);
  
  if (referralIndex !== -1) {
    referrals[referralIndex].commissionStatus = status;
    referrals[referralIndex].updatedAt = new Date().toISOString();
    
    if (status === 'paid') {
      referrals[referralIndex].paidAt = new Date().toISOString();
    }
    
    saveLocalReferralsData(referrals);
  }
};

// Function to create referral when user signs up with affiliate code
export const createAffiliateReferral = async (
  affiliateCode: string, 
  referredUserId: string, 
  subscriptionId?: string
): Promise<void> => {
  try {
    const affiliateData = getLocalAffiliateData();
    
    // Find affiliate by code
    const affiliate = Object.values(affiliateData).find(a => a.affiliateCode === affiliateCode);
    if (!affiliate) {
      console.error('Affiliate not found:', affiliateCode);
      return;
    }
    
    // Calculate commission based on subscription
    let commissionAmount = 0;
    if (subscriptionId) {
      commissionAmount = calculateCommission(subscriptionId);
    }
    
    // Create referral record
    const newReferral: AffiliateReferral = {
      id: `referral-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      affiliateUserId: affiliate.userId,
      referredUserId,
      subscriptionId,
      commissionAmount,
      commissionStatus: subscriptionId ? 'pending' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      planName: subscriptionId ? 'Plano Pago' : 'Período de Teste',
      subscriptionStatus: subscriptionId ? 'active' : 'trialing'
    };
    
    const referrals = getLocalReferralsData();
    referrals.push(newReferral);
    saveLocalReferralsData(referrals);
    
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