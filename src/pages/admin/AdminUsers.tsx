import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin, AdminUser } from '../../hooks/useAdmin';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { 
  ChevronLeft, 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  User,
  Crown,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUsers: React.FC = () => {
  const { isAdmin, permissions, getAdminUsers } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (isAdmin && permissions.view_users) {
      loadUsers();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, permissions]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, companyFilter, dateFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const adminUsers = await getAdminUsers();
      setUsers(adminUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Company filter
    if (companyFilter !== 'all') {
      if (companyFilter === 'with_company') {
        filtered = filtered.filter(user => user.company);
      } else if (companyFilter === 'without_company') {
        filtered = filtered.filter(user => !user.company);
      }
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === 'last_7_days') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'last_30_days') {
        filterDate.setDate(now.getDate() - 30);
      } else if (dateFilter === 'last_90_days') {
        filterDate.setDate(now.getDate() - 90);
      }
      
      filtered = filtered.filter(user => 
        new Date(user.created_at) >= filterDate
      );
    }

    setFilteredUsers(filtered);
  };

  const exportUsers = () => {
    const csvHeaders = [
      'Nome',
      'Email', 
      'Telefone',
      'Empresa',
      'Cargo',
      'Data de Criação',
      'Início do Trial',
      'Idioma',
      'Tema'
    ];

    const csvRows = filteredUsers.map(user => [
      `"${user.name}"`,
      `"${user.email}"`,
      `"${user.phone || ''}"`,
      `"${user.company || ''}"`,
      `"${user.position || ''}"`,
      `"${new Date(user.created_at).toLocaleDateString('pt-BR')}"`,
      `"${user.trial_start_date ? new Date(user.trial_start_date).toLocaleDateString('pt-BR') : ''}"`,
      `"${user.preferences?.language || 'pt-BR'}"`,
      `"${user.preferences?.theme || 'light'}"`
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getUniqueCompanies = () => {
    const companies = users
      .map(user => user.company)
      .filter(Boolean)
      .filter((company, index, arr) => arr.indexOf(company) === index);
    return companies;
  };

  if (!isAdmin || !permissions.view_users) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Acesso Negado
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Você não tem permissão para visualizar esta página.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ac75]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/user/overview">
            <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Crown className="mr-3 text-yellow-500" size={32} />
              Administração - Usuários
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visualizar e gerenciar todos os usuários da plataforma
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={loadUsers}
          >
            Atualizar
          </Button>
          <Button
            variant="outline"
            icon={<Download size={16} />}
            onClick={exportUsers}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Usuários</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Com Empresa</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.company).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Building size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Últimos 30 dias</p>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(u => {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return new Date(u.created_at) >= thirtyDaysAgo;
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Empresas Únicas</p>
                <p className="text-3xl font-bold text-orange-600">
                  {getUniqueCompanies().length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Building size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todas as empresas</option>
              <option value="with_company">Com empresa</option>
              <option value="without_company">Sem empresa</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os períodos</option>
              <option value="last_7_days">Últimos 7 dias</option>
              <option value="last_30_days">Últimos 30 dias</option>
              <option value="last_90_days">Últimos 90 dias</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCompanyFilter('all');
                setDateFilter('all');
              }}
              disabled={searchQuery === '' && companyFilter === 'all' && dateFilter === 'all'}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader 
          title={`Usuários (${filteredUsers.length})`}
          description={`${filteredUsers.length} de ${users.length} usuários`}
        />
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente ajustar os filtros para encontrar usuários.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trial
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#00ac75] text-white flex items-center justify-center text-sm font-medium mr-3 overflow-hidden">
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
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {user.user_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Phone size={14} className="mr-2 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.company ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.company}
                            </div>
                            {user.position && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.position}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar size={14} className="mr-2" />
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.trial_start_date ? (
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white">
                              {new Date(user.trial_start_date).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {Math.ceil((new Date().getTime() - new Date(user.trial_start_date).getTime()) / (1000 * 60 * 60 * 24))} dias atrás
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;