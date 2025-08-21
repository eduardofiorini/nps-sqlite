import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AdminPermissions {
  view_users: boolean;
  view_subscriptions: boolean;
}

export interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  preferences: any;
  created_at: string;
  updated_at: string;
  trial_start_date?: string;
  is_deactivated?: boolean;
  deactivated_at?: string;
  deactivated_by?: string;
}

export interface AdminSubscription {
  user_id: string;
  customer_id: string;
  subscription_id?: string;
  subscription_status?: string;
  price_id?: string;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  payment_method_brand?: string;
  payment_method_last4?: string;
  user_name?: string;
  user_email?: string;
  user_company?: string;
  created_at?: string;
  updated_at?: string;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<AdminPermissions>({
    view_users: false,
    view_subscriptions: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !isSupabaseConfigured()) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_admin')
          .select('permissions')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Error checking admin status:', error);
          setIsAdmin(false);
          setPermissions({ view_users: false, view_subscriptions: false });
        } else if (data) {
          setIsAdmin(true);
          setPermissions(data.permissions || { view_users: false, view_subscriptions: false });
        } else {
          setIsAdmin(false);
          setPermissions({ view_users: false, view_subscriptions: false });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setPermissions({ view_users: false, view_subscriptions: false });
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const getAdminUsers = async (): Promise<AdminUser[]> => {
    if (!isAdmin || !permissions.view_users || !isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (!token) {
        console.error('No authentication token found');
        return [];
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-admin-users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Error fetching admin users:', result.error);
        return [];
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  };

  const deactivateUser = async (userId: string): Promise<boolean> => {
    if (!isAdmin || !permissions.view_users || !isSupabaseConfigured()) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('deactivate_user', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error deactivating user:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  };

  const reactivateUser = async (userId: string): Promise<boolean> => {
    if (!isAdmin || !permissions.view_users || !isSupabaseConfigured()) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('reactivate_user', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error reactivating user:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  };

  const deleteUserAccount = async (userId: string): Promise<boolean> => {
    if (!isAdmin || !permissions.view_users || !isSupabaseConfigured()) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('delete_user_account_admin', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error deleting user account:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  };

  const getAdminSubscriptions = async (): Promise<AdminSubscription[]> => {
    if (!isAdmin || !permissions.view_subscriptions || !isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase.rpc('get_admin_subscriptions');

      if (error) {
        console.error('Error fetching admin subscriptions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching admin subscriptions:', error);
      return [];
    }
  };

  return {
    isAdmin,
    permissions,
    loading,
    getAdminUsers,
    getAdminSubscriptions,
    deactivateUser,
    reactivateUser,
    deleteUserAccount
  };
};