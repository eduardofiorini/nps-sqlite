import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin, AdminUser } from '../../hooks/useAdmin';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
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
  RefreshCw,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUsers: React.FC = () => {
  const { isAdmin, permissions, getAdminUsers, deactivateUser, reactivateUser, deleteUserAccount } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

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

  const handleDeactivateUser = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      if (selectedUser.is_deactivated) {
        await reactivateUser(selectedUser.user_id);
        setActionMessage(`Usuário ${selectedUser.name} foi reativado com sucesso.`);
      } else {
        await deactivateUser(selectedUser.user_id);
        setActionMessage(`Usuário ${selectedUser.name} foi desativado com sucesso.`);
      }
      
      // Reload users
      await loadUsers();
      setShowDeactivateModal(false);
      setSelectedUser(null);
      
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error) {
      console.error('Error processing user action:', error);
      setActionMessage(`Erro ao ${selectedUser.is_deactivated ? 'reativar' : 'desativar'} usuário: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      await deleteUserAccount(selectedUser.user_id);
      setActionMessage(`Usuário ${selectedUser.name} foi excluído permanentemente.`);
      
      // Reload users
      await loadUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
      
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setActionMessage(`Erro ao excluir usuário: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openDeactivateModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  const openDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (user: AdminUser) => {
    if (user.is_deactivated) {
      return <Badge variant="danger">Desativado</Badge>;
    }
    return <Badge variant="success">Ativo</Badge>;
  };

  const getDeactivatedInfo = (user: AdminUser) => {
    if (!user.is_deactivated || !user.deactivated_at) return null;
    return new Date(user.deactivated_at).toLocaleDateString('pt-BR');
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

  // Show action message
  const ActionMessage = () => {
    if (!actionMessage) return null;
    
    return (
      <div className={`mb-6 p-4 rounded-lg border ${actionMessage.includes('sucesso') ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'}`}>
        {actionMessage}
      </div>
    );
  };

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

      <ActionMessage />

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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários Ativos</p>
                <p className="text-3xl font-bold text-green-600">{users.filter(u => !u.is_deactivated).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <UserCheck size={24} className="text-green-600 dark:text-green-400" />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
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
                          <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-medium mr-3 overflow-hidden ${user.is_deactivated ? 'bg-gray-400' : 'bg-[#00ac75]'}`}>
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
                              {user.is_deactivated && (
                                <span className="ml-2 text-xs text-red-500">(Desativado)</span>
                              )}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(user)}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => openDeactivateModal(user)}
                              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                                user.is_deactivated 
                                  ? 'text-green-600 hover:text-green-700' 
                                  : 'text-yellow-600 hover:text-yellow-700'
                              }`}
                              title={user.is_deactivated ? 'Reativar usuário' : 'Desativar usuário'}
                            >
                              {user.is_deactivated ? <UserCheck size={16} /> : <UserX size={16} />}
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="p-1 text-red-600 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Excluir usuário permanentemente"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {user.is_deactivated && getDeactivatedInfo(user) && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Desativado em {getDeactivatedInfo(user)}
                          </div>
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

      {/* Deactivate/Reactivate Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => {
          setShowDeactivateModal(false);
          setSelectedUser(null);
        }}
        title={selectedUser?.is_deactivated ? 'Reativar Usuário' : 'Desativar Usuário'}
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeactivateModal(false);
                setSelectedUser(null);
              }}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              variant={selectedUser?.is_deactivated ? "primary" : "warning"}
              onClick={handleDeactivateUser}
              isLoading={isProcessing}
              icon={selectedUser?.is_deactivated ? <UserCheck size={16} /> : <UserX size={16} />}
            >
              {selectedUser?.is_deactivated ? 'Reativar Usuário' : 'Desativar Usuário'}
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className={`flex items-center p-4 rounded-lg border ${
              selectedUser.is_deactivated 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <Shield className={`w-6 h-6 mr-3 flex-shrink-0 ${
                selectedUser.is_deactivated ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`} />
              <div>
                <h4 className={`text-sm font-medium ${
                  selectedUser.is_deactivated 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  {selectedUser.is_deactivated ? 'Reativar Conta' : 'Desativar Conta'}
                </h4>
                <p className={`text-sm ${
                  selectedUser.is_deactivated 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  {selectedUser.is_deactivated 
                    ? 'O usuário poderá fazer login e usar a plataforma normalmente.'
                    : 'O usuário não poderá fazer login, mas seus dados serão preservados.'
                  }
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Detalhes do usuário:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nome:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</span>
                </div>
                {selectedUser.company && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Empresa:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedUser.company}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status atual:</span>
                  {getStatusBadge(selectedUser)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Excluir Usuário Permanentemente"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteUser}
              isLoading={isProcessing}
              icon={<Trash2 size={16} />}
            >
              Excluir Permanentemente
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Esta ação não pode ser desfeita
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Todos os dados do usuário serão permanentemente excluídos, incluindo campanhas, respostas e configurações.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Usuário a ser excluído:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nome:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Criado em:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                O que será excluído:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Conta de autenticação (login)</li>
                <li>• Perfil e configurações pessoais</li>
                <li>• Todas as campanhas NPS</li>
                <li>• Todas as respostas coletadas</li>
                <li>• Contatos e grupos</li>
                <li>• Configurações de integração</li>
                <li>• Histórico de assinaturas</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;