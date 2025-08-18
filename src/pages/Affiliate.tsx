import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Copy, 
  Link as LinkIcon,
  CreditCard,
  Banknote,
  QrCode,
  Eye,
  EyeOff,
  Save,
  Calendar,
  Mail,
  Crown,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserAffiliate, saveUserAffiliate, getAffiliateReferrals } from '../utils/affiliateStorage';
import { stripeProducts } from '../stripe-config';
import type { UserAffiliate, AffiliateReferral } from '../types';

const Affiliate: React.FC = () => {
  const { user } = useAuth();
  const { themeColor } = useConfig();
  const [affiliate, setAffiliate] = useState<UserAffiliate | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankData, setBankData] = useState({
    type: '',
    bank: '',
    agency: '',
    account: '',
    pixKey: '',
    pixType: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showPixKey, setShowPixKey] = useState(false);

  useEffect(() => {
    loadAffiliateData();
  }, []);

  const loadAffiliateData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [affiliateData, referralsData] = await Promise.all([
        getUserAffiliate(),
        getAffiliateReferrals()
      ]);
      
      setAffiliate(affiliateData);
      setReferrals(referralsData);
      
      if (affiliateData?.bankAccount) {
        setBankData(affiliateData.bankAccount);
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!affiliate) return;
    
    const affiliateLink = `${window.location.origin}/register?ref=${affiliate.affiliateCode}`;
    
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSaveBankData = async () => {
    if (!affiliate) return;
    
    setIsSaving(true);
    
    try {
      const updatedAffiliate = {
        ...affiliate,
        bankAccount: bankData
      };
      
      await saveUserAffiliate(updatedAffiliate);
      setAffiliate(updatedAffiliate);
      setShowBankModal(false);
      setSaveMessage('Dados bancários salvos com sucesso!');
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving bank data:', error);
      setSaveMessage('Erro ao salvar dados bancários. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportReferrals = () => {
    const csvHeaders = [
      'Data de Criação',
      'Email do Indicado',
      'Plano',
      'Valor da Comissão',
      'Status da Comissão',
      'Data do Pagamento'
    ];

    const csvRows = referrals.map(referral => [
      new Date(referral.createdAt).toLocaleDateString('pt-BR'),
      `"${maskEmail(referral.referredEmail || '')}"`,
      `"${referral.planName || 'Período de Teste'}"`,
      `R$ ${referral.commissionAmount.toFixed(2)}`,
      `"${getStatusLabel(referral.commissionStatus)}"`,
      referral.paidAt ? new Date(referral.paidAt).toLocaleDateString('pt-BR') : ''
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `indicacoes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const maskEmail = (email: string): string => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
      return `${username[0]}***@${domain}`;
    }
    return `${username.slice(0, 3)}***@${domain}`;
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: themeColor }}></div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Erro ao carregar dados de afiliado
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Não foi possível carregar suas informações de afiliado.
        </p>
      </div>
    );
  }

  const affiliateLink = `${window.location.origin}/register?ref=${affiliate.affiliateCode}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="mr-3" style={{ color: themeColor }} size={32} />
            Programa de Afiliados
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Ganhe 25% de comissão por cada indicação que se tornar cliente
          </p>
        </div>
        {referrals.length > 0 && (
          <Button
            variant="outline"
            icon={<Download size={16} />}
            onClick={exportReferrals}
          >
            Exportar Relatório
          </Button>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            saveMessage.includes('sucesso')
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {saveMessage}
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cadastrados</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{affiliate.totalReferrals}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ganhos</p>
                  <p className="text-3xl font-bold text-green-600">R$ {affiliate.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recebidos</p>
                  <p className="text-3xl font-bold" style={{ color: themeColor }}>R$ {affiliate.totalReceived.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${themeColor}20` }}>
                  <CheckCircle size={24} style={{ color: themeColor }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total a Receber</p>
                  <p className="text-3xl font-bold text-orange-600">R$ {affiliate.totalPending.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Clock size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Affiliate Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Seu Link de Afiliado" />
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Código de Afiliado:
                  </span>
                  <span className="text-lg font-bold" style={{ color: themeColor }}>
                    {affiliate.affiliateCode}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                  <code className="text-sm break-all text-gray-900 dark:text-white">
                    {affiliateLink}
                  </code>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  icon={copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  onClick={handleCopyLink}
                  className="flex-1"
                >
                  {copied ? 'Link Copiado!' : 'Copiar Link'}
                </Button>
                
                <Button
                  variant="outline"
                  icon={<QrCode size={16} />}
                  onClick={() => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(affiliateLink)}`;
                    window.open(qrUrl, '_blank');
                  }}
                >
                  QR Code
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Como Funciona o Programa de Afiliados
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Compartilhe seu link exclusivo com potenciais clientes</li>
                  <li>• Ganhe 25% de comissão sobre a primeira assinatura mensal paga</li>
                  <li>• Comissões são pagas mensalmente via PIX ou transferência bancária</li>
                  <li>• Apenas assinaturas pagas geram comissão (não inclui período de teste)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bank Account Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader 
            title="Dados para Recebimento" 
            action={
              <Button
                variant="outline"
                size="sm"
                icon={<CreditCard size={16} />}
                onClick={() => setShowBankModal(true)}
              >
                Configurar
              </Button>
            }
          />
          <CardContent>
            {affiliate.bankAccount.type ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Conta
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {affiliate.bankAccount.type === 'bank' ? 'Conta Bancária' : 'PIX'}
                  </p>
                </div>
                
                {affiliate.bankAccount.type === 'bank' ? (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Banco
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {affiliate.bankAccount.bank}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Agência
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {affiliate.bankAccount.agency}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Conta
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {affiliate.bankAccount.account}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Chave PIX ({affiliate.bankAccount.pixType?.toUpperCase()})
                    </h4>
                    <p className="text-gray-900 dark:text-white font-mono">
                      {affiliate.bankAccount.pixKey}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Configure seus dados para recebimento
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Adicione sua conta bancária ou chave PIX para receber as comissões
                </p>
                <Button
                  variant="primary"
                  icon={<CreditCard size={16} />}
                  onClick={() => setShowBankModal(true)}
                >
                  Configurar Agora
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Referrals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title={`Suas Indicações (${referrals.length})`} />
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhuma indicação ainda
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Compartilhe seu link de afiliado para começar a ganhar comissões
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data de Criação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email do Indicado
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
                    {referrals.map((referral, index) => (
                      <motion.tr
                        key={referral.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Calendar size={14} className="mr-2 text-gray-400" />
                            {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {maskEmail(referral.referredEmail || '')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Crown size={14} className="mr-2 text-yellow-500" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {getPlanName(referral.subscriptionId ? 'paid' : undefined)}
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
                          {getStatusBadge(referral.commissionStatus)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bank Account Modal */}
      <Modal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        title="Configurar Dados para Recebimento"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowBankModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveBankData}
              isLoading={isSaving}
              icon={<Save size={16} />}
            >
              Salvar Dados
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Account Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Conta
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setBankData({ ...bankData, type: 'bank' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  bankData.type === 'bank'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Banknote size={24} className="mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Conta Bancária
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setBankData({ ...bankData, type: 'pix' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  bankData.type === 'pix'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <QrCode size={24} className="mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  PIX
                </div>
              </button>
            </div>
          </div>

          {/* Bank Account Fields */}
          {bankData.type === 'bank' && (
            <div className="space-y-4">
              <Input
                label="Nome do Banco"
                value={bankData.bank}
                onChange={(e) => setBankData({ ...bankData, bank: e.target.value })}
                placeholder="Ex: Banco do Brasil, Itaú, Bradesco"
                fullWidth
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Agência"
                  value={bankData.agency}
                  onChange={(e) => setBankData({ ...bankData, agency: e.target.value })}
                  placeholder="0000"
                  fullWidth
                  required
                />
                
                <Input
                  label="Conta"
                  value={bankData.account}
                  onChange={(e) => setBankData({ ...bankData, account: e.target.value })}
                  placeholder="00000-0"
                  fullWidth
                  required
                />
              </div>
            </div>
          )}

          {/* PIX Fields */}
          {bankData.type === 'pix' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Chave PIX
                </label>
                <select
                  value={bankData.pixType}
                  onChange={(e) => setBankData({ ...bankData, pixType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">Email</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>
              
              <div className="relative">
                <Input
                  label="Chave PIX"
                  type={showPixKey ? 'text' : 'password'}
                  value={bankData.pixKey}
                  onChange={(e) => setBankData({ ...bankData, pixKey: e.target.value })}
                  placeholder={
                    bankData.pixType === 'cpf' ? '000.000.000-00' :
                    bankData.pixType === 'cnpj' ? '00.000.000/0000-00' :
                    bankData.pixType === 'email' ? 'seu@email.com' :
                    bankData.pixType === 'phone' ? '(11) 99999-9999' :
                    'Sua chave PIX'
                  }
                  fullWidth
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPixKey(!showPixKey)}
                  className="absolute top-9 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPixKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {bankData.type && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start">
                <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Importante
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Verifique cuidadosamente os dados antes de salvar. Estes dados serão usados 
                    para o pagamento das suas comissões. Dados incorretos podem atrasar ou impedir 
                    o recebimento dos valores.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Affiliate;