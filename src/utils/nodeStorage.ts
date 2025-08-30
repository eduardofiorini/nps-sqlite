import { apiClient } from '../lib/api';
import { 
  Campaign, 
  CampaignForm, 
  NpsResponse, 
  Source, 
  Situation, 
  Group, 
  Contact, 
  UserProfile, 
  AppConfig,
  UserAffiliate,
  AffiliateReferral
} from '../types';

// Campaign functions
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const result = await apiClient.getCampaigns();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};

export const saveCampaign = async (campaign: Campaign): Promise<Campaign> => {
  try {
    const campaignData = {
      name: campaign.name,
      description: campaign.description,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      active: campaign.active,
      default_source_id: campaign.defaultSourceId,
      default_group_id: campaign.defaultGroupId,
      survey_customization: campaign.surveyCustomization,
      automation: campaign.automation
    };

    let result;
    if (campaign.id && campaign.id !== '') {
      result = await apiClient.updateCampaign(campaign.id, campaignData);
    } else {
      result = await apiClient.createCampaign(campaignData);
    }

    return {
      ...result.data,
      startDate: result.data.start_date,
      endDate: result.data.end_date,
      defaultSourceId: result.data.default_source_id,
      defaultGroupId: result.data.default_group_id,
      surveyCustomization: result.data.survey_customization,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at
    };
  } catch (error) {
    console.error('Error saving campaign:', error);
    throw error;
  }
};

export const deleteCampaign = async (id: string): Promise<boolean> => {
  try {
    await apiClient.deleteCampaign(id);
    return true;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return false;
  }
};

// Campaign Form functions
export const getCampaignForm = async (campaignId: string): Promise<CampaignForm | null> => {
  try {
    const result = await apiClient.getCampaignForm(campaignId);
    return {
      ...result.data,
      campaignId: result.data.campaign_id
    };
  } catch (error) {
    console.error('Error fetching campaign form:', error);
    return null;
  }
};

export const saveCampaignForm = async (form: CampaignForm): Promise<CampaignForm> => {
  try {
    const result = await apiClient.saveCampaignForm(form.campaignId, form.fields);
    return {
      ...result.data,
      campaignId: result.data.campaign_id
    };
  } catch (error) {
    console.error('Error saving campaign form:', error);
    throw error;
  }
};

// Response functions
export const getResponses = async (campaignId?: string): Promise<NpsResponse[]> => {
  try {
    const result = await apiClient.getResponses(campaignId);
    return result.data?.map((response: any) => ({
      ...response,
      campaignId: response.campaign_id,
      sourceId: response.source_id,
      situationId: response.situation_id,
      groupId: response.group_id,
      formResponses: response.form_responses,
      createdAt: response.created_at
    })) || [];
  } catch (error) {
    console.error('Error fetching responses:', error);
    return [];
  }
};

export const saveResponse = async (response: NpsResponse): Promise<NpsResponse> => {
  try {
    const responseData = {
      campaign_id: response.campaignId,
      score: response.score,
      feedback: response.feedback,
      source_id: response.sourceId,
      situation_id: response.situationId,
      group_id: response.groupId,
      form_responses: response.formResponses
    };

    const result = await apiClient.submitResponse(responseData);
    return {
      ...response,
      id: result.data.id,
      createdAt: result.data.created_at
    };
  } catch (error) {
    console.error('Error saving response:', error);
    throw error;
  }
};

// Entity functions
export const getSources = async (): Promise<Source[]> => {
  try {
    const result = await apiClient.getEntities('sources');
    return result.data || [];
  } catch (error) {
    console.error('Error fetching sources:', error);
    return [];
  }
};

export const saveSource = async (source: Source): Promise<Source> => {
  try {
    let result;
    if (source.id && source.id !== '') {
      result = await apiClient.updateEntity('sources', source.id, source);
    } else {
      result = await apiClient.createEntity('sources', source);
    }
    return result.data;
  } catch (error) {
    console.error('Error saving source:', error);
    throw error;
  }
};

export const deleteSource = async (id: string): Promise<boolean> => {
  try {
    await apiClient.deleteEntity('sources', id);
    return true;
  } catch (error) {
    console.error('Error deleting source:', error);
    return false;
  }
};

export const getSituations = async (): Promise<Situation[]> => {
  try {
    const result = await apiClient.getEntities('situations');
    return result.data || [];
  } catch (error) {
    console.error('Error fetching situations:', error);
    return [];
  }
};

export const saveSituation = async (situation: Situation): Promise<Situation> => {
  try {
    let result;
    if (situation.id && situation.id !== '') {
      result = await apiClient.updateEntity('situations', situation.id, situation);
    } else {
      result = await apiClient.createEntity('situations', situation);
    }
    return result.data;
  } catch (error) {
    console.error('Error saving situation:', error);
    throw error;
  }
};

export const deleteSituation = async (id: string): Promise<boolean> => {
  try {
    await apiClient.deleteEntity('situations', id);
    return true;
  } catch (error) {
    console.error('Error deleting situation:', error);
    return false;
  }
};

export const getGroups = async (): Promise<Group[]> => {
  try {
    const result = await apiClient.getEntities('groups');
    return result.data || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export const saveGroup = async (group: Group): Promise<Group> => {
  try {
    let result;
    if (group.id && group.id !== '') {
      result = await apiClient.updateEntity('groups', group.id, group);
    } else {
      result = await apiClient.createEntity('groups', group);
    }
    return result.data;
  } catch (error) {
    console.error('Error saving group:', error);
    throw error;
  }
};

export const deleteGroup = async (id: string): Promise<boolean> => {
  try {
    await apiClient.deleteEntity('groups', id);
    return true;
  } catch (error) {
    console.error('Error deleting group:', error);
    return false;
  }
};

// Contact functions
export const getContacts = async (): Promise<Contact[]> => {
  try {
    const result = await apiClient.getContacts();
    return result.data?.map((contact: any) => ({
      ...contact,
      groupIds: contact.group_ids,
      lastContactDate: contact.last_contact_date,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at
    })) || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

export const saveContact = async (contact: Contact): Promise<Contact> => {
  try {
    const contactData = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      group_ids: contact.groupIds,
      tags: contact.tags,
      notes: contact.notes,
      last_contact_date: contact.lastContactDate
    };

    let result;
    if (contact.id && contact.id !== '') {
      result = await apiClient.updateContact(contact.id, contactData);
    } else {
      result = await apiClient.createContact(contactData);
    }

    return {
      ...result.data,
      groupIds: result.data.group_ids,
      lastContactDate: result.data.last_contact_date,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at
    };
  } catch (error) {
    console.error('Error saving contact:', error);
    throw error;
  }
};

export const deleteContact = async (id: string): Promise<boolean> => {
  try {
    await apiClient.deleteContact(id);
    return true;
  } catch (error) {
    console.error('Error deleting contact:', error);
    return false;
  }
};

export const searchContacts = (query: string): Contact[] => {
  // This will be handled by the API call in the component
  return [];
};

export const getContactsByGroup = async (groupId: string): Promise<Contact[]> => {
  try {
    const contacts = await getContacts();
    return contacts.filter(contact => contact.groupIds.includes(groupId));
  } catch (error) {
    console.error('Error fetching contacts by group:', error);
    return [];
  }
};

// Profile functions
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const result = await apiClient.getProfile();
    return {
      ...result.data,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
  try {
    const result = await apiClient.updateProfile(profile);
    return {
      ...result.data,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at
    };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Config functions
export const getAppConfig = async (): Promise<AppConfig> => {
  try {
    const result = await apiClient.getConfig();
    return {
      themeColor: result.data.theme_color,
      language: result.data.language,
      company: result.data.company,
      integrations: result.data.integrations
    };
  } catch (error) {
    console.error('Error fetching app config:', error);
    throw error;
  }
};

export const saveAppConfig = async (config: AppConfig): Promise<AppConfig> => {
  try {
    const configData = {
      theme_color: config.themeColor,
      language: config.language,
      company: config.company,
      integrations: config.integrations
    };

    const result = await apiClient.updateConfig(configData);
    return {
      themeColor: result.data.theme_color,
      language: result.data.language,
      company: result.data.company,
      integrations: result.data.integrations
    };
  } catch (error) {
    console.error('Error saving app config:', error);
    throw error;
  }
};

// Affiliate functions
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

export const saveUserAffiliate = async (affiliate: UserAffiliate): Promise<UserAffiliate> => {
  try {
    const result = await apiClient.updateAffiliate({
      bank_account: affiliate.bankAccount
    });
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
    console.error('Error saving user affiliate:', error);
    throw error;
  }
};

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

export const createAffiliateReferral = async (
  affiliateCode: string, 
  referredUserId: string, 
  subscriptionId?: string
): Promise<void> => {
  try {
    const commissionAmount = subscriptionId ? calculateCommission(subscriptionId) : 25.00;
    await apiClient.createAffiliateReferral(affiliateCode, referredUserId, subscriptionId, commissionAmount);
  } catch (error) {
    console.error('Error creating affiliate referral:', error);
    throw error;
  }
};

// Admin functions
export const getAdminUsers = async (): Promise<any[]> => {
  try {
    const result = await apiClient.getAdminUsers();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
};

export const getAdminAffiliateReferrals = async (): Promise<any[]> => {
  try {
    const result = await apiClient.getAdminAffiliateReferrals();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching admin affiliate referrals:', error);
    return [];
  }
};

export const updateReferralStatus = async (referralId: string, status: string): Promise<void> => {
  try {
    await apiClient.updateReferralStatus(referralId, status);
  } catch (error) {
    console.error('Error updating referral status:', error);
    throw error;
  }
};

// Utility functions
export const initializeDefaultData = async (): Promise<void> => {
  try {
    // Check if user already has sources
    const sources = await getSources();
    if (sources.length > 0) {
      return; // User already has data
    }

    // Create default sources
    const defaultSources = [
      { name: 'WhatsApp', color: '#25D366' },
      { name: 'Email', color: '#4285F4' },
      { name: 'Telefone', color: '#FF9800' },
      { name: 'Website', color: '#673AB7' },
    ];

    for (const source of defaultSources) {
      await saveSource({ id: '', ...source } as Source);
    }

    // Create default situations
    const defaultSituations = [
      { name: 'Respondido', color: '#4CAF50' },
      { name: 'Pendente', color: '#FFC107' },
      { name: 'Ignorado', color: '#F44336' },
    ];

    for (const situation of defaultSituations) {
      await saveSituation({ id: '', ...situation } as Situation);
    }

    // Create default groups
    const defaultGroups = [
      { name: 'Clientes Premium' },
      { name: 'Clientes Regulares' },
      { name: 'Testes Internos' },
    ];

    for (const group of defaultGroups) {
      await saveGroup({ id: '', ...group } as Group);
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

export const cleanupLocalStorage = () => {
  // Clean up old localStorage keys
  const keysToRemove = [
    'nps_supabase_auth',
    'supabase.auth.token',
    'theme_color'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};

// Helper function to calculate commission
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
      return 25.00; // Default commission
  }
};

// Check if backend is configured
export const isSupabaseConfigured = (): boolean => {
  // Always return false since we're using Node.js backend now
  return false;
};