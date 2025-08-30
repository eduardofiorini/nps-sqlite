// API client for Node.js backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.token) {
      this.token = result.token;
      localStorage.setItem('auth_token', result.token);
    }

    return result;
  }

  async register(email: string, password: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteAccount(confirmationEmail: string) {
    return this.request('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ confirmationEmail }),
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Campaign methods
  async getCampaigns() {
    return this.request('/campaigns');
  }

  async getCampaign(id: string) {
    return this.request(`/campaigns/${id}`);
  }

  async createCampaign(campaign: any) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  async updateCampaign(id: string, campaign: any) {
    return this.request(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaign),
    });
  }

  async deleteCampaign(id: string) {
    return this.request(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  // Response methods
  async getResponses(campaignId?: string) {
    const endpoint = campaignId ? `/responses/campaign/${campaignId}` : '/responses';
    return this.request(endpoint);
  }

  async submitResponse(response: any) {
    return this.request('/responses/submit', {
      method: 'POST',
      body: JSON.stringify(response),
    });
  }

  // Form methods
  async getCampaignForm(campaignId: string) {
    return this.request(`/forms/campaign/${campaignId}`);
  }

  async saveCampaignForm(campaignId: string, fields: any[]) {
    return this.request(`/forms/campaign/${campaignId}`, {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });
  }

  // Contact methods
  async getContacts() {
    return this.request('/contacts');
  }

  async createContact(contact: any) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async updateContact(id: string, contact: any) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async searchContacts(query: string) {
    return this.request(`/contacts/search?q=${encodeURIComponent(query)}`);
  }

  // Entity methods (sources, situations, groups)
  async getEntities(type: 'sources' | 'situations' | 'groups') {
    return this.request(`/entities/${type}`);
  }

  async createEntity(type: 'sources' | 'situations' | 'groups', entity: any) {
    return this.request(`/entities/${type}`, {
      method: 'POST',
      body: JSON.stringify(entity),
    });
  }

  async updateEntity(type: 'sources' | 'situations' | 'groups', id: string, entity: any) {
    return this.request(`/entities/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entity),
    });
  }

  async deleteEntity(type: 'sources' | 'situations' | 'groups', id: string) {
    return this.request(`/entities/${type}/${id}`, {
      method: 'DELETE',
    });
  }

  // Profile methods
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(profile: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Config methods
  async getConfig() {
    return this.request('/config');
  }

  async updateConfig(config: any) {
    return this.request('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Affiliate methods
  async getAffiliate() {
    return this.request('/affiliate');
  }

  async updateAffiliate(affiliate: any) {
    return this.request('/affiliate', {
      method: 'PUT',
      body: JSON.stringify(affiliate),
    });
  }

  async getAffiliateReferrals() {
    return this.request('/affiliate/referrals');
  }

  async createAffiliateReferral(affiliateCode: string, referredUserId: string, subscriptionId?: string, commissionAmount?: number) {
    return this.request('/affiliate/referrals', {
      method: 'POST',
      body: JSON.stringify({
        affiliate_code: affiliateCode,
        referred_user_id: referredUserId,
        subscription_id: subscriptionId,
        commission_amount: commissionAmount
      }),
    });
  }

  // Admin methods
  async getAdminUsers() {
    return this.request('/admin/users');
  }

  async deactivateUser(userId: string) {
    return this.request(`/admin/users/${userId}/deactivate`, {
      method: 'POST',
    });
  }

  async reactivateUser(userId: string) {
    return this.request(`/admin/users/${userId}/reactivate`, {
      method: 'POST',
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAdminAffiliateReferrals() {
    return this.request('/admin/affiliate/referrals');
  }

  async updateReferralStatus(referralId: string, status: string) {
    return this.request(`/admin/affiliate/referrals/${referralId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Email methods
  async sendTestEmail(smtpConfig: any) {
    return this.request('/email/test', {
      method: 'POST',
      body: JSON.stringify({ smtpConfig }),
    });
  }

  async sendCampaignEmails(campaignId: string, contactIds: string[], subject: string, message: string, includeLink: boolean) {
    return this.request('/email/campaign', {
      method: 'POST',
      body: JSON.stringify({
        campaignId,
        contactIds,
        subject,
        message,
        includeLink
      }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;