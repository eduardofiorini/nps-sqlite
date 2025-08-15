import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import TrialGuard from './components/layout/TrialGuard';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Landing from './pages/Landing';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import Reports from './pages/Reports';
import Contacts from './pages/Contacts';
import CampaignCreate from './pages/CampaignCreate';
import CampaignDashboard from './pages/CampaignDashboard';
import CampaignResponses from './pages/CampaignResponses';
import CampaignShare from './pages/CampaignShare';
import CampaignForm from './pages/CampaignForm';
import Survey from './pages/Survey';
import Pricing from './pages/Pricing';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import EmailPreview from './pages/EmailPreview';
import EntityCrud from './pages/EntityCrud';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import TrialExpired from './pages/TrialExpired';
import { initializeDefaultData } from './utils/supabaseStorage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Only initialize data when user is authenticated and auth loading is complete
    if (!loading && isAuthenticated) {
    const initData = async () => {
      try {
        await initializeDefaultData();
      } catch (error) {
        console.error('Error initializing default data:', error);
      }
    };
    
    initData();
    }
  }, [isAuthenticated, loading]);

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ConfigProvider>
              <AppInitializer>
                <Routes>
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                  <Route path="/reset-password" element={<ResetPasswordForm />} />
                  
                  {/* Public email preview route */}
                  <Route path="/email-preview/:campaignId" element={<EmailPreview />} />
                  
                  {/* Redirect home to dashboard if authenticated, otherwise landing */}
                  <Route path="/" element={<HomeRedirect />} />
                  
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <TrialGuard>
                          <MainLayout />
                        </TrialGuard>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Overview />} />
                    <Route path="campaigns" element={<Dashboard />} />
                    <Route path="campaigns/new" element={<CampaignCreate />} />
                    <Route path="campaigns/:id" element={<CampaignDashboard />} />
                    <Route path="campaigns/:id/responses" element={<CampaignResponses />} />
                    <Route path="campaigns/:id/share" element={<CampaignShare />} />
                    <Route path="campaigns/:id/form" element={<CampaignForm />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="contacts" element={<Contacts />} />
                    <Route path="profile" element={<Profile />} />
                    
                    <Route path="settings" element={<Settings />} />
                    <Route path="settings/sources" element={<EntityCrud entityType="sources" />} />
                    <Route path="settings/situations" element={<EntityCrud entityType="situations" />} />
                    <Route path="settings/groups" element={<EntityCrud entityType="groups" />} />
                    
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="subscription-success" element={<SubscriptionSuccess />} />
                  </Route>
                  
                  {/* Direct overview route for easier access */}
                  <Route
                    path="/overview"
                    element={
                      <ProtectedRoute>
                        <TrialGuard>
                          <MainLayout />
                        </TrialGuard>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Overview />} />
                  </Route>
                  
                  {/* Public survey route - moved outside protected routes */}
                  <Route path="/survey/:id" element={<Survey />} />
                  
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </AppInitializer>
            </ConfigProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

const HomeRedirect: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ac75]"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard/campaigns" /> : <Landing />;
};

export default App;