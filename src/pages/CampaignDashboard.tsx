import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Campaign, NpsResponse } from '../types';
import { getCampaigns, getResponses, getSources, getSituations, getContacts, getGroups } from '../utils/localStorage';
import { calculateNPS, categorizeResponses, responsesBySource, npsOverTime } from '../utils/npsCalculator';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { NpsDoughnut, NpsDistribution, NpsTrend } from '../components/dashboard/NpsChart';
import { 
  ChevronLeft, 
  PieChart, 
  Edit, 
  MessageSquare, 
  Share, 
  Monitor, 
  X, 
  Maximize,
  Mail,
  Send,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

const CampaignDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [responses, setResponses] = useState<NpsResponse[]>([]);
  const [sources, setSources] = useState<Record<string, string>>({});
  const [situations, setSituations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTvMode, setIsTvMode] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [targetContacts, setTargetContacts] = useState<any[]>([]);
  
  useEffect(() => {
    if (!id) return;
    
    const loadData = () => {
      // Load campaign data
      const campaigns = getCampaigns();
      const foundCampaign = campaigns.find((c) => c.id === id);
      
      if (!foundCampaign) {
        navigate('/');
        return;
      }
      
      setCampaign(foundCampaign);
      
      // Load responses for this campaign
      const campaignResponses = getResponses(id);
      setResponses(campaignResponses);
      
      // Load sources and situations for reference
      const allSources = getSources();
      const sourcesMap: Record<string, string> = {};
      allSources.forEach((source) => {
        sourcesMap[source.id] = source.name;
      });
      setSources(sourcesMap);
      
      const allSituations = getSituations();
      const situationsMap: Record<string, string> = {};
      allSituations.forEach((situation) => {
        situationsMap[situation.id] = situation.name;
      });
      setSituations(situationsMap);
      
      // Load contacts for the campaign's group
      if (foundCampaign.defaultGroupId) {
        const allContacts = getContacts();
        const groupContacts = allContacts.filter(contact => 
          contact.groupIds.includes(foundCampaign.defaultGroupId!)
        );
        setTargetContacts(groupContacts);
        
        // Set default email content
        setEmailSubject(`Pesquisa NPS: ${foundCampaign.name}`);
        setEmailBody(`Olá,

Gostaríamos de conhecer sua opinião sobre nossos serviços. Sua avaliação é muito importante para nós!

Por favor, clique no link abaixo para responder nossa pesquisa NPS:
${window.location.origin}/survey/${foundCampaign.id}

A pesquisa leva apenas alguns minutos para ser concluída.

Obrigado pela sua participação!

Atenciosamente,
Equipe ${foundCampaign.name}`);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [id, navigate]);

  // Handle escape key to exit TV mode
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isTvMode) {
        setIsTvMode(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isTvMode]);

  // Auto-refresh data in TV mode
  useEffect(() => {
    if (!isTvMode || !id) return;

    const interval = setInterval(() => {
      const campaignResponses = getResponses(id);
      setResponses(campaignResponses);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isTvMode, id]);

  const handleSendEmail = async () => {
    if (!campaign || targetContacts.length === 0) return;
    
    setEmailStatus('sending');
    setEmailMessage('');
    
    try {
      // Simulate email sending process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would integrate with an email service
      // For now, we'll just simulate success
      setEmailStatus('success');
      setEmailMessage(`E-mails enviados com sucesso para ${targetContacts.length} contatos!`);
      
      // Auto-close modal after success
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailStatus('idle');
        setEmailMessage('');
      }, 3000);
      
    } catch (error) {
      setEmailStatus('error');
      setEmailMessage('Erro ao enviar e-mails. Tente novamente.');
    }
  };

  const openEmailModal = () => {
    if (!campaign?.defaultGroupId) {
      alert('Esta campanha não possui um grupo padrão configurado. Configure um grupo nas configurações da campanha.');
      return;
    }
    
    if (targetContacts.length === 0) {
      alert('Não há contatos no grupo desta campanha. Adicione contatos ao grupo primeiro.');
      return;
    }
    
    setIsEmailModalOpen(true);
  };
  
  if (isLoading || !campaign) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }
  
  const npsScore = calculateNPS(responses);
  const { promoters, passives, detractors } = categorizeResponses(responses);
  const trendData = npsOverTime(responses, 6);
  
  // Format dates
  const startDate = new Date(campaign.startDate).toLocaleDateString();
  const endDate = campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Presente';

  // TV Mode Component
  const TvDashboard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white z-50 overflow-hidden"
    >
      {/* Exit Button */}
      <button
        onClick={() => setIsTvMode(false)}
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Header - Compact */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{campaign.name}</h1>
            <div className="flex items-center space-x-3 text-gray-300">
              <span className="text-sm">{startDate} até {endDate}</span>
              {campaign.active ? (
                <Badge variant="success" className="text-xs px-2 py-1">Ativa</Badge>
              ) : (
                <Badge variant="danger" className="text-xs px-2 py-1">Inativa</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Última atualização</div>
            <div className="text-sm text-white">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <PieChart size={48} className="text-gray-400 mx-auto mb-3" />
            <h3 className="text-2xl font-semibold text-white mb-3">Nenhuma resposta ainda</h3>
            <p className="text-lg text-gray-400">
              Aguardando primeiras respostas da pesquisa NPS
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 h-[calc(100vh-120px)] flex flex-col">
          {/* Main Metrics Row */}
          <div className="grid grid-cols-12 gap-4 mb-4 flex-shrink-0">
            {/* NPS Score - Compact */}
            <div className="col-span-3">
              <div className="bg-gray-800 rounded-xl p-4 h-full flex flex-col items-center justify-center border border-gray-700">
                <h2 className="text-lg font-semibold text-gray-300 mb-3">Pontuação NPS</h2>
                <div className="flex justify-center mb-3">
                  <NpsDoughnut npsScore={npsScore} width={160} height={160} />
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Baseado em</div>
                  <div className="text-xl font-bold text-white">{responses.length} respostas</div>
                </div>
              </div>
            </div>

            {/* Distribution - Compact */}
            <div className="col-span-4">
              <div className="bg-gray-800 rounded-xl p-4 h-full border border-gray-700">
                <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">Distribuição</h2>
                <div className="h-32 mb-3">
                  <NpsDistribution
                    promoters={promoters}
                    passives={passives}
                    detractors={detractors}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-red-900/30 p-2 rounded-lg text-center border border-red-800">
                    <div className="text-xl font-bold text-red-400">{detractors}</div>
                    <div className="text-xs text-red-300">Detratores</div>
                  </div>
                  <div className="bg-yellow-900/30 p-2 rounded-lg text-center border border-yellow-800">
                    <div className="text-xl font-bold text-yellow-400">{passives}</div>
                    <div className="text-xs text-yellow-300">Neutros</div>
                  </div>
                  <div className="bg-green-900/30 p-2 rounded-lg text-center border border-green-800">
                    <div className="text-xl font-bold text-green-400">{promoters}</div>
                    <div className="text-xs text-green-300">Promotores</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend - Compact */}
            <div className="col-span-5">
              <div className="bg-gray-800 rounded-xl p-4 h-full border border-gray-700">
                <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">Tendência NPS</h2>
                <div className="h-40">
                  <NpsTrend data={trendData} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Responses - Flexible Height */}
          <div className="flex-1 min-h-0">
            <div className="bg-gray-800 rounded-xl p-4 h-full border border-gray-700 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-300 mb-3">Últimas Respostas</h2>
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {responses.slice(0, 8).map((response) => (
                    <div key={response.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600 flex-shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                            response.score >= 9 
                              ? 'bg-green-500 text-white' 
                              : response.score <= 6 
                              ? 'bg-red-500 text-white' 
                              : 'bg-yellow-500 text-white'
                          }`}
                        >
                          {response.score}
                        </div>
                        <div className="text-right flex-1 ml-2">
                          <div className="text-sm font-medium text-white truncate">
                            {sources[response.sourceId] || 'Fonte Desconhecida'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(response.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {response.feedback && (
                        <div className="text-xs text-gray-300 bg-gray-600 p-2 rounded line-clamp-2">
                          "{response.feedback}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Compact */}
      <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center text-gray-400 text-xs">
        <div>Pressione ESC para sair do modo TV</div>
        <div>Atualização automática a cada 30 segundos</div>
      </div>
    </motion.div>
  );
  
  return (
    <>
      <div>
        <div className="mb-6">
          <Link to="/campaigns">
            <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
        
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
              <div className="flex items-center mt-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {startDate} até {endDate}
                </span>
                {campaign.active ? (
                  <Badge variant="success" className="ml-2">
                    Ativa
                  </Badge>
                ) : (
                  <Badge variant="danger" className="ml-2">
                    Inativa
                  </Badge>
                )}
              </div>
              {campaign.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">{campaign.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                icon={<Monitor size={16} />}
                onClick={() => setIsTvMode(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Modo TV
              </Button>
              <Button 
                variant="secondary" 
                icon={<Mail size={16} />}
                onClick={openEmailModal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Enviar por E-mail
              </Button>
              <Link to={`/campaigns/${id}/form`}>
                <Button variant="outline" icon={<Edit size={16} />}>
                  Editar Formulário
                </Button>
              </Link>
              <Link to={`/campaigns/${id}/responses`}>
                <Button variant="outline" icon={<MessageSquare size={16} />}>
                  Ver Respostas
                </Button>
              </Link>
              <Link to={`/campaigns/${id}/share`}>
                <Button variant="primary" icon={<Share size={16} />}>
                  Compartilhar
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        {responses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="mb-4 w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <PieChart size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhuma resposta ainda</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Compartilhe sua pesquisa NPS com clientes para começar a coletar feedback.
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="secondary" icon={<Mail size={16} />} onClick={openEmailModal}>
                Enviar por E-mail
              </Button>
              <Link to={`/campaigns/${id}/share`}>
                <Button variant="primary">
                  Compartilhar Pesquisa
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader title="Pontuação NPS Atual" />
                <CardContent>
                  <div className="flex justify-center py-4">
                    <NpsDoughnut npsScore={npsScore} width={200} height={200} />
                  </div>
                  <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Baseado em {responses.length} respostas
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-8">
              <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader title="Tendência NPS" />
                <CardContent>
                  <div className="h-64">
                    <NpsTrend data={trendData} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader title="Distribuição de Respostas" />
                <CardContent>
                  <div className="h-64">
                    <NpsDistribution
                      promoters={promoters}
                      passives={passives}
                      detractors={detractors}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      <div className="text-xl font-bold text-red-500">{detractors}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Detratores</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                      <div className="text-xl font-bold text-yellow-500">{passives}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Neutros</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                      <div className="text-xl font-bold text-green-500">{promoters}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Promotores</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader title="Últimas Respostas" />
                <CardContent>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {responses.slice(0, 5).map((response) => (
                      <div key={response.id} className="py-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                response.score >= 9 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                                  : response.score <= 6 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' 
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                              }`}
                            >
                              {response.score}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {sources[response.sourceId] || 'Fonte Desconhecida'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(response.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge>
                            {situations[response.situationId] || 'Desconhecido'}
                          </Badge>
                        </div>
                        {response.feedback && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-13 ml-10">
                            "{response.feedback}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {responses.length > 5 && (
                    <div className="mt-4 text-center">
                      <Link to={`/campaigns/${id}/responses`}>
                        <Button variant="outline" size="sm">
                          Ver Todas ({responses.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* TV Mode Overlay */}
      <AnimatePresence>
        {isTvMode && <TvDashboard />}
      </AnimatePresence>

      {/* Email Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Enviar Campanha por E-mail"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEmailModalOpen(false)}
              disabled={emailStatus === 'sending'}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendEmail}
              isLoading={emailStatus === 'sending'}
              icon={emailStatus === 'sending' ? <Clock size={16} /> : <Send size={16} />}
              disabled={!emailSubject || !emailBody || targetContacts.length === 0}
            >
              {emailStatus === 'sending' ? 'Enviando...' : `Enviar para ${targetContacts.length} contatos`}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Status Messages */}
          {emailStatus === 'success' && (
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">E-mails Enviados!</h4>
                <p className="text-sm text-green-700 dark:text-green-300">{emailMessage}</p>
              </div>
            </div>
          )}

          {emailStatus === 'error' && (
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Erro no Envio</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{emailMessage}</p>
              </div>
            </div>
          )}

          {/* Target Contacts Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-2">
              <Users size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Contatos do Grupo: {getGroups().find(g => g.id === campaign?.defaultGroupId)?.name || 'Grupo Padrão'}
              </h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              {targetContacts.length} contatos receberão o e-mail com o link da pesquisa NPS.
            </p>
            <div className="max-h-32 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {targetContacts.slice(0, 10).map((contact) => (
                  <div key={contact.id} className="text-xs text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 px-2 py-1 rounded">
                    {contact.name} ({contact.email})
                  </div>
                ))}
              </div>
              {targetContacts.length > 10 && (
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                  +{targetContacts.length - 10} contatos adicionais...
                </p>
              )}
            </div>
          </div>

          {/* Email Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assunto do E-mail
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Digite o assunto do e-mail"
              disabled={emailStatus === 'sending'}
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conteúdo do E-mail
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={8}
              placeholder="Digite o conteúdo do e-mail"
              disabled={emailStatus === 'sending'}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              O link da pesquisa já está incluído no texto padrão. Você pode personalizar a mensagem conforme necessário.
            </p>
          </div>

          {/* Survey Link Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link da Pesquisa (incluído no e-mail):
            </h4>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
              <code className="text-sm text-blue-600 dark:text-blue-400 break-all">
                {window.location.origin}/survey/{campaign?.id}
              </code>
            </div>
          </div>

          {/* Warning if no contacts */}
          {targetContacts.length === 0 && (
            <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Nenhum Contato Encontrado</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Não há contatos vinculados ao grupo desta campanha. Adicione contatos ao grupo primeiro.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default CampaignDashboard;