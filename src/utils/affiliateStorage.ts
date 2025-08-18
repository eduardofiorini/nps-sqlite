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
    
    if (!isSupabaseConfigured()) {
      return getDemoAffiliate();
    }
    
    const { data, error } = await supabase
      .from('user_affiliates')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.warn('Error fetching user affiliate:', error);
      return getDemoAffiliate();
    }
    
    if (!data) {
      // Create affiliate record if it doesn't exist
      return await createUserAffiliate();
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      affiliateCode: data.affiliate_code,
      bankAccount: data.bank_account,
      totalReferrals: data.total_referrals,
      totalEarnings: data.total_earnings,
      totalReceived: data.total_received,
      totalPending: data.total_pending,
      createdAt: data.created_at,
      updatedAt: data.updated_at
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
  
  if (!isSupabaseConfigured()) {
    return getDemoAffiliate();
  }
  
  // Generate affiliate code
  const affiliateCode = generateAffiliateCode();
  
  const { data, error } = await supabase
    .from('user_affiliates')
    .insert({
      user_id: userId,
      affiliate_code: affiliateCode,
      bank_account: {
        type: '',
        bank: '',
        agency: '',
        account: '',
        pixKey: '',
        pixType: ''
      }
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    userId: data.user_id,
    affiliateCode: data.affiliate_code,
    bankAccount: data.bank_account,
    totalReferrals: data.total_referrals,
    totalEarnings: data.total_earnings,
    totalReceived: data.total_received,
    totalPending: data.total_pending,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

const generateAffiliateCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const saveUserAffiliate = async (affiliate: UserAffiliate): Promise<UserAffiliate> => {
  if (!isSupabaseConfigured()) {
    return affiliate;
  }
  
  const { data, error } = await supabase
    .from('user_affiliates')
    .update({
      bank_account: affiliate.bankAccount
    })
    .eq('user_id', affiliate.userId)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    userId: data.user_id,
    affiliateCode: data.affiliate_code,
    bankAccount: data.bank_account,
    totalReferrals: data.total_referrals,
    totalEarnings: data.total_earnings,
    totalReceived: data.total_received,
    totalPending: data.total_pending,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Affiliate Referrals Functions
export const getAffiliateReferrals = async (): Promise<AffiliateReferral[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    
    if (!isSupabaseConfigured()) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('affiliate_referrals')
      .select(`
        *,
        referred_user:users!affiliate_referrals_referred_user_id_fkey(email),
        subscription:stripe_subscriptions!affiliate_referrals_subscription_id_fkey(price_id, status)
      `)
      .eq('affiliate_user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Error fetching affiliate referrals:', error);
      return [];
    }
    
    return data?.map(referral => ({
      id: referral.id,
      affiliateUserId: referral.affiliate_user_id,
      referredUserId: referral.referred_user_id,
      subscriptionId: referral.subscription_id,
      commissionAmount: referral.commission_amount,
      commissionStatus: referral.commission_status,
      paidAt: referral.paid_at,
      createdAt: referral.created_at,
      updatedAt: referral.updated_at,
      referredEmail: referral.referred_user?.email,
      planName: referral.subscription?.price_id ? 'Plano Pago' : 'Período de Teste',
      subscriptionStatus: referral.subscription?.status
    })) || [];
  } catch (error) {
    console.error('Error fetching affiliate referrals:', error);
    return [];
  }
};

// Admin Functions
export const getAdminAffiliateReferrals = async (): Promise<AdminAffiliateReferral[]> => {
  try {
    if (!isSupabaseConfigured()) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('admin_affiliate_referrals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Error fetching admin affiliate referrals:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching admin affiliate referrals:', error);
    return [];
  }
};

export const updateReferralStatus = async (referralId: string, status: 'pending' | 'paid' | 'cancelled'): Promise<void> => {
  if (!isSupabaseConfigured()) {
    return;
  }
  
  const updateData: any = {
    commission_status: status,
    updated_at: new Date().toISOString()
  };
  
  if (status === 'paid') {
    updateData.paid_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('affiliate_referrals')
    .update(updateData)
    .eq('id', referralId);
  
  if (error) throw error;
};

// Function to create referral when user signs up with affiliate code
export const createAffiliateReferral = async (
  affiliateCode: string, 
  referredUserId: string, 
  subscriptionId?: string
): Promise<void> => {
  try {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping affiliate referral creation');
      return;
    }
    
    // Find affiliate by code
    const { data: affiliate, error: affiliateError } = await supabase
      .from('user_affiliates')
      .select('user_id')
      .eq('affiliate_code', affiliateCode)
      .single();
    
    if (affiliateError || !affiliate) {
      console.error('Affiliate not found:', affiliateCode);
      return;
    }
    
    // Calculate commission based on subscription
    let commissionAmount = 0;
    if (subscriptionId) {
      commissionAmount = calculateCommission(subscriptionId);
    }
    
    // Create referral record
    const { error: referralError } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_user_id: affiliate.user_id,
        referred_user_id: referredUserId,
        subscription_id: subscriptionId,
        commission_amount: commissionAmount,
        commission_status: subscriptionId ? 'pending' : 'pending'
      });
    
    if (referralError) {
      console.error('Error creating affiliate referral:', referralError);
    }
    
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