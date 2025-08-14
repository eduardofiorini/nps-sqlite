import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  Check,
  X,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  AlertTriangle,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { AdminPlan } from '../../types/admin';
import { getAdminPlans } from '../../utils/supabaseStorage';

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AdminPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<AdminPlan | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const adminPlans = await getAdminPlans();
      setPlans(adminPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setSelectedPlan({
      id: '',
      name: '',
      description: '',
      price: 0,
      currency: 'BRL',
      interval: 'month',
      features: [],
      limits: {
        campaigns: 0,
        responses: 0,
        users: 1
      },
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: AdminPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
    setShowPlanModal(true);
  };

  const handleDeletePlan = (plan: AdminPlan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(price / 100);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter':
        return <Users size={24} className="text-green-600" />;
      case 'pro':
        return <BarChart3 size={24} className="text-blue-600" />;
      case 'enterprise':
        return <Zap size={24} className="text-purple-600" />;
      default:
        return <CreditCard size={24} className="text-gray-600" />;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Planos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure planos de assinatura e preços
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={handleCreatePlan}
        >
          Novo Plano
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-white dark:bg-gray-800 border-2 transition-all duration-300 ${
              plan.popular 
                ? 'border-[#073143] shadow-lg' 
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <CardContent className="p-6">
                {plan.popular && (
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-r from-[#073143] to-[#0a4a5c] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star size={12} className="mr-1" />
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                    {getPlanIcon(plan.id)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-[#073143] dark:text-white mb-2">
                    {formatPrice(plan.price, plan.currency)}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      /{plan.interval === 'month' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Limites
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {plan.limits.campaigns === 'unlimited' ? '∞' : plan.limits.campaigns}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Campanhas</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {plan.limits.responses === 'unlimited' ? '∞' : plan.limits.responses}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Respostas</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {plan.limits.users === 'unlimited' ? '∞' : plan.limits.users}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Usuários</div>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 4).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm">
                      <Check size={14} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-xs text-gray-500 dark:text-gray-400">
                      +{plan.features.length - 4} recursos adicionais
                    </li>
                  )}
                </ul>

                <div className="flex items-center justify-between mb-4">
                  <Badge variant={plan.active ? "success" : "secondary"}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {plan.stripePriceId}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit size={14} />}
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDeletePlan(plan)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Plan Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={isEditing ? 'Editar Plano' : 'Novo Plano'}
        size="xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowPlanModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" icon={<Save size={16} />}>
              {isEditing ? 'Salvar Alterações' : 'Criar Plano'}
            </Button>
          </div>
        }
      >
        {selectedPlan && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Plano"
                value={selectedPlan.name}
                onChange={() => {}}
                placeholder="Ex: Profissional"
                fullWidth
                required
              />
              <Input
                label="ID do Stripe Price"
                value={selectedPlan.stripePriceId || ''}
                onChange={() => {}}
                placeholder="price_xxxxx"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={selectedPlan.description}
                onChange={() => {}}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Descreva o plano..."
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preço (em centavos)
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={selectedPlan.price}
                    onChange={() => {}}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="9900"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Valor: {formatPrice(selectedPlan.price, selectedPlan.currency)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moeda
                </label>
                <select
                  value={selectedPlan.currency}
                  onChange={() => {}}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="BRL">BRL (Real)</option>
                  <option value="USD">USD (Dólar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intervalo
                </label>
                <select
                  value={selectedPlan.interval}
                  onChange={() => {}}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="month">Mensal</option>
                  <option value="year">Anual</option>
                </select>
              </div>
            </div>

            {/* Limits */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Limites do Plano</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campanhas
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={selectedPlan.limits.campaigns === 'unlimited' ? '' : selectedPlan.limits.campaigns}
                      onChange={() => {}}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="10"
                      disabled={selectedPlan.limits.campaigns === 'unlimited'}
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlan.limits.campaigns === 'unlimited'}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Ilimitado</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Respostas/mês
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={selectedPlan.limits.responses === 'unlimited' ? '' : selectedPlan.limits.responses}
                      onChange={() => {}}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="1000"
                      disabled={selectedPlan.limits.responses === 'unlimited'}
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlan.limits.responses === 'unlimited'}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Ilimitado</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Usuários
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={selectedPlan.limits.users === 'unlimited' ? '' : selectedPlan.limits.users}
                      onChange={() => {}}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="5"
                      disabled={selectedPlan.limits.users === 'unlimited'}
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlan.limits.users === 'unlimited'}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Ilimitado</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recursos</h4>
              <div className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={() => {}}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      onClick={() => {}}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => {}}
                  className="w-full justify-center"
                >
                  Adicionar Recurso
                </Button>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPlan.active}
                  onChange={() => {}}
                  className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Plano Ativo</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPlan.popular || false}
                  onChange={() => {}}
                  className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Mais Popular</span>
              </label>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Plano"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<Trash2 size={16} />}>
              Excluir Plano
            </Button>
          </div>
        }
      >
        {planToDelete && (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Atenção: Esta ação não pode ser desfeita
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Excluir este plano pode afetar usuários que já possuem assinaturas ativas.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plano:</span>
                <span className="text-sm text-gray-900 dark:text-white">{planToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preço:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {formatPrice(planToDelete.price, planToDelete.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                <Badge variant={planToDelete.active ? "success" : "secondary"}>
                  {planToDelete.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPlans;