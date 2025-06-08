import { AppConfig, Campaign, CampaignForm, Group, NpsResponse, Situation, Source, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  CAMPAIGNS: 'campaigns',
  RESPONSES: 'responses',
  FORMS: 'forms',
  SOURCES: 'sources',
  SITUATIONS: 'situations',
  GROUPS: 'groups',
  CONFIG: 'app_config',
};

// Default data
const DEFAULT_CONFIG: AppConfig = {
  themeColor: '#3B82F6',
  logoUrl: '',
  defaultEmail: 'nps@example.com',
  language: 'en',
};

// Authentication
export const getAuthUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  return userData ? JSON.parse(userData) : null;
};

export const setAuthUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
};

// Campaign management
export const getCampaigns = (): Campaign[] => {
  const campaigns = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
  return campaigns ? JSON.parse(campaigns) : [];
};

export const saveCampaign = (campaign: Campaign): Campaign => {
  const campaigns = getCampaigns();
  const newCampaign = {
    ...campaign,
    id: campaign.id || uuidv4(),
    createdAt: campaign.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const index = campaigns.findIndex(c => c.id === newCampaign.id);
  
  if (index >= 0) {
    campaigns[index] = newCampaign;
  } else {
    campaigns.push(newCampaign);
  }
  
  localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  return newCampaign;
};

export const deleteCampaign = (id: string): boolean => {
  const campaigns = getCampaigns();
  const filtered = campaigns.filter(c => c.id !== id);
  
  if (filtered.length !== campaigns.length) {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(filtered));
    
    // Also clean up related data
    deleteCampaignData(id);
    
    return true;
  }
  
  return false;
};

// Helper function to delete all campaign-related data
const deleteCampaignData = (campaignId: string): void => {
  // Delete campaign form
  const formKey = `forms_${campaignId}`;
  localStorage.removeItem(formKey);
  
  // Delete campaign responses
  const allResponses = getResponses();
  const filteredResponses = allResponses.filter(r => r.campaignId !== campaignId);
  localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(filteredResponses));
};

// NPS Responses
export const getResponses = (campaignId?: string): NpsResponse[] => {
  const responses = localStorage.getItem(STORAGE_KEYS.RESPONSES);
  const allResponses = responses ? JSON.parse(responses) : [];
  
  return campaignId 
    ? allResponses.filter((r: NpsResponse) => r.campaignId === campaignId)
    : allResponses;
};

export const saveResponse = (response: NpsResponse): NpsResponse => {
  const responses = getResponses();
  const newResponse = {
    ...response,
    id: response.id || uuidv4(),
    createdAt: response.createdAt || new Date().toISOString(),
  };
  
  const index = responses.findIndex((r: NpsResponse) => r.id === newResponse.id);
  
  if (index >= 0) {
    responses[index] = newResponse;
  } else {
    responses.push(newResponse);
  }
  
  localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
  return newResponse;
};

// Forms
export const getCampaignForm = (campaignId: string): CampaignForm | null => {
  const formKey = `forms_${campaignId}`;
  const formData = localStorage.getItem(formKey);
  
  if (!formData) {
    console.log(`No form found for campaign ${campaignId}`);
    return null;
  }
  
  const form = JSON.parse(formData);
  
  // Ensure fields are properly ordered
  if (form.fields) {
    form.fields = form.fields
      .map((field: FormField, index: number) => ({
        ...field,
        order: field.order !== undefined ? field.order : index
      }))
      .sort((a: FormField, b: FormField) => a.order - b.order);
  }
  
  console.log(`Loaded form for campaign ${campaignId}:`, form.fields?.map((f: FormField) => ({ id: f.id, label: f.label, order: f.order })));
  
  return form;
};

export const saveCampaignForm = (form: CampaignForm): CampaignForm => {
  const formKey = `forms_${form.campaignId}`;
  
  // Ensure all fields have proper order values
  const fieldsWithOrder = form.fields.map((field, index) => ({
    ...field,
    order: field.order !== undefined ? field.order : index
  }));
  
  // Sort fields by order to maintain consistency
  const sortedFields = fieldsWithOrder.sort((a, b) => a.order - b.order);
  
  const newForm = {
    ...form,
    id: form.id || uuidv4(),
    fields: sortedFields
  };
  
  console.log(`Saving form for campaign ${form.campaignId}:`, sortedFields.map(f => ({ id: f.id, label: f.label, order: f.order })));
  
  localStorage.setItem(formKey, JSON.stringify(newForm));
  return newForm;
};

// Sources
export const getSources = (): Source[] => {
  const sources = localStorage.getItem(STORAGE_KEYS.SOURCES);
  return sources ? JSON.parse(sources) : [];
};

export const saveSource = (source: Source): Source => {
  const sources = getSources();
  const newSource = {
    ...source,
    id: source.id || uuidv4(),
  };
  
  const index = sources.findIndex(s => s.id === newSource.id);
  
  if (index >= 0) {
    sources[index] = newSource;
  } else {
    sources.push(newSource);
  }
  
  localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  return newSource;
};

export const deleteSource = (id: string): boolean => {
  const sources = getSources();
  const filtered = sources.filter(s => s.id !== id);
  
  if (filtered.length !== sources.length) {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(filtered));
    return true;
  }
  
  return false;
};

// Situations
export const getSituations = (): Situation[] => {
  const situations = localStorage.getItem(STORAGE_KEYS.SITUATIONS);
  return situations ? JSON.parse(situations) : [];
};

export const saveSituation = (situation: Situation): Situation => {
  const situations = getSituations();
  const newSituation = {
    ...situation,
    id: situation.id || uuidv4(),
  };
  
  const index = situations.findIndex(s => s.id === newSituation.id);
  
  if (index >= 0) {
    situations[index] = newSituation;
  } else {
    situations.push(newSituation);
  }
  
  localStorage.setItem(STORAGE_KEYS.SITUATIONS, JSON.stringify(situations));
  return newSituation;
};

export const deleteSituation = (id: string): boolean => {
  const situations = getSituations();
  const filtered = situations.filter(s => s.id !== id);
  
  if (filtered.length !== situations.length) {
    localStorage.setItem(STORAGE_KEYS.SITUATIONS, JSON.stringify(filtered));
    return true;
  }
  
  return false;
};

// Groups
export const getGroups = (): Group[] => {
  const groups = localStorage.getItem(STORAGE_KEYS.GROUPS);
  return groups ? JSON.parse(groups) : [];
};

export const saveGroup = (group: Group): Group => {
  const groups = getGroups();
  const newGroup = {
    ...group,
    id: group.id || uuidv4(),
  };
  
  const index = groups.findIndex(g => g.id === newGroup.id);
  
  if (index >= 0) {
    groups[index] = newGroup;
  } else {
    groups.push(newGroup);
  }
  
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  return newGroup;
};

export const deleteGroup = (id: string): boolean => {
  const groups = getGroups();
  const filtered = groups.filter(g => g.id !== id);
  
  if (filtered.length !== groups.length) {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(filtered));
    return true;
  }
  
  return false;
};

// App config
export const getAppConfig = (): AppConfig => {
  const config = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return config ? JSON.parse(config) : DEFAULT_CONFIG;
};

export const saveAppConfig = (config: AppConfig): AppConfig => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  return config;
};

// Initialize default data
export const initializeDefaultData = () => {
  // Only initialize if data doesn't exist
  if (!localStorage.getItem(STORAGE_KEYS.SOURCES)) {
    const defaultSources: Source[] = [
      { id: uuidv4(), name: 'WhatsApp', color: '#25D366' },
      { id: uuidv4(), name: 'Email', color: '#4285F4' },
      { id: uuidv4(), name: 'Phone', color: '#FF9800' },
      { id: uuidv4(), name: 'Website', color: '#673AB7' },
    ];
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(defaultSources));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITUATIONS)) {
    const defaultSituations: Situation[] = [
      { id: uuidv4(), name: 'Responded', color: '#4CAF50' },
      { id: uuidv4(), name: 'Pending', color: '#FFC107' },
      { id: uuidv4(), name: 'Ignored', color: '#F44336' },
    ];
    localStorage.setItem(STORAGE_KEYS.SITUATIONS, JSON.stringify(defaultSituations));
  }

  if (!localStorage.getItem(STORAGE_KEYS.GROUPS)) {
    const defaultGroups: Group[] = [
      { id: uuidv4(), name: 'Premium Customers' },
      { id: uuidv4(), name: 'Regular Customers' },
      { id: uuidv4(), name: 'Internal Tests' },
    ];
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(defaultGroups));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
  }
};