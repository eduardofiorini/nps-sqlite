import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { 
  ChevronLeft, 
  Users, 
  Search, 
  Mail, 
  Calendar,
  Crown,
  Download,
  RefreshCw,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Filter,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminAffiliateReferrals, updateReferralStatus } from '../../utils/affiliateStorage';
import { stripeProducts } from '../../stripe-config';
import type { AdminAffiliateReferral } from '../../types';

const AdminAffiliate: React.FC = () => {
  const { isAdmin, permissions } = useAdmin();
  const [referrals, setReferrals] = useState<AdminAffiliateReferral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<AdminAffiliateReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [affiliateFilter, setAffiliateFilter] = useState('all');
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (isAdmin && permissions.view_users) {
      loadReferrals();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, permissions]);

  useEffect(() => {
    filterReferrals();
  }, [referrals, searchQuery, statusFilter, affiliateFilter]);

  const loadReferrals = async () => {
    try {
      setIsLoading(true);
      const adminReferrals = await getAdminAffiliateReferrals();
      setReferrals(adminReferrals);
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReferrals = () => {
    let filtered = [...referrals];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(referral =>
        referral.affiliateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.affiliateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.referredName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.referredEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(referral => referral.commissionStatus === statusFilter);
    }

    // Affiliate filter
    if (affiliateFilter !== 'all') {
      filtered = filtered.filter(referral => referral.affiliateEmail === affiliateFilter);
    }

    setFilteredReferrals(filtered);
  };

  const handleReferralToggle = (referralId: string) => {
    setSelectedReferrals(prev => 
      prev.includes(referralId)
        ? prev.filter(id => id !== referralId)
        : [...prev, referralId]
    );
  };

  const handleSelectAll = () => {
    const pendingReferrals = filteredReferrals.filter(r => r.commissionStatus === 'pending');
    if (selectedReferrals.length === pendingReferrals.length) {
      setSelectedReferrals([]);
    } else {
      setSelectedReferrals(pendingReferrals.map(r => r.id));
    }
  };

  const handleProcessPayments = async () => {
    if (selectedReferrals.length === 0) return;
    
    setIsProcessingPayment(true);
    
    try {
      // Update selected referrals to paid status
      for (const referralId of selectedReferrals) {
        await updateReferralStatus(referralId, 'paid');
      }
      
      // Reload data
      await loadReferrals();
      setSelectedReferrals([]);
      setShowPaymentModal(false);
      
      alert(`${selectedReferrals.length} comissões marcadas como pagas com sucesso!`);
    } catch (error) {
      console.error('Error processing payments:', error);
      alert('Erro ao processar pagamentos. Tente novamente.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const exportReferrals = () => {
    const csvHeaders = [
      'Data de Criação',
      'Usuário Afiliado',
      'Email Afiliado',
      'Código Afiliado',
      'Usuário Contratante',
      'Email Contratante',
      'Plano Adquirido',
      'Valor da Comissão',
      'Status da Comissão',
      'Data do Pagamento'
    ];

    const csvRows = filteredReferrals.map(referral => [
      new Date(referral.createdAt).toLocaleDateString('pt-BR'),
      `"${referral.affiliateName}"`,
      `"${referral.affiliateEmail}"`,
      `"${referral.affiliateCode}"`,
      `"${referral.referredName}"`,
      `"${referral.referredEmail}"`,
      `"${getPlanName(referral.priceId)}"`,
      `R$ ${referral.commissionAmount.toFixed(2)}`,
      `"${getStatusLabel(referral.commissionStatus)}"`,
      referral.paidAt ? new Date(referral.paidAt).toLocaleDateString('pt-BR') : ''
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `afiliados-admin-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'Paga';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paga</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanName = (priceId?: string): string => {
    if (!priceId) return 'Período de Teste';
    const product = stripeProducts.find(p => p.priceId === priceId);
    return product?.name.replace('Meu NPS - ', '') || 'Plano Desconhecido';
  };

  const getUniqueAffiliates = () => {
    return Array.from(new Set(referrals.map(r => r.affiliateEmail)));
  };

  const totalCommissions = filteredReferrals.reduce((sum, r) => sum + r.commissionAmount, 0);
  const paidCommissions = filteredReferrals.filter(r => r.commissionStatus === 'paid').reduce((sum, r) => sum + r.commissionAmount, 0);
  const pendingCommissions = filteredReferrals.filter(r => r.commissionStatus === 'pending').reduce((sum, r) => sum + r.commissionAmount, 0);
  const selectedCommissionTotal = selectedReferrals.reduce((sum, id) => {
    const referral = filteredReferrals.find(r => r.id === id);
    return sum + (referral?.commissionAmount || 0);
  }, 0);

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
              Administração - Afiliados
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerenciar todas as indicações e comissões do sistema
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={loadReferrals}
          >
            Atualizar
          </Button>
          <Button
            variant="outline"
            icon={<Download size={16} />}
            onClick={exportReferrals}
          >
            Exportar CSV
          </Button>
          {selectedReferrals.length > 0 && (
            <Button
              variant="primary"
              icon={<CreditCard size={16} />}
              onClick={() => setShowPaymentModal(true)}
            >
              Processar Pagamentos ({selectedReferrals.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Indicações</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{referrals.length}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total em Comissões</p>
                <p className="text-3xl font-bold text-green-600">R$ {totalCommissions.toFixed(2)}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comissões Pagas</p>
                <p className="text-3xl font-bold text-[#00ac75]">R$ {paidCommissions.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-[#00ac75]/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-[#00ac75]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comissões Pendentes</p>
                <p className="text-3xl font-bold text-orange-600">R$ {pendingCommissions.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar afiliados ou indicados..."
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
              <option value="pending">Pendente</option>
              <option value="paid">Paga</option>
              <option value="cancelled">Cancelada</option>
            </select>

            <select
              value={affiliateFilter}
              onChange={(e) => setAffiliateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os afiliados</option>
              {getUniqueAffiliates().map(email => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setAffiliateFilter('all');
                setSelectedReferrals([]);
              }}
              disabled={searchQuery === '' && statusFilter === 'all' && affiliateFilter === 'all'}
            >
              Limpar Filtros
            </Button>

            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={filteredReferrals.filter(r => r.commissionStatus === 'pending').length === 0}
              icon={<CheckCircle size={16} />}
            >
              {selectedReferrals.length === filteredReferrals.filter(r => r.commissionStatus === 'pending').length 
                ? 'Desmarcar Todos' 
                : 'Selecionar Pendentes'
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Summary */}
      {selectedReferrals.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  {selectedReferrals.length} comissões selecionadas
                </span>
              </div>
              <div className="text-blue-800 dark:text-blue-200 font-bold">
                Total: R$ {selectedCommissionTotal.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader 
          title={`Indicações (${filteredReferrals.length})`}
          description={`${filteredReferrals.length} de ${referrals.length} indicações`}
        />
        <CardContent>
          {filteredReferrals.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma indicação encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente ajustar os filtros para encontrar indicações.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedReferrals.length === filteredReferrals.filter(r => r.commissionStatus === 'pending').length && filteredReferrals.filter(r => r.commissionStatus === 'pending').length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-[#00ac75] border-gray-300 rounded focus:ring-[#00ac75]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usuário Afiliado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usuário Contratante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Plano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Comissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredReferrals.map((referral, index) => (
                    <motion.tr
                      key={referral.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedReferrals.includes(referral.id)}
                          onChange={() => handleReferralToggle(referral.id)}
                          disabled={referral.commissionStatus !== 'pending'}
                          className="w-4 h-4 text-[#00ac75] border-gray-300 rounded focus:ring-[#00ac75] disabled:opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {referral.affiliateName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {referral.affiliateEmail}
                          </div>
                          <div className="text-xs text-gray-400">
                            Código: {referral.affiliateCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {referral.referredName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {referral.referredEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Crown size={14} className="mr-2 text-yellow-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {getPlanName(referral.priceId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-green-600">
                          <DollarSign size={14} className="mr-1" />
                          R$ {referral.commissionAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(referral.commissionStatus)}
                          {referral.paidAt && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Pago em {new Date(referral.paidAt).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Processing Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Processar Pagamentos de Comissões"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleProcessPayments}
              isLoading={isProcessingPayment}
              icon={<CreditCard size={16} />}
            >
              Confirmar Pagamentos
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Resumo dos Pagamentos
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Comissões selecionadas:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100 ml-2">
                  {selectedReferrals.length}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Valor total:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100 ml-2">
                  R$ {selectedCommissionTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Comissões a serem processadas:
            </h4>
            <div className="space-y-2">
              {selectedReferrals.map(id => {
                const referral = filteredReferrals.find(r => r.id === id);
                if (!referral) return null;
                
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {referral.affiliateName} → {referral.referredName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {referral.affiliateEmail} | {getPlanName(referral.priceId)}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      R$ {referral.commissionAmount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start">
              <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Atenção
                </h4>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Esta ação marcará as comissões selecionadas como "Pagas". Certifique-se de que 
                  os pagamentos foram realmente processados antes de confirmar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAffiliate;