import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
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
import TrialExpired from './pages/TrialExpired';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPlans from './pages/admin/AdminPlans';
import AdminSettings from './pages/admin/AdminSettings';
import { initializeDefaultData } from './utils/supabaseStorage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('AdminRoute check - User:', user?.email, 'Role:', user?.role, 'Loading:', loading);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões de administrador...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    console.log('Access denied - redirecting to overview');
    return <Navigate to="/overview" />;
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
            <SubscriptionProvider>
              <ConfigProvider>
                <AppInitializer>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                    <Route path="/reset-password" element={<ResetPasswordForm />} />
                    <Route path="/trial-expired" element={<TrialExpired />} />
                    
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
                    
                    {/* Public survey route - moved outside protected routes */}
                    <Route path="/survey/:id" element={<Survey />} />
                    
                    {/* Admin routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="plans" element={<AdminPlans />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/overview" />} />
                  </Routes>
                </AppInitializer>
              </ConfigProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;