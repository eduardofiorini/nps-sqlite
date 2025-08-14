import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LayoutGrid, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  Shield,
  ArrowLeft,
  Moon,
  Sun
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: <LayoutGrid size={20} /> 
    },
    { 
      path: '/admin/users', 
      label: 'Usuários', 
      icon: <Users size={20} /> 
    },
    { 
      path: '/admin/plans', 
      label: 'Planos', 
      icon: <CreditCard size={20} /> 
    },
    { 
      path: '/admin/settings', 
      label: 'Configurações', 
      icon: <Settings size={20} /> 
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* Admin Badge */}
              <div className="flex items-center mr-6">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Meu NPS - Administração</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Back to App */}
              <Link to="/overview">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowLeft size={16} />}
                >
                  Voltar ao App
                </Button>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* User Info */}
              {user && (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#073143] text-white flex items-center justify-center mr-3 text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-right mr-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Administrador</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<LogOut size={16} />}
                    onClick={handleLogout}
                  >
                    Sair
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <nav className="flex flex-col flex-1 pt-6 pb-4 overflow-y-auto">
            <div className="px-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;