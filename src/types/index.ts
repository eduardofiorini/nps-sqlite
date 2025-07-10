// Common types used throughout the application

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Campaign = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Survey customization
  surveyCustomization?: SurveyCustomization;
  // Default source and group for responses
  defaultSourceId?: string;
  defaultGroupId?: string;
  // Automation settings
  automation?: CampaignAutomation;
};

export type SurveyCustomization = {
  backgroundType: 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: string;
  logoImage?: string;
  primaryColor?: string;
  textColor?: string;
};

export type CampaignAutomation = {
  enabled: boolean;
  action: 'webhook_return' | 'webhook_redirect' | 'redirect_only' | 'return_only';
  webhookUrl?: string;
  redirectUrl?: string;
  webhookHeaders?: Record<string, string>;
  webhookPayload?: string;
  successMessage?: string;
  errorMessage?: string;
};

export type NpsResponse = {
  id: string;
  campaignId: string;
  score: number; // 0-10
  feedback: string;
  sourceId: string;
  situationId: string;
  groupId: string;
  createdAt: string;
  // Store all form field responses
  formResponses: Record<string, any>;
};

export type FormField = {
  id: string;
  type: 'nps' | 'text' | 'select' | 'radio';
  label: string;
  required: boolean;
  options?: string[]; // For select and radio fields
  order: number;
};

export type CampaignForm = {
  id: string;
  campaignId: string;
  fields: FormField[];
};

export type Source = {
  id: string;
  name: string;
  description?: string;
  color?: string;
};

export type Situation = {
  id: string;
  name: string;
  description?: string;
  color?: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  groupIds: string[]; // Array of group IDs
  tags?: string[];
  notes?: string;
  company?: string;
  position?: string;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppConfig = {
  themeColor: string;
  language: 'en' | 'pt-BR';
  company: {
    name: string;
    document: string;
    address: string;
    email: string;
    phone: string;
  };
  integrations: {
    smtp: {
      enabled: boolean;
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
      fromName: string;
      fromEmail: string;
    };
    zenvia: {
      email: {
        enabled: boolean;
        apiKey: string;
        fromEmail: string;
        fromName: string;
      };
      sms: {
        enabled: boolean;
        apiKey: string;
        from: string;
      };
      whatsapp: {
        enabled: boolean;
        apiKey: string;
        from: string;
      };
    };
  };
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  preferences: {
    language: 'en' | 'pt-BR';
    theme: 'light' | 'dark';
    emailNotifications: {
      newResponses: boolean;
      weeklyReports: boolean;
      productUpdates: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: string[];
  limits: {
    responses: number | 'unlimited';
    campaigns: number | 'unlimited';
    users: number | 'unlimited';
  };
  popular?: boolean;
  icon: string;
  color: string;
};