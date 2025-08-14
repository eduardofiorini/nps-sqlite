import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserPlus,
  Mail,
  Phone,
  Building,
  Calendar,
  CreditCard,
  Shield,
  Ban,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { AdminUser } from '../../types/admin';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter, planFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading users data
      // In a real app, this would fetch from your admin API
      setTimeout(() => {
        const mockUsers: AdminUser[] = [
          {
            id: '1',
            email: 'joao@empresa.com',
            name: 'João Silva',
            phone: '(11) 99999-9999',
            company: 'Tech Corp',
            position: 'CEO',
            role: 'user',
            status: 'active',
            subscription: {
              plan: 'Profissional',
              status: 'active',
              current_period_end: Date.now() / 1000 + 30 * 24 * 60 * 60,
              cancel_at_period_end: false
            },
            stats: {
              campaigns: 5,
              responses: 234,
              lastLogin: new Date().toISOString()
            },
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            email: 'maria@startup.com',
            name: 'Maria Santos',
            company: 'Startup Inc',
            role: 'user',
            status: 'active',
            subscription: {
              plan: 'Iniciante',
              status: 'trialing',
              current_period_end: Date.now() / 1000 + 5 * 24 * 60 * 60,
              cancel_at_period_end: false
            },
            stats: {
              campaigns: 2,
              responses: 45,
              lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            createdAt: '2024-12-01T14:30:00Z',
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            email: 'carlos@corp.com',
            name: 'Carlos Oliveira',
            company: 'Big Corp',
            role: 'user',
            status: 'suspended',
            subscription: {
              plan: 'Empresarial',
              status: 'past_due',
              current_period_end: Date.now() / 1000 - 5 * 24 * 60 * 60,
              cancel_at_period_end: true
            },
            stats: {
              campaigns: 12,
              responses: 1567,
              lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            createdAt: '2023-08-20T09:15:00Z',
            updatedAt: new Date().toISOString()
          }
        ];
        
        setUsers(mockUsers);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading users:', error);
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
        user.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.subscription?.plan === planFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleSuspendUser = async (userId: string) => {
    // Implement user suspension logic
    console.log('Suspending user:', userId);
  };

  const handleActivateUser = async (userId: string) => {
    // Implement user activation logic
    console.log('Activating user:', userId);
  };

  const exportUsers = () => {
    const csvData = [
      ['Nome', 'Email', 'Empresa', 'Plano', 'Status', 'Campanhas', 'Respostas', 'Criado em'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.company || '',
        user.subscription?.plan || 'Sem plano',
        user.status,
        user.stats.campaigns,
        user.stats.responses,
        new Date(user.createdAt).toLocaleDateString('pt-BR')
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativo</Badge>;
      case 'suspended':
        return <Badge variant="danger">Suspenso</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription?: AdminUser['subscription']) => {
    if (!subscription) return <Badge variant="secondary">Sem plano</Badge>;
    
    switch (subscription.status) {
      case 'active':
        return <Badge variant="success">{subscription.plan}</Badge>;
      case 'trialing':
        return <Badge variant="info">{subscription.plan} (Teste)</Badge>;
      case 'past_due':
        return <Badge variant="warning">{subscription.plan} (Vencido)</Badge>;
      case 'canceled':
        return <Badge variant="danger">{subscription.plan} (Cancelado)</Badge>;
      default:
        return <Badge variant="secondary">{subscription.plan}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Usuários</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administre contas de usuários e assinaturas
          </p>
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
            Exportar
          </Button>
        </div>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
              <option value="pending">Pendente</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os planos</option>
              <option value="Iniciante">Iniciante</option>
              <option value="Profissional">Profissional</option>
              <option value="Empresarial">Empresarial</option>
            </select>

            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Filter size={16} className="mr-2" />
              {filteredUsers.length} de {users.length} usuários
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title={`Usuários (${filteredUsers.length})`} />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Atividade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                        <div className="w-10 h-10 rounded-full bg-[#073143] text-white flex items-center justify-center text-sm font-medium mr-4">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          {user.company && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">{user.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSubscriptionBadge(user.subscription)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="space-y-1">
                        <div>{user.stats.campaigns} campanhas</div>
                        <div>{user.stats.responses} respostas</div>
                        {user.stats.lastLogin && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Último login: {new Date(user.stats.lastLogin).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded"
                          title="Editar usuário"
                        >
                          <Edit size={16} />
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 p-1 rounded"
                            title="Suspender usuário"
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 rounded"
                            title="Ativar usuário"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded"
                          title="Excluir usuário"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente ajustar os filtros para encontrar os usuários que procura.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Edit Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Editar Usuário"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary">
              Salvar Alterações
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome"
                value={selectedUser.name}
                onChange={() => {}}
                fullWidth
              />
              <Input
                label="Email"
                value={selectedUser.email}
                onChange={() => {}}
                fullWidth
              />
              <Input
                label="Telefone"
                value={selectedUser.phone || ''}
                onChange={() => {}}
                fullWidth
              />
              <Input
                label="Empresa"
                value={selectedUser.company || ''}
                onChange={() => {}}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="active">Ativo</option>
                  <option value="suspended">Suspenso</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Função
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            {/* User Stats */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Estatísticas</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.stats.campaigns}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Campanhas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.stats.responses}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Respostas</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUser.stats.lastLogin 
                      ? new Date(selectedUser.stats.lastLogin).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Último login</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Usuário"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<Trash2 size={16} />}>
              Excluir Permanentemente
            </Button>
          </div>
        }
      >
        {userToDelete && (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Esta ação não pode ser desfeita
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Todos os dados do usuário serão permanentemente excluídos.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome:</span>
                <span className="text-sm text-gray-900 dark:text-white">{userToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
                <span className="text-sm text-gray-900 dark:text-white">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Campanhas:</span>
                <span className="text-sm text-gray-900 dark:text-white">{userToDelete.stats.campaigns}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Respostas:</span>
                <span className="text-sm text-gray-900 dark:text-white">{userToDelete.stats.responses}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;