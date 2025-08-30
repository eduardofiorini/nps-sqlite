export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'admin' | 'user';
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  is_deactivated: boolean;
  trial_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  active: boolean;
  default_source_id?: string;
  default_group_id?: string;
  survey_customization: any;
  automation: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignForm {
  id: string;
  campaign_id: string;
  fields: any[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface NpsResponse {
  id: string;
  campaign_id: string;
  score: number;
  feedback?: string;
  source_id?: string;
  situation_id?: string;
  group_id?: string;
  form_responses: any;
  created_at: string;
}

export interface Source {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Situation {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  group_ids: string[];
  tags: string[];
  notes?: string;
  last_contact_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  preferences: any;
  trial_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface AppConfig {
  id: string;
  user_id: string;
  theme_color: string;
  language: string;
  company: any;
  integrations: any;
  created_at: string;
  updated_at: string;
}

export interface UserAffiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  bank_account: any;
  total_referrals: number;
  total_earnings: number;
  total_received: number;
  total_pending: number;
  created_at: string;
  updated_at: string;
}

export interface AffiliateReferral {
  id: string;
  affiliate_user_id: string;
  referred_user_id: string;
  subscription_id?: string;
  commission_amount: number;
  commission_status: 'pending' | 'paid' | 'cancelled';
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAdmin {
  id: string;
  user_id: string;
  permissions: any;
  created_at: string;
  updated_at: string;
}