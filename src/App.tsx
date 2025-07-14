import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
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
import EmailPreview from './pages/EmailPreview';
import EntityCrud from './pages/EntityCrud';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import { initializeDefaultData } from './utils/localStorage';
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
  useEffect(() => {
    const initData = async () => {
      try {
        await initializeDefaultData();
      } catch (error) {
        console.error('Error initializing default data:', error);
      }
    };
    
    initData();
  }, []);

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
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                  <Route path="/reset-password" element={<ResetPasswordForm />} />
                  
                  {/* Public survey route */}
                  <Route path="/survey/:id" element={<Survey />} />
                  
                  {/* Public email preview route */}
                  <Route path="/email-preview/:campaignId" element={<EmailPreview />} />
                  
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* Redirect root to overview */}
                    <Route index element={<Navigate to="/overview\" replace />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="campaigns" element={<Dashboard />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="contacts" element={<Contacts />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="billing" element={<Billing />} />
                    
                    <Route path="campaigns/new" element={<CampaignCreate />} />
                    <Route path="campaigns/:id" element={<CampaignDashboard />} />
                    <Route path="campaigns/:id/responses" element={<CampaignResponses />} />
                    <Route path="campaigns/:id/share" element={<CampaignShare />} />
                    <Route path="campaigns/:id/form" element={<CampaignForm />} />
                    
                    <Route path="settings" element={<Settings />} />
                    <Route path="settings/sources" element={<EntityCrud entityType="sources" />} />
                    <Route path="settings/situations" element={<EntityCrud entityType="situations" />} />
                    <Route path="settings/groups" element={<EntityCrud entityType="groups" />} />
                  </Route>
                  
                  <Route path="*" element={<Navigate to="/overview" />} />
                </Routes>
              </AppInitializer>
            </ConfigProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;