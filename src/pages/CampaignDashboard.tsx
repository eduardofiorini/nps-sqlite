import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Campaign, NpsResponse, Source, Situation, Group } from '../types';
import { 
  getCampaigns, 
  getResponses, 
  getSources, 
  getSituations, 
  getGroups 
} from '../utils/supabaseStorage';
import { calculateNPS, categorizeResponses, npsOverTime } from '../utils/npsCalculator';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { NpsDoughnut, NpsDistribution, NpsTrend } from '../components/dashboard/NpsChart';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar,
  Edit,
  Share2,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  ChevronRight,
  Monitor,
  X,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CampaignDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [responses, setResponses] = useState<NpsResponse[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTvMode, setIsTvMode] = useState(false);

  // Calculate NPS metrics
  const npsScore = calculateNPS(responses);
  const { promoters, passives, detractors, total } = categorizeResponses(responses);
  const trendData = npsOverTime(responses);

  // Get recent responses (last 5)
  const recentResponses = responses.slice(0, 5);

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load campaign data
        const campaigns = await getCampaigns();
        const foundCampaign = campaigns.find(c => c.id === id);
        setCampaign(foundCampaign || null);

        // Load responses for this campaign
        const campaignResponses = await getResponses(id);
        setResponses(campaignResponses);

        // Load reference data
        const [sourcesData, situationsData, groupsData] = await Promise.all([
          getSources(),
          getSituations(),
          getGroups()
        ]);
        
        setSources(sourcesData);
        setSituations(situationsData);
        setGroups(groupsData);
      } catch (error) {
        console.error('Error loading campaign data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

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



  
  // Format dates
  const startDate = campaign?.startDate ? new Date(campaign.startDate).toLocaleDateString('pt-BR') : 'N/A';
  const endDate = campaign?.endDate ? new Date(campaign.endDate).toLocaleDateString('pt-BR') : 'Presente';


// TV Mode Component
const TvDashboard = () => {
  const tvDashboardRef = React.useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Auto-refresh data in TV mode
  useEffect(() => {
  if (!isTvMode || !id) return;
  
    const interval = setInterval(async () => {
      try {
            
            // Atualiza todas as informações necessárias
            const [campaigns, campaignResponses, sourcesData, situationsData, groupsData] = await Promise.all([
              getCampaigns(),
              getResponses(id),
              getSources(),
              getSituations(),
              getGroups()
            ]);

            setCampaign(campaigns.find(c => c.id === id) || null);
            setResponses(campaignResponses);
            setSources(sourcesData);
            setSituations(situationsData);
            setGroups(groupsData);
            setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
            
          } catch (error) {
            console.error('Error refreshing data:', error);
          } finally {
          }
          }, 60000); 


        return () => clearInterval(interval);
      }, [isTvMode, id]);

  // Ativar fullscreen quando o componente montar
  useEffect(() => {
    // Limpeza ao desmontar
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  return (
    <motion.div
  ref={tvDashboardRef}
  initial={{ opacity: 0, margin: 0}}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 bg-black text-white z-[9999] flex flex-col overflow-hidden"
>
  {/* Exit Button */}
  <button
    onClick={() => setIsTvMode(false)}
    className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-all duration-200"
  >
    <X size={20} className="text-white" />
  </button>

  {/* Header */}
  <div className="p-4 border-b border-gray-700 bg-gray-800">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white mb-1 truncate max-w-[80vw]">
          {campaign?.name}
        </h1>
        <div className="flex items-center flex-wrap gap-2 text-gray-300">
          <span className="text-xs md:text-sm whitespace-nowrap">
            {startDate} até {endDate}
          </span>
          {campaign?.active ? (
            <Badge variant="success" className="text-xs px-2 py-1 bg-green-800">Ativa</Badge>
          ) : (
            <Badge variant="danger" className="text-xs px-2 py-1 bg-red-800">Inativa</Badge>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-400">Última atualização</div>
        <div className="text-sm text-white whitespace-nowrap">
          {new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>
    </div>
  </div>

  {responses.length === 0 ? (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
        <PieChart size={48} className="text-gray-400 mx-auto mb-3" />
        <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
          Nenhuma resposta ainda
        </h3>
        <p className="text-base md:text-lg text-gray-400">
          Aguardando primeiras respostas da pesquisa NPS
        </p>
      </div>
    </div>
  ) : (
    <div className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden bg-gray-900">
      {/* Main Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-4 mb-2 md:mb-4 flex-shrink-0">
        {/* NPS Score e Distribution */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {/* NPS Score */}
          <div className="bg-gray-800 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center border border-gray-700">
            <h2 className="text-base md:text-lg font-semibold text-gray-300 mb-2 md:mb-3">
              Pontuação NPS
            </h2>
            <div className="flex justify-center mb-2 md:mb-3">
              <NpsDoughnut 
                npsScore={npsScore} 
                width={window.innerWidth < 868 ? 160 : 260} 
                height={window.innerWidth < 868 ? 160 : 260} 
              />
            </div>
            <div className="text-center">
              <div className="text-xs md:text-sm text-gray-400">Baseado em</div>
              <div className="text-lg md:text-xl font-bold text-white">
                {responses.length} respostas
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div className="bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-700">
            <h2 className="text-base md:text-lg font-semibold text-gray-300 mb-2 md:mb-3 text-center">
              Distribuição
            </h2>
            <div className="h-48 md:h-64 flex justify-center items-center mb-8">
              <NpsDistribution
                promoters={promoters}
                passives={passives}
                detractors={detractors}
              />
            </div>
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              <div className="bg-red-900/90 p-1 md:p-2 rounded-lg text-center border border-red-800">
                <div className="text-lg md:text-xl font-bold text-red-400">
                  {detractors}
                </div>
                <div className="text-2xs md:text-xs text-red-300">Detratores</div>
              </div>
              <div className="bg-yellow-900/90 p-1 md:p-2 rounded-lg text-center border border-yellow-800">
                <div className="text-lg md:text-xl font-bold text-yellow-400">
                  {passives}
                </div>
                <div className="text-2xs md:text-xs text-yellow-300">Neutros</div>
              </div>
              <div className="bg-green-900/90 p-1 md:p-2 rounded-lg text-center border border-green-800">
                <div className="text-lg md:text-xl font-bold text-green-400">
                  {promoters}
                </div>
                <div className="text-2xs md:text-xs text-green-300">Promotores</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="lg:col-span-5 mt-2 md:mt-0">
          <div className="bg-gray-800 rounded-xl p-3 md:p-4 h-full border border-gray-700">
            <h2 className="text-base md:text-lg font-semibold text-gray-300 mb-2 md:mb-3 text-center">
              Tendência NPS
            </h2>
            <div className="h-">
              <NpsTrend data={trendData} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Responses */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="bg-gray-800 rounded-xl p-3 md:p-4 h-full border border-gray-700 flex flex-col">
          <h2 className="text-base md:text-lg font-semibold text-gray-300 mb-2 md:mb-3">
            Últimas Respostas
          </h2>
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 h-full overflow-y-auto pb-2">
              {responses.slice(0, 8).map((response) => (
                <div 
                  key={response.id} 
                  className="bg-gray-700 rounded-lg p-2 md:p-3 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div 
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-base md:text-lg font-bold ${
                        response.score >= 9 
                          ? 'bg-green-600 text-white' 
                          : response.score <= 6 
                          ? 'bg-red-600 text-white' 
                          : 'bg-yellow-600 text-white'
                      }`}
                    >
                      {response.score}
                    </div>
                    <div className="text-right flex-1 ml-2">
                      <div className="text-xs md:text-sm font-medium text-white truncate">
                        {sources.find(s => s.id === response.sourceId)?.name || 'Fonte Desconhecida'}
                      </div>
                      <div className="text-2xs md:text-xs text-gray-400">
                        {new Date(response.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  {response.feedback && (
                    <div className="text-2xs md:text-xs text-gray-300 bg-gray-600 p-1 md:p-2 rounded line-clamp-2">
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
  <div className="p-2 bg-gray-800 border-t border-gray-700">
    <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-2xs md:text-xs">
      <div className="mb-1 sm:mb-0">Pressione ESC para sair do modo TV</div>
      <div className="flex items-center">
        <span>Última atualização: {lastUpdated}</span>
        {isRefreshing && (
          <span className="ml-2 flex items-center">
            <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Atualizando...
          </span>
        )}
      </div>
    </div>
  </div>
</motion.div>
  );
};

  const getSourceName = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    return source?.name || 'Fonte Desconhecida';
  };

  const getSituationName = (situationId: string) => {
    const situation = situations.find(s => s.id === situationId);
    return situation?.name || 'Situação Desconhecida';
  };

  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || 'Grupo Desconhecido';
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'bg-green-500 text-white';
    if (score <= 6) return 'bg-red-500 text-white';
    return 'bg-yellow-500 text-white';
  };

  const getScoreCategory = (score: number) => {
    if (score >= 9) return { label: 'Promotor', color: 'success' as const };
    if (score <= 6) return { label: 'Detrator', color: 'danger' as const };
    return { label: 'Neutro', color: 'warning' as const };
  };

  const getTrendIcon = () => {
    if (npsScore > 50) return <TrendingUp size={20} className="text-green-500" />;
    if (npsScore < 0) return <TrendingDown size={20} className="text-red-500" />;
    return <Minus size={20} className="text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Campanha não encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          A campanha que você está procurando não existe ou foi removida.
        </p>
        <Link to="/campaigns">
          <Button variant="primary">Voltar às Campanhas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
            <Badge variant={campaign.active ? "success" : "secondary"}>
              {campaign.active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {campaign.description || 'Sem descrição disponível'}
          </p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            <Calendar size={16} className="mr-1" />
            Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link to={`/user/campaigns/${id}/responses`}>
            <Button variant="outline" size="sm" icon={<Eye size={16} />}>
              Ver Respostas
            </Button>
          </Link>
          <Link to={`/user/campaigns/${id}/form`}>
            <Button variant="outline" size="sm" icon={<Edit size={16} />}>
              Editar
            </Button>
          </Link>
          <Link to={`/user/campaigns/${id}/share`}>
            <Button variant="primary" size="sm" icon={<Share2 size={16} />}>
              Compartilhar
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            size="sm"
            icon={<Monitor size={16} />}
            onClick={() => setIsTvMode(true)}
          >
            Modo TV
          </Button>
        </div>
      </div>

      {/* Main Stats */}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">NPS Score Atual</p>
                  <div className="flex items-center">
                    <p className={`text-3xl font-bold ${
                      npsScore >= 50 ? 'text-green-600' : 
                      npsScore >= 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {npsScore}
                    </p>
                    <div className="ml-2">
                      {getTrendIcon()}
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-[#073143]/10 dark:bg-[#073143]/20 rounded-lg flex items-center justify-center">
                  <BarChart3 size={24} className="text-[#00ac75] dark:text-[#4a9eff]" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Respostas</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{total}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <MessageSquare size={24} className="text-purple-600 dark:text-purple-400" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promotores</p>
                  <p className="text-3xl font-bold text-green-600">{promoters}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {total > 0 ? Math.round((promoters / total) * 100) : 0}% do total
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-green-600 dark:text-green-400" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Detratores</p>
                  <p className="text-3xl font-bold text-red-600">{detractors}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {total > 0 ? Math.round((detractors / total) * 100) : 0}% do total
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      {total > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
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
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader title="Tendência NPS" />
              <CardContent>
                <div className="h-64">
                  {trendData.length > 1 ? (
                    <NpsTrend data={trendData} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Dados insuficientes para mostrar tendência</p>
                        <p className="text-sm">Colete mais respostas ao longo do tempo</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="mb-4 w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <MessageSquare size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhuma resposta ainda</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Compartilhe sua pesquisa NPS com clientes para começar a coletar feedback.
                </p>
                <Link to={`/user/campaigns/${id}/share`}>
                  <Button variant="primary" icon={<Share2 size={16} />}>
                    Compartilhar Pesquisa
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      {/* TV Mode Overlay */}
      <AnimatePresence>
        {isTvMode && <TvDashboard />}
      </AnimatePresence>
      {/* Recent Responses */}
      {recentResponses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader 
              title="Últimas Respostas" 
              action={
                <Link to={`/user/campaigns/${id}/responses`}>
                  <Button variant="outline" size="sm" icon={<ChevronRight size={16} />}>
                    Ver Todas
                  </Button>
                </Link>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {recentResponses.map((response, index) => {
                  const category = getScoreCategory(response.score);
                  return (
                    <motion.div
                      key={response.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getScoreColor(response.score)}`}>
                          {response.score}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={category.color} className="text-xs">
                              {category.label}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {getSourceName(response.sourceId)}
                            </span>
                          </div>
                          {response.feedback && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                              "{response.feedback}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(response.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(response.createdAt).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Ações Rápidas" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to={`/dashboard/campaigns/${id}/form`}>
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <Edit size={20} className="text-[#073143] dark:text-blue-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Editar Formulário</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Personalizar perguntas</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to={`/dashboard/campaigns/${id}/share`}>
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <Share2 size={20} className="text-[#073143] dark:text-blue-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Compartilhar</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Obter link da pesquisa</p>
                    </div>
                  </div>
                </div>
              </Link>

              <a 
                href={`/survey/${id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <ExternalLink size={20} className="text-[#073143] dark:text-blue-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Visualizar</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ver como cliente</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CampaignDashboard;