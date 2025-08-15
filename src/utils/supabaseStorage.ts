import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  Campaign, 
  CampaignForm, 
  NpsResponse, 
  Source, 
  Situation, 
  Group, 
  Contact, 
  UserProfile, 
  AppConfig 
} from '../types';

// Helper function to get current user ID
const getCurrentUserId = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return null;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return user.id;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Sources
export const getSources = async (): Promise<Source[]> => {
  try {
    if (!isSupabaseConfigured()) {
      return getDemoSources();
    }
    
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('name');
    
    if (error) {
      console.warn('Error fetching sources:', error);
      return getDemoSources();
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching sources:', error);
    return getDemoSources();
  }
};

// Demo data functions
const getDemoSources = (): Source[] => [
  { id: '1', name: 'Website', description: 'Website feedback', color: '#3B82F6', user_id: 'demo' },
  { id: '2', name: 'Email', description: 'Email campaigns', color: '#10B981', user_id: 'demo' },
  { id: '3', name: 'SMS', description: 'SMS surveys', color: '#8B5CF6', user_id: 'demo' }
];

const getDemoSituations = (): Situation[] => [
  { id: '1', name: 'New Purchase', description: 'After a new purchase', color: '#10B981', user_id: 'demo' },
  { id: '2', name: 'Support Interaction', description: 'After customer support', color: '#3B82F6', user_id: 'demo' },
  { id: '3', name: 'Renewal', description: 'After subscription renewal', color: '#8B5CF6', user_id: 'demo' }
];

const getDemoGroups = (): Group[] => [
  { id: '1', name: 'Premium Customers', description: 'High-value customers', user_id: 'demo' },
  { id: '2', name: 'New Users', description: 'Users who joined in the last 30 days', user_id: 'demo' },
  { id: '3', name: 'Enterprise', description: 'Enterprise customers', user_id: 'demo' }
];

export const saveSource = async (source: Omit<Source, 'id'> & { id?: string }): Promise<Source> => {
  const userId = await getCurrentUserId();
  
  if (!userId || !isSupabaseConfigured()) {
    // Return the source with a generated ID for demo mode
    return {
      ...source,
      id: source.id || `demo-${Date.now()}`,
      user_id: 'demo'
    };
  }
  
  if (source.id) {
    const { data, error } = await supabase
      .from('sources')
      .update({ ...source, user_id: userId })
      .eq('id', source.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('sources')
      .insert({ ...source, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const deleteSource = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('sources')
    .delete()
    .eq('id', id);
  
  return !error;
};

// Situations
export const getSituations = async (): Promise<Situation[]> => {
  try {
    if (!isSupabaseConfigured()) {
      return getDemoSituations();
    }
    
    const { data, error } = await supabase
      .from('situations')
      .select('*')
      .order('name');
    
    if (error) {
      console.warn('Error fetching situations:', error);
      return getDemoSituations();
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching situations:', error);
    return getDemoSituations();
  }
};

export const saveSituation = async (situation: Omit<Situation, 'id'> & { id?: string }): Promise<Situation> => {
  const userId = await getCurrentUserId();
  
  if (!userId || !isSupabaseConfigured()) {
    return {
      ...situation,
      id: situation.id || `demo-${Date.now()}`,
      user_id: 'demo'
    };
  }
  
  if (situation.id) {
    const { data, error } = await supabase
      .from('situations')
      .update({ ...situation, user_id: userId })
      .eq('id', situation.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('situations')
      .insert({ ...situation, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const deleteSituation = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('situations')
    .delete()
    .eq('id', id);
  
  return !error;
};

// Groups
export const getGroups = async (): Promise<Group[]> => {
  try {
    if (!isSupabaseConfigured()) {
      return getDemoGroups();
    }
    
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('name');
    
    if (error) {
      console.warn('Error fetching groups:', error);
      return getDemoGroups();
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    return getDemoGroups();
  }
};

export const saveGroup = async (group: Omit<Group, 'id'> & { id?: string }): Promise<Group> => {
  const userId = await getCurrentUserId();
  
  if (!userId || !isSupabaseConfigured()) {
    return {
      ...group,
      id: group.id || `demo-${Date.now()}`,
      user_id: 'demo'
    };
  }
  
  if (group.id) {
    const { data, error } = await supabase
      .from('groups')
      .update({ ...group, user_id: userId })
      .eq('id', group.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('groups')
      .insert({ ...group, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const deleteGroup = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id);
  
  return !error;
};

// Campaigns
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, returning demo campaigns');
      return getDemoCampaigns();
    }
    
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Error fetching campaigns from Supabase:', error);
      return getDemoCampaigns();
    }
    
    return data?.map(campaign => ({
      ...campaign,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      defaultSourceId: campaign.default_source_id,
      defaultGroupId: campaign.default_group_id,
      surveyCustomization: campaign.survey_customization,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at
    })) || [];
    
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return getDemoCampaigns();
  }
};

const getDemoCampaigns = (): Campaign[] => [
  {
    id: '1',
    name: 'Customer Satisfaction Survey',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    description: 'Measuring overall customer satisfaction',
    active: true,
    defaultSourceId: '1',
    defaultGroupId: '1',
    surveyCustomization: {
      backgroundType: 'color',
      backgroundColor: '#f8fafc',
      primaryColor: '#00ac75',
      textColor: '#1f2937'
    },
    automation: {
      enabled: false,
      action: 'return_only',
      successMessage: 'Obrigado pelo seu feedback!',
      errorMessage: 'Ocorreu um erro. Tente novamente.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const saveCampaign = async (campaign: Campaign): Promise<Campaign> => {
  const userId = await getCurrentUserId();
  
  if (!userId || !isSupabaseConfigured()) {
    return {
      ...campaign,
      id: campaign.id || `demo-${Date.now()}`,
      createdAt: campaign.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  const campaignData = {
    name: campaign.name,
    description: campaign.description,
    start_date: campaign.startDate,
    end_date: campaign.endDate,
    active: campaign.active,
    default_source_id: campaign.defaultSourceId,
    default_group_id: campaign.defaultGroupId,
    survey_customization: campaign.surveyCustomization,
    automation: campaign.automation,
    user_id: userId
  };
  
  if (campaign.id) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(campaignData)
      .eq('id', campaign.id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...campaign,
      updatedAt: data.updated_at
    };
  } else {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...campaign,
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};

export const deleteCampaign = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);
  
  return !error;
};

// Campaign Forms
export const getCampaignForm = async (campaignId: string): Promise<CampaignForm | null> => {
  try {
    if (!isSupabaseConfigured()) {
      // Return demo form for development
      return {
        id: 'demo-form',
        campaignId,
        fields: [
          {
            id: 'nps-field',
            type: 'nps',
            label: 'O quanto você recomendaria nosso serviço para um amigo ou colega?',
            required: true,
            order: 0,
          },
          {
            id: 'feedback-field',
            type: 'text',
            label: 'Por favor, compartilhe seu feedback',
            required: false,
            order: 1,
          }
        ]
      };
    }
    
    const { data, error } = await supabase
      .from('campaign_forms')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    
    if (!data) {
      // If no form found, create a default one
      return {
        id: 'default-form',
        campaignId,
        fields: [
          {
            id: 'nps-field',
            type: 'nps',
            label: 'O quanto você recomendaria nosso serviço para um amigo ou colega?',
            required: true,
            order: 0,
          },
          {
            id: 'feedback-field',
            type: 'text',
            label: 'Por favor, compartilhe seu feedback',
            required: false,
            order: 1,
          }
        ]
      };
    }
    
    return {
      id: data.id,
      campaignId: data.campaign_id,
      fields: data.fields
    };
  } catch (error) {
    console.error('Error fetching campaign form:', error);
    // Return a default form in case of error
    return {
      id: 'default-form',
      campaignId,
      fields: [
        {
          id: 'nps-field',
          type: 'nps',
          label: 'O quanto você recomendaria nosso serviço para um amigo ou colega?',
          required: true,
          order: 0,
        },
        {
          id: 'feedback-field',
          type: 'text',
          label: 'Por favor, compartilhe seu feedback',
          required: false,
          order: 1,
        }
      ]
    };
  }
};

export const saveCampaignForm = async (form: CampaignForm): Promise<CampaignForm> => {
  const userId = await getCurrentUserId();
  
  const formData = {
    campaign_id: form.campaignId,
    fields: form.fields,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('campaign_forms')
    .upsert(formData, { onConflict: 'campaign_id' })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    campaignId: data.campaign_id,
    fields: data.fields
  };
};

// NPS Responses
export const getResponses = async (campaignId?: string): Promise<NpsResponse[]> => {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, returning demo responses');
      // Return demo data for development
      return getDemoResponses(campaignId);
    }

    try {
      let query = supabase
        .from('nps_responses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.warn('Supabase query error:', error);
        return getDemoResponses(campaignId);
      }
      
      return data?.map(response => ({
        ...response,
        campaignId: response.campaign_id,
        sourceId: response.source_id,
        situationId: response.situation_id,
        groupId: response.group_id,
        formResponses: response.form_responses,
        createdAt: response.created_at
      })) || [];
    } catch (fetchError) {
      console.warn('Fetch error in getResponses:', fetchError);
      return getDemoResponses(campaignId);
    }
  } catch (error) {
    console.error('Error fetching responses:', error);
    // Return empty array for demo mode
    return getDemoResponses(campaignId);
  }
};

// Helper function to generate demo responses
const getDemoResponses = (campaignId?: string): NpsResponse[] => {
  if (!campaignId) return [];
  
  // Generate some random demo responses for the specified campaign
  const demoResponses: NpsResponse[] = [];
  const now = new Date();
  
  // Generate 5 random responses
  for (let i = 0; i < 5; i++) {
    const score = Math.floor(Math.random() * 11); // 0-10
    const date = new Date(now);
    date.setDate(date.getDate() - i); // Spread out over the last few days
    
    demoResponses.push({
      id: `demo-${campaignId}-${i}`,
      campaignId: campaignId,
      score: score,
      feedback: score >= 9 ? "Great service!" : score <= 6 ? "Needs improvement" : "It was okay",
      sourceId: "1", // Default source ID
      situationId: "1", // Default situation ID
      groupId: "1", // Default group ID
      formResponses: {},
      createdAt: date.toISOString()
    });
  }
  
  return demoResponses;
};

export const saveResponse = async (response: NpsResponse): Promise<NpsResponse> => {
  const responseData = {
    id: response.id,
    campaign_id: response.campaignId,
    score: response.score,
    feedback: response.feedback,
    source_id: response.sourceId,
    situation_id: response.situationId,
    group_id: response.groupId,
    form_responses: response.formResponses
  };
  
  const { data, error } = await supabase
    .from('nps_responses')
    .insert(responseData)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...response,
    createdAt: data.created_at
  };
};

// Contacts
export const getContacts = async (): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data?.map(contact => ({
    ...contact,
    groupIds: contact.group_ids,
    lastContactDate: contact.last_contact_date,
    createdAt: contact.created_at,
    updatedAt: contact.updated_at
  })) || [];
};

export const saveContact = async (contact: Contact): Promise<Contact> => {
  const userId = await getCurrentUserId();
  
  const contactData = {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    position: contact.position,
    group_ids: contact.groupIds,
    tags: contact.tags,
    notes: contact.notes,
    last_contact_date: contact.lastContactDate,
    user_id: userId
  };
  
  if (contact.id) {
    const { data, error } = await supabase
      .from('contacts')
      .update(contactData)
      .eq('id', contact.id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...contact,
      updatedAt: data.updated_at
    };
  } else {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...contact,
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};

export const deleteContact = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);
  
  return !error;
};

export const searchContacts = async (query: string): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,company.ilike.%${query}%`)
    .order('name');
  
  if (error) throw error;
  return data?.map(contact => ({
    ...contact,
    groupIds: contact.group_ids,
    lastContactDate: contact.last_contact_date,
    createdAt: contact.created_at,
    updatedAt: contact.updated_at
  })) || [];
};

export const getContactsByGroup = async (groupId: string): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .contains('group_ids', [groupId])
    .order('name');
  
  if (error) throw error;
  return data?.map(contact => ({
    ...contact,
    groupIds: contact.group_ids,
    lastContactDate: contact.last_contact_date,
    createdAt: contact.created_at,
    updatedAt: contact.updated_at
  })) || [];
};

// User Profile
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  
  if (!data) {
    // Create default profile
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;
    
    const defaultProfile = {
      user_id: userId,
      name: user.user.user_metadata?.name || user.user.email?.split('@')[0] || 'User',
      phone: '',
      company: '',
      position: '',
      avatar: '',
      preferences: {
        language: 'pt-BR',
        theme: 'light',
        emailNotifications: {
          newResponses: true,
          weeklyReports: true,
          productUpdates: false
        }
      }
    };
    
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert(defaultProfile)
      .select()
      .single();
    
    if (createError) throw createError;
    
    return {
      id: newProfile.id,
      name: newProfile.name,
      email: user.user.email || '',
      phone: newProfile.phone,
      company: newProfile.company,
      position: newProfile.position,
      avatar: newProfile.avatar,
      preferences: newProfile.preferences,
      createdAt: newProfile.created_at,
      updatedAt: newProfile.updated_at
    };
  }
  
  const { data: user } = await supabase.auth.getUser();
  
  return {
    id: data.id,
    name: data.name,
    email: user.user?.email || '',
    phone: data.phone,
    company: data.company,
    position: data.position,
    avatar: data.avatar,
    preferences: data.preferences,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const saveUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
  const userId = await getCurrentUserId();
  
  const profileData = {
    name: profile.name,
    phone: profile.phone,
    company: profile.company,
    position: profile.position,
    avatar: profile.avatar,
    preferences: profile.preferences,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profileData, { onConflict: 'user_id' })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...profile,
    id: data.id,
    updatedAt: data.updated_at
  };
};

// App Config
export const getAppConfig = async (): Promise<AppConfig> => {
  const userId = await getCurrentUserId();
  
  if (!userId || !isSupabaseConfigured()) {
    // Return default config when user is not authenticated
    return {
      themeColor: '#00ac75',
      language: 'pt-BR',
      company: {
        name: '',
        document: '',
        address: '',
        email: '',
        phone: '',
      },
      integrations: {
        smtp: {
          enabled: false,
          host: '',
          port: 587,
          secure: false,
          username: '',
          password: '',
          fromName: '',
          fromEmail: '',
        },
        zenvia: {
          email: {
            enabled: false,
            apiKey: '',
            fromEmail: '',
            fromName: '',
          },
          sms: {
            enabled: false,
            apiKey: '',
            from: '',
          },
          whatsapp: {
            enabled: false,
            apiKey: '',
            from: '',
          },
        },
      },
    };
  }
  
  const { data, error } = await supabase
    .from('app_configs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') throw error;
  
  const defaultConfig: AppConfig = {
    themeColor: '#00ac75',
    language: 'pt-BR',
    company: {
      name: '',
      document: '',
      address: '',
      email: '',
      phone: '',
    },
    integrations: {
      smtp: {
        enabled: false,
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromName: '',
        fromEmail: '',
      },
      zenvia: {
        email: {
          enabled: false,
          apiKey: '',
          fromEmail: '',
          fromName: '',
        },
        sms: {
          enabled: false,
          apiKey: '',
          from: '',
        },
        whatsapp: {
          enabled: false,
          apiKey: '',
          from: '',
        },
      },
    },
  };
  
  if (!data) {
    const { data: newConfig, error: createError } = await supabase
      .from('app_configs')
      .insert({
        user_id: userId,
        theme_color: defaultConfig.themeColor,
        language: defaultConfig.language,
        company: defaultConfig.company,
        integrations: defaultConfig.integrations
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    return {
      themeColor: newConfig.theme_color,
      language: newConfig.language,
      company: newConfig.company,
      integrations: newConfig.integrations
    };
  }
  
  return {
    themeColor: data.theme_color,
    language: data.language,
    company: data.company,
    integrations: data.integrations
  };
};

export const saveAppConfig = async (config: AppConfig): Promise<AppConfig> => {
  const userId = await getCurrentUserId();
  
  if (!userId || !isSupabaseConfigured()) {
    // Return the config as-is for demo mode
    return config;
  }
  
  const configData = {
    theme_color: config.themeColor,
    language: config.language,
    company: config.company,
    integrations: config.integrations,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('app_configs')
    .upsert(configData, { onConflict: 'user_id' })
    .select()
    .single();
  
  if (error) throw error;
  
  return config;
};

// Initialize default data for new users
export const initializeDefaultData = async (): Promise<void> => {
  try {
    // Get current user ID
    let userId = await getCurrentUserId();
    
    // Only initialize data if we have a valid authenticated user and Supabase is configured
    if (!userId || !isSupabaseConfigured()) {
      console.log('Skipping default data initialization - no authenticated user or Supabase not configured');
      return;
    }

    console.log('Initializing default data for user:', userId);
    
    // Check if user already has data
    const { data: existingSources } = await supabase
      .from('sources')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (existingSources && existingSources.length > 0) {
      console.log('User already has data, skipping initialization');
      return; // User already has data
    }
    
    // Create default sources
    const defaultSources = [
      { name: 'WhatsApp', color: '#25D366', user_id: userId },
      { name: 'Email', color: '#4285F4', user_id: userId },
      { name: 'Telefone', color: '#FF9800', user_id: userId },
      { name: 'Website', color: '#673AB7', user_id: userId },
    ];
    
    console.log('Creating default sources');
    await supabase.from('sources').insert(defaultSources);
    
    // Create default situations
    const defaultSituations = [
      { name: 'Respondido', color: '#4CAF50', user_id: userId },
      { name: 'Pendente', color: '#FFC107', user_id: userId },
      { name: 'Ignorado', color: '#F44336', user_id: userId },
    ];
    
    console.log('Creating default situations');
    await supabase.from('situations').insert(defaultSituations);
    
    // Create default groups
    const defaultGroups = [
      { name: 'Clientes Premium', user_id: userId },
      { name: 'Clientes Regulares', user_id: userId },
      { name: 'Testes Internos', user_id: userId },
    ];
    
    console.log('Creating default groups');
    await supabase.from('groups').insert(defaultGroups);
    
    console.log('Default data initialization complete');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};