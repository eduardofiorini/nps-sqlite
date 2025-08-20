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
      cleanupAffiliateLocalStorage();
      return null;
    }
    
    const userId = await getCurrentUserId();
    if (!userId) return null;
    
    console.log('Fetching user affiliate for user:', userId);
    
    const { data, error } = await supabase
      .from('user_affiliates')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user affiliate:', error);
      return null;
    }
    
    if (!data) {
      console.log('No affiliate record found, creating new one');
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
        return null;
      }
      
      console.log('Created new affiliate record:', created);
      
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
    
    console.log('Found existing affiliate record:', data);
    
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
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
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
      throw error;
    }
    
    return {
      ...affiliate,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error saving user affiliate:', error);
    throw error;
  }
};

// Affiliate Referrals Functions
export const getAffiliateReferrals = async (): Promise<AffiliateReferral[]> => {
  try {
    if (!isSupabaseConfigured()) {
      cleanupAffiliateLocalStorage();
      return [];
    }
    
    const userId = await getCurrentUserId();
    if (!userId) return [];
    
    console.log('Fetching affiliate referrals for user:', userId);
    
    const { data, error } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('affiliate_user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching affiliate referrals:', error);
      return [];
    }
    
    console.log('Fetched affiliate referrals:', data?.length || 0, 'records');
    
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
     referredEmail: `usuario-${referral.referred_user_id.slice(0, 8)}@exemplo.com`,
     planName: referral.subscription_id ? 'Plano Pago' : 'Período de Teste',
     subscriptionStatus: referral.subscription_id ? 'active' : undefined
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
      cleanupAffiliateLocalStorage();
      return [];
    }
    
    console.log('Fetching admin affiliate referrals');
    
    const { data, error } = await supabase
      .from('admin_affiliate_referrals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin affiliate referrals:', error);
      return [];
    }
    
    console.log('Fetched admin affiliate referrals:', data?.length || 0, 'records');
    
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
    return [];
  }
};

export const updateReferralStatus = async (referralId: string, status: 'pending' | 'paid' | 'cancelled'): Promise<void> => {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
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
      throw error;
    }
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
  console.log('Creating affiliate referral:', { affiliateCode, referredUserId, subscriptionId });
  
  try {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping referral creation');
      cleanupAffiliateLocalStorage();
      throw new Error('Supabase not configured');
    }
    
    // Find affiliate by code
    console.log('Looking for affiliate with code:', affiliateCode);
    const { data: affiliate, error: affiliateError } = await supabase
      .from('user_affiliates')
      .select('user_id')
      .eq('affiliate_code', affiliateCode)
      .maybeSingle();
    
    if (affiliateError || !affiliate) {
      console.error('Affiliate not found:', affiliateCode, affiliateError);
      console.log('Affiliate code not found in Supabase, skipping referral creation');
      throw new Error(`Affiliate code not found: ${affiliateCode}`);
    }
    
    console.log('Found affiliate:', affiliate.user_id);
    
    // Calculate commission
    const commissionAmount = subscriptionId ? calculateCommission(subscriptionId) : 25.00;
    console.log('Commission amount:', commissionAmount);
    
    // Create referral record
    const { data: newReferral, error: referralError } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_user_id: affiliate.user_id,
        referred_user_id: referredUserId,
        subscription_id: subscriptionId,
        commission_amount: commissionAmount,
        commission_status: 'pending'
      })
      .select()
      .single();
    
    if (referralError) {
      console.error('Error creating referral:', referralError);
      throw new Error(`Failed to create referral in Supabase: ${referralError.message}`);
    } else {
      console.log('Successfully created affiliate referral:', newReferral);
      
      // Clear the stored affiliate code after successful creation
      sessionStorage.removeItem('pending_affiliate_code');
      localStorage.removeItem('pending_affiliate_code');
    }
  } catch (error) {
    console.error('Error creating affiliate referral:', error);
    // Re-throw the error to be handled by the caller
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