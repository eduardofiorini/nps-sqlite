import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { 
  Settings, 
  Save, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Server,
  Mail,
  CreditCard,
  Shield,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { AdminConfig } from '../../types/admin';

const AdminSettings: React.FC = () => {
  const [configs, setConfigs] = useState<AdminConfig[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<AdminConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AdminConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  useEffect(() => {
    filterConfigs();
  }, [configs, searchQuery, categoryFilter]);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading config data
      setTimeout(() => {
        const mockConfigs: AdminConfig[] = [
          {
            id: '1',
            key: 'app.name',
            value: 'Meu NPS',
            type: 'string',
            category: 'general',
            description: 'Nome da aplicação exibido na interface',
            editable: true,
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            key: 'app.version',
            value: '1.0.0',
            type: 'string',
            category: 'general',
            description: 'Versão atual da aplicação',
            editable: false,
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            key: 'email.default_sender',
            value: 'noreply@meunps.com',
            type: 'string',
            category: 'email',
            description: 'Email padrão para envio de notificações',
            editable: true,
            updatedAt: new Date().toISOString()
          },
          {
            id: '4',
            key: 'stripe.webhook_secret',
            value: 'whsec_xxxxxxxxxxxxxxxxx',
            type: 'string',
            category: 'payment',
            description: 'Chave secreta do webhook do Stripe',
            editable: true,
            sensitive: true,
            updatedAt: new Date().toISOString()
          },
          {
            id: '5',
            key: 'features.ai_insights',
            value: true,
            type: 'boolean',
            category: 'features',
            description: 'Habilitar insights com IA nos relatórios',
            editable: true,
            updatedAt: new Date().toISOString()
          },
          {
            id: '6',
            key: 'security.max_login_attempts',
            value: 5,
            type: 'number',
            category: 'security',
            description: 'Número máximo de tentativas de login',
            editable: true,
            updatedAt: new Date().toISOString()
          },
          {
            id: '7',
            key: 'email.smtp_settings',
            value: {
              host: 'smtp.gmail.com',
              port: 587,
              secure: false
            },
            type: 'json',
            category: 'email',
            description: 'Configurações padrão do servidor SMTP',
            editable: true,
            updatedAt: new Date().toISOString()
          }
        ];
        
        setConfigs(mockConfigs);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading configs:', error);
      setIsLoading(false);
    }
  };

  const filterConfigs = () => {
    let filtered = [...configs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(config =>
        config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(config => config.category === categoryFilter);
    }

    setFilteredConfigs(filtered);
  };

  const handleEditConfig = (config: AdminConfig) => {
    setSelectedConfig(config);
    setIsEditing(true);
    setShowConfigModal(true);
  };

  const handleCreateConfig = () => {
    setSelectedConfig({
      id: '',
      key: '',
      value: '',
      type: 'string',
      category: 'general',
      description: '',
      editable: true,
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
    setShowConfigModal(true);
  };

  const toggleSensitiveVisibility = (configId: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return <Settings size={16} className="text-gray-500" />;
      case 'email':
        return <Mail size={16} className="text-blue-500" />;
      case 'payment':
        return <CreditCard size={16} className="text-green-500" />;
      case 'security':
        return <Shield size={16} className="text-red-500" />;
      case 'features':
        return <Zap size={16} className="text-purple-500" />;
      default:
        return <Server size={16} className="text-gray-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      general: 'secondary',
      email: 'info',
      payment: 'success',
      security: 'danger',
      features: 'primary'
    } as const;

    return (
      <Badge variant={variants[category as keyof typeof variants] || 'secondary'}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const formatValue = (config: AdminConfig) => {
    if (config.sensitive && !showSensitive[config.id]) {
      return '••••••••••••';
    }

    switch (config.type) {
      case 'boolean':
        return config.value ? 'Verdadeiro' : 'Falso';
      case 'json':
        return JSON.stringify(config.value, null, 2);
      default:
        return String(config.value);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações do Sistema</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie configurações globais da plataforma
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={handleCreateConfig}
        >
          Nova Configuração
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar configurações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todas as categorias</option>
              <option value="general">Geral</option>
              <option value="email">Email</option>
              <option value="payment">Pagamento</option>
              <option value="security">Segurança</option>
              <option value="features">Recursos</option>
            </select>

            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Filter size={16} className="mr-2" />
              {filteredConfigs.length} de {configs.length} configurações
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configs Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title={`Configurações (${filteredConfigs.length})`} />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Chave
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Atualizado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConfigs.map((config, index) => (
                  <motion.tr
                    key={config.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                          {getCategoryIcon(config.category)}
                          <span className="ml-2">{config.key}</span>
                          {config.sensitive && (
                            <Shield size={14} className="ml-2 text-yellow-500" title="Configuração sensível" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {config.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`text-sm font-mono ${
                          config.type === 'json' ? 'max-w-xs' : 'max-w-sm'
                        } truncate`}>
                          {config.type === 'json' ? (
                            <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                              {formatValue(config)}
                            </pre>
                          ) : (
                            <span className="text-gray-900 dark:text-white">
                              {formatValue(config)}
                            </span>
                          )}
                        </div>
                        {config.sensitive && (
                          <button
                            onClick={() => toggleSensitiveVisibility(config.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showSensitive[config.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(config.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="text-xs">
                        {config.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(config.updatedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {config.editable && (
                          <button
                            onClick={() => handleEditConfig(config)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded"
                            title="Editar configuração"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {config.editable && (
                          <button
                            onClick={() => {}}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded"
                            title="Excluir configuração"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {!config.editable && (
                          <Badge variant="secondary" className="text-xs">
                            Somente leitura
                          </Badge>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredConfigs.length === 0 && (
            <div className="text-center py-12">
              <Settings size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma configuração encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente ajustar os filtros para encontrar as configurações que procura.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Config Edit Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={isEditing ? 'Editar Configuração' : 'Nova Configuração'}
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowConfigModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" icon={<Save size={16} />}>
              {isEditing ? 'Salvar Alterações' : 'Criar Configuração'}
            </Button>
          </div>
        }
      >
        {selectedConfig && (
          <div className="space-y-6">
            {/* Warning for sensitive configs */}
            {selectedConfig.sensitive && (
              <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Configuração Sensível
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Esta configuração contém informações sensíveis. Tenha cuidado ao editá-la.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Chave"
                value={selectedConfig.key}
                onChange={() => {}}
                placeholder="app.feature_name"
                fullWidth
                required
                disabled={isEditing}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={selectedConfig.type}
                  onChange={() => {}}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isEditing}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={selectedConfig.category}
                onChange={() => {}}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="general">Geral</option>
                <option value="email">Email</option>
                <option value="payment">Pagamento</option>
                <option value="security">Segurança</option>
                <option value="features">Recursos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={selectedConfig.description}
                onChange={() => {}}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Descreva o propósito desta configuração..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor
              </label>
              {selectedConfig.type === 'boolean' ? (
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="booleanValue"
                      checked={selectedConfig.value === true}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#073143] border-gray-300 focus:ring-[#073143]"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Verdadeiro</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="booleanValue"
                      checked={selectedConfig.value === false}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#073143] border-gray-300 focus:ring-[#073143]"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Falso</span>
                  </label>
                </div>
              ) : selectedConfig.type === 'json' ? (
                <textarea
                  value={typeof selectedConfig.value === 'object' 
                    ? JSON.stringify(selectedConfig.value, null, 2) 
                    : selectedConfig.value
                  }
                  onChange={() => {}}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  rows={6}
                  placeholder='{"key": "value"}'
                />
              ) : (
                <input
                  type={selectedConfig.type === 'number' ? 'number' : 'text'}
                  value={selectedConfig.value}
                  onChange={() => {}}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Digite o valor..."
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedConfig.editable}
                  onChange={() => {}}
                  className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Editável</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedConfig.sensitive || false}
                  onChange={() => {}}
                  className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Sensível</span>
              </label>
            </div>

            {/* Info about sensitive configs */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <Info size={16} className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Dicas de Configuração
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                    <li>• Use pontos para separar níveis (ex: app.email.sender)</li>
                    <li>• Marque como "Sensível" para ocultar valores por padrão</li>
                    <li>• Configurações não editáveis são protegidas contra alterações</li>
                    <li>• Use JSON para configurações complexas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSettings;