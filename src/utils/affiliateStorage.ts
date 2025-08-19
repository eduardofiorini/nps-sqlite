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
    if (!isSupabaseConfigured()) {
      return getLocalUserAffiliate();
    }
    
    const userId = await getCurrentUserId();
    if (!userId) return getLocalUserAffiliate();
    
    const { data, error } = await supabase
      .from('user_affiliates')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.warn('Error fetching user affiliate:', error);
      return getLocalUserAffiliate();
    }
    
    if (!data) {
      // Create new affiliate record
      const newAffiliate = {
        user_id: userId,
        affiliate_code: generateAffiliateCode(),
        bank_account: {
          type: '',
          bank: '',
          agency: '',
          account: '',
          pixKey: '',
          pixType: ''
        }
      };
      
      const { data: created, error: createError } = await supabase
        .from('user_affiliates')
        .insert(newAffiliate)
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating affiliate:', createError);
        return getLocalUserAffiliate();
      }
      
      return {
        id: created.id,
        userId: created.user_id,
        affiliateCode: created.affiliate_code,
        bankAccount: created.bank_account,
        totalReferrals: created.total_referrals,
        totalEarnings: created.total_earnings,
        totalReceived: created.total_received,
        totalPending: created.total_pending,
        createdAt: created.created_at,
        updatedAt: created.updated_at
      };
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
    return getLocalUserAffiliate();
  }
};

const getLocalUserAffiliate = (): UserAffiliate => {
  const localData = getLocalAffiliateData();
  const userId = 'demo-user'; // Use demo user for local storage
  const userKey = `affiliate_${userId}`;
  
  if (localData[userKey]) {
    return localData[userKey];
  }
  
  // Create new affiliate if doesn't exist
  const newAffiliate = createLocalAffiliate(userId);
  localData[userKey] = newAffiliate;
  saveLocalAffiliateData(localData);
  
  return newAffiliate;
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
  try {
    if (!isSupabaseConfigured()) {
      return saveLocalUserAffiliate(affiliate);
    }
    
    const { data, error } = await supabase
      .from('user_affiliates')
      .update({
        bank_account: affiliate.bankAccount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', affiliate.userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving affiliate:', error);
      return saveLocalUserAffiliate(affiliate);
    }
    
    return {
      ...affiliate,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error saving user affiliate:', error);
    return saveLocalUserAffiliate(affiliate);
  }
};

const saveLocalUserAffiliate = (affiliate: UserAffiliate): UserAffiliate => {
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
    if (!isSupabaseConfigured()) {
      return getLocalAffiliateReferrals();
    }
    
    const userId = await getCurrentUserId();
    if (!userId) return getLocalAffiliateReferrals();
    
    const { data, error } = await supabase
      .from('affiliate_referrals')
      .select(`
        *,
        referred_user(email),
        subscription(price_id, status)
      `)
      .eq('affiliate_user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Error fetching affiliate referrals:', error);
      return getLocalAffiliateReferrals();
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
    return getLocalAffiliateReferrals();
  }
};

const getLocalAffiliateReferrals = (): AffiliateReferral[] => {
  const localReferrals = getLocalReferralsData();
  const userId = 'demo-user';
  return localReferrals.filter(referral => referral.affiliateUserId === userId);
};

// Admin Functions
export const getAdminAffiliateReferrals = async (): Promise<AdminAffiliateReferral[]> => {
  try {
    if (!isSupabaseConfigured()) {
      return getLocalAdminReferrals();
    }
    
    const { data, error } = await supabase
      .from('admin_affiliate_referrals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Error fetching admin affiliate referrals:', error);
      return getLocalAdminReferrals();
    }
    
    return data?.map(referral => ({
      id: referral.id,
      createdAt: referral.created_at,
      commissionAmount: referral.commission_amount,
      commissionStatus: referral.commission_status,
      paidAt: referral.paid_at,
      subscriptionId: referral.subscription_id,
      affiliateCode: referral.affiliate_code,
      affiliateName: referral.affiliate_name,
      affiliateEmail: referral.affiliate_email,
      referredName: referral.referred_name,
      referredEmail: referral.referred_email,
      priceId: referral.price_id,
      subscriptionStatus: referral.subscription_status
    })) || [];
  } catch (error) {
    console.error('Error fetching admin affiliate referrals:', error);
    return getLocalAdminReferrals();
  }
};

const getLocalAdminReferrals = (): AdminAffiliateReferral[] => {
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
};

export const updateReferralStatus = async (referralId: string, status: 'pending' | 'paid' | 'cancelled'): Promise<void> => {
  try {
    if (!isSupabaseConfigured()) {
      updateLocalReferralStatus(referralId, status);
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
    
    if (error) {
      console.error('Error updating referral status:', error);
      updateLocalReferralStatus(referralId, status);
    }
  } catch (error) {
    console.error('Error updating referral status:', error);
    updateLocalReferralStatus(referralId, status);
  }
};

const updateLocalReferralStatus = (referralId: string, status: 'pending' | 'paid' | 'cancelled'): void => {
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
    if (!isSupabaseConfigured()) {
      createLocalAffiliateReferral(affiliateCode, referredUserId, subscriptionId);
      return;
    }
    
    // Find affiliate by code
    const { data: affiliate, error: affiliateError } = await supabase
      .from('user_affiliates')
      .select('user_id')
      .eq('affiliate_code', affiliateCode)
      .maybeSingle();
    
    if (affiliateError || !affiliate) {
      console.error('Affiliate not found:', affiliateCode, affiliateError);
      createLocalAffiliateReferral(affiliateCode, referredUserId, subscriptionId);
      return;
    }
    
    // Calculate commission
    const commissionAmount = subscriptionId ? calculateCommission(subscriptionId) : 25.00;
    
    // Create referral record
    const { error: referralError } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_user_id: affiliate.user_id,
        referred_user_id: referredUserId,
        subscription_id: subscriptionId,
        commission_amount: commissionAmount,
        commission_status: 'pending'
      });
    
    if (referralError) {
      console.error('Error creating referral:', referralError);
      createLocalAffiliateReferral(affiliateCode, referredUserId, subscriptionId);
    }
  } catch (error) {
    console.error('Error creating affiliate referral:', error);
    createLocalAffiliateReferral(affiliateCode, referredUserId, subscriptionId);
  }
};

const createLocalAffiliateReferral = (
  affiliateCode: string, 
  referredUserId: string, 
  subscriptionId?: string
): void => {
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