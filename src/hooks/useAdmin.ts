import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';

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
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check admin status through API
        const result = await apiClient.getCurrentUser();
        if (result.success && result.user.role === 'admin') {
          setIsAdmin(true);
          setPermissions({ view_users: true, view_subscriptions: true });
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
    if (!isAdmin || !permissions.view_users) {
      return [];
    }

    try {
      const result = await apiClient.getAdminUsers();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  };

  const deactivateUser = async (userId: string): Promise<boolean> => {
    try {
      if (!isAdmin || !permissions.view_users) {
        throw new Error('Access denied');
      }

      await apiClient.deactivateUser(userId);
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  };

  const reactivateUser = async (userId: string): Promise<boolean> => {
    try {
      if (!isAdmin || !permissions.view_users) {
        throw new Error('Access denied');
      }

      await apiClient.reactivateUser(userId);
      return true;
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  };

  const deleteUserAccount = async (userId: string): Promise<boolean> => {
    try {
      if (!isAdmin || !permissions.view_users) {
        throw new Error('Access denied');
      }

      await apiClient.deleteUser(userId);
      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  };

  const getAdminSubscriptions = async (): Promise<AdminSubscription[]> => {
    if (!isAdmin || !permissions.view_subscriptions) {
      return [];
    }

    try {
      // For now, return empty array since we're not implementing Stripe in the Node.js backend
      return [];
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