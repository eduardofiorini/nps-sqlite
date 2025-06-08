// Common types used throughout the application

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
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
};

export type SurveyCustomization = {
  backgroundType: 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: string;
  logoImage?: string;
  primaryColor?: string;
  textColor?: string;
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

export type AppConfig = {
  themeColor: string;
  logoUrl: string;
  defaultEmail: string;
  language: 'en' | 'pt-BR';
};