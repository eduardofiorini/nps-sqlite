export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'pending';
  subscription?: {
    plan: string;
    status: string;
    current_period_end: number;
    cancel_at_period_end: boolean;
  };
  stats: {
    campaigns: number;
    responses: number;
    lastLogin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    campaigns: number | 'unlimited';
    responses: number | 'unlimited';
    users: number | 'unlimited';
  };
  active: boolean;
  popular?: boolean;
  stripePriceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminConfig {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'general' | 'email' | 'payment' | 'security' | 'features';
  description: string;
  editable: boolean;
  sensitive?: boolean;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCampaigns: number;
  totalResponses: number;
  revenue: {
    monthly: number;
    total: number;
  };
  growth: {
    users: number;
    revenue: number;
  };
}