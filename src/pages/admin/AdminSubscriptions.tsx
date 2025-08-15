import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin, AdminSubscription } from '../../hooks/useAdmin';
import { getProductByPriceId } from '../../stripe-config';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
  ChevronLeft, 
  CreditCard, 
  Search, 
  Mail, 
  Building, 
  Calendar,
  Crown,
  Download,
  RefreshCw,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSubscriptions: React.FC = () => {
  const { isAdmin, permissions, getAdminSubscriptions } = useAdmin();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<AdminSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  useEffect(() => {
    if (isAdmin && permissions.view_subscriptions) {
      loadSubscriptions();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, permissions]);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchQuery, statusFilter, planFilter]);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const adminSubscriptions = await getAdminSubscriptions();
      setSubscriptions(adminSubscriptions);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = [...subscriptions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(sub =>
        (sub.user_name && sub.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.user_email && sub.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.user_company && sub.user_company.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.subscription_status === statusFilter);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(sub => sub.price_id === planFilter);
    }

    setFilteredSubscriptions(filtered);
  };

  const exportSubscriptions = () => {
    const csvHeaders = [
      'Nome do Usuário',
      'Email',
      'Empresa',
      'Status da Assinatura',
      'Plano',
      'Início do Período',
      'Fim do Período',
      'Cancelar no Final',
      'Método de Pagamento',
      'Data de Criação'
    ];

    const csvRows = filteredSubscriptions.map(sub => {
      const product = getProductByPriceId(sub.price_id || '');
      return [
        `"${sub.user_name || ''}"`,
        `"${sub.user_email || ''}"`,
        `"${sub.user_company || ''}"`,
        `"${sub.subscription_status || 'not_started'}"`,
        `"${product?.name || 'Desconhecido'}"`,
        `"${sub.current_period_start ? new Date(sub.current_period_start * 1000).toLocaleDateString('pt-BR') : ''}"`,
        `"${sub.current_period_end ? new Date(sub.current_period_end * 1000).toLocaleDateString('pt-BR') : ''}"`,
        `"${sub.cancel_at_period_end ? 'Sim' : 'Não'}"`,
        `"${sub.payment_method_brand ? `${sub.payment_method_brand.toUpperCase()} •••• ${sub.payment_method_last4}` : ''}"`,
        `"${sub.created_at ? new Date(sub.created_at).toLocaleDateString('pt-BR') : ''}"`
      ];
    });

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `assinaturas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativa</Badge>;
      case 'canceled':
        return <Badge variant="danger">Cancelada</Badge>;
      case 'past_due':
        return <Badge variant="warning">Vencida</Badge>;
      case 'trialing':
        return <Badge variant="info">Trial</Badge>;
      case 'not_started':
        return <Badge variant="secondary">Não Iniciada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '—';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  const getUniqueStatuses = () => {
    return Array.from(new Set(subscriptions.map(sub => sub.subscription_status).filter(Boolean)));
  };

  const getUniquePlans = () => {
    return Array.from(new Set(subscriptions.map(sub => sub.price_id).filter(Boolean)));
  };

  if (!isAdmin || !permissions.view_subscriptions) {
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
              Administração - Assinaturas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visualizar e gerenciar todas as assinaturas da plataforma
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={loadSubscriptions}
          >
            Atualizar
          </Button>
          <Button
            variant="outline"
            icon={<Download size={16} />}
            onClick={exportSubscriptions}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Assinaturas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{subscriptions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CreditCard size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assinaturas Ativas</p>
                <p className="text-3xl font-bold text-green-600">
                  {subscriptions.filter(s => s.subscription_status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Canceladas</p>
                <p className="text-3xl font-bold text-red-600">
                  {subscriptions.filter(s => s.subscription_status === 'canceled').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Em Trial</p>
                <p className="text-3xl font-bold text-purple-600">
                  {subscriptions.filter(s => s.subscription_status === 'trialing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-purple-600 dark:text-purple-400" />
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
                placeholder="Buscar assinaturas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os status</option>
              {getUniqueStatuses().map(status => (
                <option key={status} value={status}>
                  {status === 'active' ? 'Ativa' : 
                   status === 'canceled' ? 'Cancelada' : 
                   status === 'past_due' ? 'Vencida' : 
                   status === 'trialing' ? 'Trial' : 
                   status === 'not_started' ? 'Não Iniciada' : status}
                </option>
              ))}
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os planos</option>
              {getUniquePlans().map(priceId => {
                const product = getProductByPriceId(priceId);
                return (
                  <option key={priceId} value={priceId}>
                    {product?.name.replace('Meu NPS - ', '') || 'Plano Desconhecido'}
                  </option>
                );
              })}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPlanFilter('all');
              }}
              disabled={searchQuery === '' && statusFilter === 'all' && planFilter === 'all'}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader 
          title={`Assinaturas (${filteredSubscriptions.length})`}
          description={`${filteredSubscriptions.length} de ${subscriptions.length} assinaturas`}
        />
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma assinatura encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente ajustar os filtros para encontrar assinaturas.
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
                      Plano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Pagamento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubscriptions.map((subscription, index) => {
                    const product = getProductByPriceId(subscription.price_id || '');
                    return (
                      <motion.tr
                        key={subscription.customer_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#00ac75] text-white flex items-center justify-center text-sm font-medium mr-3">
                              {subscription.user_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {subscription.user_name || 'Nome não disponível'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <Mail size={12} className="mr-1" />
                                {subscription.user_email}
                              </div>
                              {subscription.user_company && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                  <Building size={12} className="mr-1" />
                                  {subscription.user_company}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product?.name.replace('Meu NPS - ', '') || 'Plano Desconhecido'}
                            </div>
                            {product && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                R${product.price.toFixed(0)}/mês
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {getStatusBadge(subscription.subscription_status || 'not_started')}
                            {subscription.cancel_at_period_end && (
                              <div className="text-xs text-orange-600 dark:text-orange-400">
                                Cancelamento agendado
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white">
                              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                            </div>
                            {subscription.current_period_end && (
                              <div className="text-gray-500 dark:text-gray-400">
                                {Math.ceil((subscription.current_period_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} dias restantes
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {subscription.payment_method_brand && subscription.payment_method_last4 ? (
                            <div className="text-sm">
                              <div className="text-gray-900 dark:text-white">
                                {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;