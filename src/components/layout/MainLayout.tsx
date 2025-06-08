import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  LayoutGrid, 
  BarChart, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { useConfig } from '../../contexts/ConfigContext';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { config } = useConfig();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };z

  const navItems = [
    { path: '/overview', label: t('nav.dashboard'), icon: <LayoutGrid size={20} /> },
    { path: '/', label: t('nav.dashboard'), icon: <TrendingUpsize size={20} /> },
  ];

  const settingsItems = [
    { path: '/settings', label: t('nav.settings'), icon: <Settings size={20} /> },
    { path: '/settings/sources', label: t('settings.sources'), icon: <BarChart size={18} /> },
    { path: '/settings/situations', label: t('settings.situations'), icon: <BarChart size={18} /> },
    { path: '/settings/groups', label: t('settings.groups'), icon: <BarChart size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isSettingsActive = () => location.pathname.startsWith('/settings');

  React.useEffect(() => {
    if (isSettingsActive()) {
      setIsSettingsExpanded(true);
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center mr-2"
                  style={{ backgroundColor: config.themeColor }}
                >
                  <BarChart size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{t('login.title')}</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {user && (
                <div className="relative group">
                  <button className="flex items-center text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <User size={18} className="mr-2" />
                    <span className="mr-1">{user.name}</span>
                    <ChevronDown size={16} />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" /> 
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors">
          <nav className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <div className="px-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {/* Settings Section */}
              <div className="mt-4">
                <button
                  onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isSettingsActive()
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Settings size={20} className="mr-3" />
                    {t('nav.settings')}
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`transform transition-transform ${isSettingsExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
                
                <AnimatePresence>
                  {isSettingsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-1">
                        {settingsItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                              isActive(item.path)
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="mt-auto px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                fullWidth
                icon={<LogOut size={16} />}
                onClick={handleLogout}
              >
                {t('nav.logout')}
              </Button>
            </div>
          </nav>
        </aside>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 flex md:hidden"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
                <div className="px-4 pt-5 pb-4 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center mr-2"
                        style={{ backgroundColor: config.themeColor }}
                      >
                        <BarChart size={20} className="text-white" />
                      </div>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{t('login.title')}</span>
                    </div>
                    <button
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <nav className="mt-5 space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.path)
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    
                    {/* Mobile Settings */}
                    <div className="mt-4">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('nav.settings')}
                      </div>
                      {settingsItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                            isActive(item.path)
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </nav>
                </div>
                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                  {user && (
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    fullWidth
                    icon={<LogOut size={16} />}
                    onClick={handleLogout}
                  >
                    {t('nav.logout')}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;