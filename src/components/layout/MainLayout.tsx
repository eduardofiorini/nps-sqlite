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
  };

  const navItems = [
    { path: '/overview', label: 'Dashboard Geral', icon: <LayoutGrid size={20} /> },
    { path: '/', label: 'Campanhas NPS', icon: <TrendingUp size={20} /> },
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
                <div className="w-10 h-10 mr-3 flex items-center justify-center">
                  <img 
                    src="/icone.png" 
                    alt="Meu NPS" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#073143] dark:text-white">Meu NPS</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Plataforma de Gestão de NPS</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {user && (
                <div className="relative group">
                  <button className="flex items-center text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600">
                    <div className="w-8 h-8 rounded-full bg-[#073143] text-white flex items-center justify-center mr-3 text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10 hidden group-hover:block border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
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
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
        <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors">
          <nav className="flex flex-col flex-1 pt-6 pb-4 overflow-y-auto">
            <div className="px-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-[#073143] text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {/* Settings Section */}
              <div className="mt-6">
                <button
                  onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isSettingsActive()
                      ? 'bg-[#073143] text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Settings size={20} className="mr-3" />
                    {t('nav.settings')}
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`transform transition-transform duration-200 ${isSettingsExpanded ? 'rotate-90' : ''}`}
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
                      <div className="ml-4 mt-2 space-y-1">
                        {settingsItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive(item.path)
                                ? 'bg-[#073143]/10 text-[#073143] dark:bg-[#073143]/20 dark:text-white border-l-2 border-[#073143]'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
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
            
            <div className="mt-auto px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                fullWidth
                icon={<LogOut size={16} />}
                onClick={handleLogout}
                className="border-[#073143] text-[#073143] hover:bg-[#073143] hover:text-white"
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
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-0 z-40 flex md:hidden"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
                <div className="px-6 pt-6 pb-4 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-2 flex items-center justify-center">
                        <img 
                          src="/icone.png" 
                          alt="Meu NPS" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-[#073143] dark:text-white">Meu NPS</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Gestão de NPS</span>
                      </div>
                    </div>
                    <button
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-[#073143] text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    
                    {/* Mobile Settings */}
                    <div className="mt-6">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('nav.settings')}
                      </div>
                      {settingsItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive(item.path)
                              ? 'bg-[#073143] text-white shadow-md'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
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
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  {user && (
                    <div className="flex items-center mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-[#073143] text-white flex items-center justify-center mr-3 text-sm font-medium">
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
                    className="border-[#073143] text-[#073143] hover:bg-[#073143] hover:text-white"
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