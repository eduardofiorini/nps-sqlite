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
  Settings,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const CampaignDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [responses, setResponses] = useState<NpsResponse[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          <Link to={`/campaigns/${id}/responses`}>
            <Button variant="outline" size="sm" icon={<Eye size={16} />}>
              Ver Respostas
            </Button>
          </Link>
          <Link to={`/campaigns/${id}/form`}>
            <Button variant="outline" size="sm" icon={<Edit size={16} />}>
              Editar
            </Button>
          </Link>
          <Link to={`/campaigns/${id}/share`}>
            <Button variant="primary" size="sm" icon={<Share2 size={16} />}>
              Compartilhar
            </Button>
          </Link>
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
                  <BarChart3 size={24} className="text-[#073143] dark:text-[#4a9eff]" />
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
                <Link to={`/campaigns/${id}/share`}>
                  <Button variant="primary" icon={<Share2 size={16} />}>
                    Compartilhar Pesquisa
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
                <Link to={`/campaigns/${id}/responses`}>
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
              <Link to={`/campaigns/${id}/form`}>
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

              <Link to={`/campaigns/${id}/share`}>
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