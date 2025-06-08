import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import CampaignCreate from './pages/CampaignCreate';
import CampaignDashboard from './pages/CampaignDashboard';
import CampaignResponses from './pages/CampaignResponses';
import CampaignShare from './pages/CampaignShare';
import CampaignForm from './pages/CampaignForm';
import Survey from './pages/Survey';
import EntityCrud from './pages/EntityCrud';
import Settings from './pages/Settings';
import { initializeDefaultData } from './utils/localStorage';

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
    initializeDefaultData();
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
                  
                  {/* Public survey route */}
                  <Route path="/survey/:id" element={<Survey />} />
                  
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="overview" element={<Overview />} />
                    <Route index element={<Dashboard />} />
                    
                    <Route path="campaigns">
                      <Route path="new" element={<CampaignCreate />} />
                      <Route path=":id" element={<CampaignDashboard />} />
                      <Route path=":id/responses" element={<CampaignResponses />} />
                      <Route path=":id/share" element={<CampaignShare />} />
                      <Route path=":id/form" element={<CampaignForm />} />
                    </Route>
                    
                    <Route path="settings" element={<Settings />} />
                    <Route path="settings/sources" element={<EntityCrud entityType="sources" />} />
                    <Route path="settings/situations" element={<EntityCrud entityType="situations" />} />
                    <Route path="settings/groups" element={<EntityCrud entityType="groups" />} />
                  </Route>
                  
                  <Route path="*" element={<Navigate to="/" />} />
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