import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTrial } from '../../hooks/useTrial';
import { useSubscription } from '../../hooks/useSubscription';
import TrialExpired from '../../pages/TrialExpired';

interface TrialGuardProps {
  children: React.ReactNode;
}

const TrialGuard: React.FC<TrialGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const { trialInfo, loading: trialLoading } = useTrial();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const location = useLocation();
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  React.useEffect(() => {
    if (!trialLoading && !subscriptionLoading) {
      // Add a small delay to ensure all data is loaded
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [trialLoading, subscriptionLoading]);

  // Debug logging
  React.useEffect(() => {
    console.log('🛡️ TrialGuard state:', {
      userId: user?.id,
      trialLoading,
      subscriptionLoading,
      initialLoadComplete,
      isTrialExpired: trialInfo.isTrialExpired,
      isTrialActive: trialInfo.isTrialActive,
      subscriptionStatus: subscription?.status,
      currentPath: location.pathname,
      daysRemaining: trialInfo.daysRemaining
    });
  }, [trialLoading, subscriptionLoading, initialLoadComplete, trialInfo, subscription?.status, location.pathname]);

  // Show loading while checking trial and subscription status
  if (trialLoading || subscriptionLoading || !initialLoadComplete) {
    console.log('🔄 TrialGuard: Still loading...');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ac75]"></div>
      </div>
    );
  }

  // If user has active subscription, allow access
  if (subscription?.status === 'active') {
    console.log('✅ TrialGuard: User has active subscription, allowing access');
    return <>{children}</>;
  }

  // If trial is expired and no active subscription, redirect to pricing or show trial expired page
  if (trialInfo.isTrialExpired) {
    console.log('❌ TrialGuard: Trial EXPIRED, checking route:', location.pathname);
    
    // If user is already on pricing page, allow access
    if (location.pathname === '/user/pricing') {
      console.log('💰 TrialGuard: User on pricing page, allowing access');
      return <>{children}</>;
    }
    
    // If user is on profile page (to allow account management), allow access
    if (location.pathname === '/user/profile') {
      console.log('👤 TrialGuard: User on profile page, allowing access');
      return <>{children}</>;
    }
    
    // If user is on subscription success page, allow access
    if (location.pathname === '/user/subscription-success') {
      console.log('🎉 TrialGuard: User on subscription success page, allowing access');
      return <>{children}</>;
    }
    
    // For all other routes, redirect to pricing
    console.log('🚫 TrialGuard: REDIRECTING to pricing due to expired trial');
    return <Navigate to="/user/pricing" replace />;
  }

  // Trial is still active or user has subscription, allow access
  console.log('✅ TrialGuard: Trial active, allowing access');
  return <>{children}</>;
};

export default TrialGuard;