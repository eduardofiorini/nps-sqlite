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