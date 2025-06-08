import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Campaign, NpsResponse } from '../types';
import { getCampaigns, getResponses, getSources, getSituations } from '../utils/localStorage';
import { calculateNPS, categorizeResponses, responsesBySource, npsOverTime } from '../utils/npsCalculator';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { NpsDoughnut, NpsDistribution, NpsTrend } from '../components/dashboard/NpsChart';
import { ChevronLeft, PieChart, Edit, MessageSquare, Share, Monitor, X, Maximize } from 'lucide-react';
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
        className="absolute top-6 right-6 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200"
      >
        <X size={24} className="text-white" />
      </button>

      {/* Header */}
      <div className="p-8 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{campaign.name}</h1>
            <div className="flex items-center space-x-4 text-gray-300">
              <span className="text-lg">{startDate} até {endDate}</span>
              {campaign.active ? (
                <Badge variant="success" className="text-lg px-4 py-2">Ativa</Badge>
              ) : (
                <Badge variant="danger" className="text-lg px-4 py-2">Inativa</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Última atualização</div>
            <div className="text-lg text-white">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <PieChart size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-3xl font-semibold text-white mb-4">Nenhuma resposta ainda</h3>
            <p className="text-xl text-gray-400">
              Aguardando primeiras respostas da pesquisa NPS
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 h-full overflow-y-auto">
          <div className="grid grid-cols-12 gap-8 h-full">
            {/* NPS Score - Large Display */}
            <div className="col-span-4 flex flex-col">
              <div className="bg-gray-800 rounded-2xl p-8 flex-1 flex flex-col items-center justify-center border border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-300 mb-6">Pontuação NPS</h2>
                <div className="flex justify-center mb-6">
                  <NpsDoughnut npsScore={npsScore} width={280} height={280} />
                </div>
                <div className="text-center">
                  <div className="text-lg text-gray-400">Baseado em</div>
                  <div className="text-3xl font-bold text-white">{responses.length} respostas</div>
                </div>
              </div>
            </div>

            {/* Distribution */}
            <div className="col-span-4 flex flex-col">
              <div className="bg-gray-800 rounded-2xl p-8 flex-1 border border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-300 mb-6 text-center">Distribuição</h2>
                <div className="h-64 mb-6">
                  <NpsDistribution
                    promoters={promoters}
                    passives={passives}
                    detractors={detractors}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-900/30 p-4 rounded-xl text-center border border-red-800">
                    <div className="text-3xl font-bold text-red-400">{detractors}</div>
                    <div className="text-sm text-red-300">Detratores</div>
                  </div>
                  <div className="bg-yellow-900/30 p-4 rounded-xl text-center border border-yellow-800">
                    <div className="text-3xl font-bold text-yellow-400">{passives}</div>
                    <div className="text-sm text-yellow-300">Neutros</div>
                  </div>
                  <div className="bg-green-900/30 p-4 rounded-xl text-center border border-green-800">
                    <div className="text-3xl font-bold text-green-400">{promoters}</div>
                    <div className="text-sm text-green-300">Promotores</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className="col-span-4 flex flex-col">
              <div className="bg-gray-800 rounded-2xl p-8 flex-1 border border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-300 mb-6 text-center">Tendência NPS</h2>
                <div className="h-80">
                  <NpsTrend data={trendData} />
                </div>
              </div>
            </div>

            {/* Recent Responses */}
            <div className="col-span-12">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-300 mb-6">Últimas Respostas</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {responses.slice(0, 6).map((response) => (
                    <div key={response.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <div 
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                            response.score >= 9 
                              ? 'bg-green-500 text-white' 
                              : response.score <= 6 
                              ? 'bg-red-500 text-white' 
                              : 'bg-yellow-500 text-white'
                          }`}
                        >
                          {response.score}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-medium text-white">
                            {sources[response.sourceId] || 'Fonte Desconhecida'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(response.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {response.feedback && (
                        <div className="text-sm text-gray-300 bg-gray-600 p-3 rounded-lg">
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

      {/* Footer */}
      <div className="absolute bottom-4 left-8 right-8 flex justify-between items-center text-gray-400 text-sm">
        <div>Pressione ESC para sair do modo TV</div>
        <div>Atualização automática a cada 30 segundos</div>
      </div>
    </motion.div>
  );
  
  return (
    <>
      <div>
        <div className="mb-6">
          <Link to="/">
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
            <Link to={`/campaigns/${id}/share`}>
              <Button variant="primary">
                Compartilhar Pesquisa
              </Button>
            </Link>
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
    </>
  );
};

export default CampaignDashboard;