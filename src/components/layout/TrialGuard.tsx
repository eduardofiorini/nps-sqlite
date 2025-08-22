import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useTrial } from '../../hooks/useTrial';
import { useSubscription } from '../../hooks/useSubscription';
import TrialExpired from '../../pages/TrialExpired';

interface TrialGuardProps {
  children: React.ReactNode;
}

const TrialGuard: React.FC<TrialGuardProps> = ({ children }) => {
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
    console.log('TrialGuard state:', {
      trialLoading,
      subscriptionLoading,
      initialLoadComplete,
      isTrialExpired: trialInfo.isTrialExpired,
      subscriptionStatus: subscription?.status,
      currentPath: location.pathname
    });
  }, [trialLoading, subscriptionLoading, initialLoadComplete, trialInfo.isTrialExpired, subscription?.status, location.pathname]);
  // Show loading while checking trial and subscription status
  if (trialLoading || subscriptionLoading || !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ac75]"></div>
      </div>
    );
  }

  // If user has active subscription, allow access
  if (subscription?.status === 'active') {
    console.log('User has active subscription, allowing access');
    return <>{children}</>;
  }

  // If trial is expired and no active subscription, redirect to pricing or show trial expired page
  if (trialInfo.isTrialExpired) {
    console.log('Trial expired, checking route:', location.pathname);
    
    // If user is already on pricing page, allow access
    if (location.pathname === '/user/pricing') {
      console.log('User on pricing page, allowing access');
      return <>{children}</>;
    }
    
    // If user is on profile page (to allow account management), allow access
    if (location.pathname === '/user/profile') {
      console.log('User on profile page, allowing access');
      return <>{children}</>;
    }
    
    // If user is on subscription success page, allow access
    if (location.pathname === '/user/subscription-success') {
      console.log('User on subscription success page, allowing access');
      return <>{children}</>;
    }
    
    // For all other routes, redirect to pricing
    console.log('Redirecting to pricing due to expired trial');
    return <Navigate to="/user/pricing" replace />;
  }

  // Trial is still active or user has subscription, allow access
  console.log('Trial active or other condition, allowing access');
  return <>{children}</>;
};

export default TrialGuard;