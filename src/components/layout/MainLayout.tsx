import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
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
  TrendingUp,
  Globe,
  CreditCard,
  PanelLeftClose,
  Crown,
  PanelLeftOpen,
  FileText,
  Users,
  Clock,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import UnifiedBanner from '../ui/UnifiedBanner';
import { useSubscription } from '../../hooks/useSubscription';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { config, themeColor } = useConfig();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { 
      path: '/dashboard', 
      label: language === 'pt-BR' ? 'Dashboard Geral' : 'General Dashboard', 
      icon: <LayoutGrid size={20} /> 
    },
    { 
      path: '/dashboard/campaigns', 
      label: language === 'pt-BR' ? 'Campanhas NPS' : 'NPS Campaigns', 
      icon: <TrendingUp size={20} /> 
    },
    { 
      path: '/dashboard/contacts', 
      label: language === 'pt-BR' ? 'Contatos' : 'Contacts', 
      icon: <Users size={20} /> 
    },
    { 
      path: '/dashboard/reports', 
      label: language === 'pt-BR' ? 'Relatórios' : 'Reports', 
      icon: <FileText size={20} /> 
    },
    { 
      path: '/dashboard/pricing', 
      label: language === 'pt-BR' ? 'Planos' : 'Pricing', 
      icon: <Crown size={20} /> 
    },
  ];

  const settingsItems = [
    { path: '/dashboard/settings', label: t('nav.settings'), icon: <Settings size={20} /> },
    { path: '/dashboard/settings/sources', label: t('settings.sources'), icon: <Globe size={18} /> },
    { path: '/dashboard/settings/situations', label: t('settings.situations'), icon: <Tag size={18} /> },
    { path: '/dashboard/settings/groups', label: t('settings.groups'), icon: <Users size={18} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/overview';
    }
    if (path === '/dashboard/campaigns') {
      return location.pathname === '/dashboard/campaigns' || location.pathname.startsWith('/dashboard/campaigns');
    }
    if (path === '/dashboard/reports') {
      return location.pathname === '/dashboard/reports' || location.pathname.startsWith('/dashboard/reports');
    }
    if (path === '/dashboard/contacts') {
      return location.pathname === '/dashboard/contacts' || location.pathname.startsWith('/dashboard/contacts');
    }
    return location.pathname === path;
  };
  
  const isSettingsActive = () => location.pathname.startsWith('/dashboard/settings');

  React.useEffect(() => {
    if (isSettingsActive()) {
      setIsSettingsExpanded(true);
    }
  }, [location.pathname]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/overview" className="flex items-center">
                <div className="w-10 h-10 mr-3 flex items-center justify-center">
                  <img 
                    src="/icone.png" 
                    alt="Meu NPS" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold dark:text-white" style={{ color: themeColor }}>Meu NPS</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Plataforma de Gestão de NPS</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'pt-BR' | 'es')}
                  className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 transition-colors"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                >
                  <option value="en">🇺🇸 EN</option>
                  <option value="pt-BR">🇧🇷 PT</option>
                  <option value="es">🇪🇸 ES</option>
                </select>
                <Globe size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? 'Modo claro' : 'Modo escuro'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {/* User Dropdown */}
              {user && (
                <div className="relative user-dropdown">
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <div 
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center mr-3 text-sm font-medium"
                      style={{ backgroundColor: themeColor }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                    <ChevronDown size={16} className={`ml-2 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                          {subscription?.planName && (
                            <div className="text-xs text-[#00ac75] dark:text-[#4a9eff] font-medium mt-1">
                              {subscription.planName}
                            </div>
                          )}
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <User size={16} className="mr-2" />
                          Perfil
                        </Link>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <LogOut size={16} className="mr-2" /> 
                          {t('nav.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
        <aside className={`hidden md:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        }`}>
          <nav className="flex flex-col flex-1 pt-6 pb-4 overflow-y-auto">
            <div className={`${isSidebarCollapsed ? 'px-3' : 'px-6'} space-y-2`}>
              {/* Sidebar Toggle Button */}
              <div className="mb-4">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className={`${
                    isSidebarCollapsed 
                      ? 'w-full flex items-center justify-center p-3' 
                      : 'w-full flex items-center justify-end p-2'
                  } rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                  title={isSidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    isSidebarCollapsed 
                      ? 'flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-all duration-200' 
                      : 'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200'
                  } ${
                    isActive(item.path)
                      ? 'text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
                  }`}
                  style={isActive(item.path) ? { backgroundColor: themeColor } : {}}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <span className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'}`}>{item.icon}</span>
                  {!isSidebarCollapsed && item.label}
                </Link>
              ))}
              
              {/* Settings Section */}
              <div className="mt-6">
                <button
                  onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                  className={`${
                    isSidebarCollapsed 
                      ? 'flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-all duration-200 w-full' 
                      : 'flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200'
                  } ${
                    isSettingsActive()
                      ? 'text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
                  }`}
                  style={isSettingsActive() ? { backgroundColor: themeColor } : {}}
                  title={isSidebarCollapsed ? t('nav.settings') : undefined}
                >
                  {isSidebarCollapsed ? (
                    <Settings size={20} />
                  ) : (
                    <>
                      <div className="flex items-center">
                        <Settings size={20} className="mr-3" />
                        {t('nav.settings')}
                      </div>
                      <ChevronRight 
                        size={16} 
                        className={`transform transition-transform duration-200 ${isSettingsExpanded ? 'rotate-90' : ''}`}
                      />
                    </>
                  )}
                </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Gestão Inteligente de NPS</span>
                <AnimatePresence>
                  {isSettingsExpanded && !isSidebarCollapsed && (
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
                                ? 'dark:text-white border-l-2'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
                            }`}
                            style={isActive(item.path) ? { 
                              backgroundColor: `rgba(${hexToRgb(themeColor)?.r || 7}, ${hexToRgb(themeColor)?.g || 49}, ${hexToRgb(themeColor)?.b || 67}, 0.1)`,
                              color: themeColor,
                              borderLeftColor: themeColor
                            } : {}}
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
            
            <div className={`mt-auto ${isSidebarCollapsed ? 'px-3' : 'px-6'} py-4 border-t border-gray-200 dark:border-gray-700`}>
              <Button
                variant="outline"
                fullWidth={!isSidebarCollapsed}
                icon={<LogOut size={16} />}
                onClick={handleLogout}
                className={`hover:text-white ${
                  isSidebarCollapsed ? 'p-3 justify-center' : ''
                }`}
                style={{ 
                  borderColor: themeColor, 
                  color: themeColor,
                  '--hover-bg': themeColor
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = themeColor;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = themeColor;
                }}
                title={isSidebarCollapsed ? t('nav.logout') : undefined}
              >
                {!isSidebarCollapsed && t('nav.logout')}
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
                        <span className="text-lg font-bold text-[#00ac75] dark:text-white">Meu NPS</span>
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

                  {/* Mobile Language Selector */}
                  <div className="mb-4">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'en' | 'pt-BR' | 'es')}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="pt-BR">🇧🇷 Português</option>
                      <option value="es">🇪🇸 Español</option>
                    </select>
                  </div>

                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive(item.path)
                            ? 'text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
                        }`}
                        style={isActive(item.path) ? { backgroundColor: themeColor } : {}}
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
                              ? 'text-white shadow-md'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#073143] dark:hover:text-white'
                          }`}
                          style={isActive(item.path) ? { backgroundColor: themeColor } : {}}
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
                      <div 
                        className="w-10 h-10 rounded-full text-white flex items-center justify-center mr-3 text-sm font-medium overflow-hidden"
                        style={{ backgroundColor: themeColor }}
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                        {subscription?.planName && (
                          <div className="text-xs text-[#00ac75] dark:text-[#4a9eff] font-medium">
                            {subscription.planName}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Perfil
                    </Link>
                    <Button
                      variant="outline"
                      fullWidth
                      icon={<LogOut size={16} />}
                      onClick={handleLogout}
                      style={{ 
                        borderColor: themeColor, 
                        color: themeColor
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = themeColor;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = themeColor;
                      }}
                    >
                      {t('nav.logout')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <UnifiedBanner />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper function to convert hex to RGB (needed for the component)
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export default MainLayout;