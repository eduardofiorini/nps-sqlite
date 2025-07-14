// This file is deprecated - all functions now use Supabase
// Import from supabaseStorage instead
export * from './supabaseStorage';

// Legacy functions for subscription (still using localStorage until Stripe integration)
import { Subscription, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const getSubscription = (): Subscription | null => {
  const subscriptionData = localStorage.getItem('subscription');
  if (subscriptionData) {
    return JSON.parse(subscriptionData);
  }
  
  // Create default subscription
  const authUser = getAuthUser();
  if (authUser) {
    const defaultSubscription: Subscription = {
      id: uuidv4(),
      userId: authUser.id,
      planId: 'pro',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSubscription(defaultSubscription);
    return defaultSubscription;
  }
  
  return null;
};

export const saveSubscription = (subscription: Subscription): Subscription => {
  const updatedSubscription = {
    ...subscription,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem('subscription', JSON.stringify(updatedSubscription));
  return updatedSubscription;
};

export const getAuthUser = (): User | null => {
  const userData = localStorage.getItem('auth_user');
  return userData ? JSON.parse(userData) : null;
};

export const setAuthUser = (user: User): void => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem('auth_user');
};