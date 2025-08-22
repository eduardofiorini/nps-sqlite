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
    return <>{children}</>;
  }

  // If trial is expired and no active subscription, redirect to pricing or show trial expired page
  if (trialInfo.isTrialExpired) {
    // If user is already on pricing page, allow access
    if (location.pathname === '/user/pricing') {
      return <>{children}</>;
    }
    
    // If user is on profile page (to allow account management), allow access
    if (location.pathname === '/user/profile') {
      return <>{children}</>;
    }
    
    // For all other routes, redirect to pricing
    return <Navigate to="/user/pricing" replace />;
  }

  // Trial is still active or user has subscription, allow access
  return <>{children}</>;
};

export default TrialGuard;