import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Campaign, NpsResponse } from '../types';
import { getCampaigns, getResponses, getSources, getSituations, getGroups } from '../utils/supabaseStorage';
import { calculateNPS, categorizeResponses } from '../utils/npsCalculator';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { NpsDoughnut, NpsDistribution } from '../components/dashboard/NpsChart';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar,
  Plus,
  Eye,
  ArrowRight,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CampaignStats {
  campaign: Campaign;
  responses: NpsResponse[];
  npsScore: number;
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  trend: 'up' | 'down' | 'stable';
}

const Overview: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<CampaignStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalResponses: 0,
    averageNPS: 0,
    totalPromoters: 0,
    totalPassives: 0,
    totalDetractors: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load campaigns
      const allCampaigns = await getCampaigns();
      setCampaigns(allCampaigns);

      // Calculate stats for each campaign
      const stats: CampaignStats[] = await Promise.all(
        allCampaigns.map(async campaign => {
          try {
            const responses = await getResponses(campaign.id);
            const npsScore = calculateNPS(responses);
            const { promoters, passives, detractors } = categorizeResponses(responses);
            
            // Simple trend calculation (could be enhanced with historical data)
            const trend: 'up' | 'down' | 'stable' = npsScore > 50 ? 'up' : npsScore < 0 ? 'down' : 'stable';

            return {
              campaign,
              responses,
              npsScore,
              totalResponses: responses.length,
              promoters,
              passives,
              detractors,
              trend
            };
          } catch (error) {
            // If fetching responses fails for a campaign, return default values
            return {
              campaign,
              responses: [],
              npsScore: 0,
              totalResponses: 0,
              promoters: 0,
              passives: 0,
              detractors: 0,
              trend: 'stable' as const
            };
          }
        })
      );

      setCampaignStats(stats);

      // Calculate total stats
      const totalResponses = stats.reduce((sum, stat) => sum + stat.totalResponses, 0);
      const totalPromoters = stats.reduce((sum, stat) => sum + stat.promoters, 0);
      const totalPassives = stats.reduce((sum, stat) => sum + stat.passives, 0);
      const totalDetractors = stats.reduce((sum, stat) => sum + stat.detractors, 0);
      const averageNPS = totalResponses > 0 ? Math.round(((totalPromoters - totalDetractors) / totalResponses) * 100) : 0;

      setTotalStats({
        totalCampaigns: allCampaigns.length,
        activeCampaigns: allCampaigns.filter(c => c.active).length,
        totalResponses,
        averageNPS,
        totalPromoters,
        totalPassives,
        totalDetractors
      });
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values for campaigns and stats
      setCampaigns([]);
      setCampaignStats([]);
      setTotalStats({
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalResponses: 0,
        averageNPS: 0,
        totalPromoters: 0,
        totalPassives: 0,
        totalDetractors: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Minus size={16} className="text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Geral</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral de todas as campanhas NPS
          </p>
        </div>
        <Link to="/campaigns/new">
          <Button variant="primary" icon={<Plus size={16} />}>
            Nova Campanha
          </Button>
        </Link>
      </div>


      {/* Overview Stats */}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Campanhas</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.totalCampaigns}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalStats.activeCampaigns} ativas
                  </p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">NPS Médio</p>
                  <p className={`text-3xl font-bold ${
                    totalStats.averageNPS >= 50 ? 'text-green-600' : 
                    totalStats.averageNPS >= 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {totalStats.averageNPS}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalStats.totalResponses} respostas
                  </p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Respostas</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.totalResponses}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Todas as campanhas
                  </p>
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
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promotores</p>
                  <p className="text-3xl font-bold text-green-600">{totalStats.totalPromoters}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalStats.totalResponses > 0 ? Math.round((totalStats.totalPromoters / totalStats.totalResponses) * 100) : 0}% do total
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Overall Distribution */}
      {totalStats.totalResponses > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader title="NPS Geral" />
              <CardContent>
                <div className="flex justify-center py-4">
                  <NpsDoughnut npsScore={totalStats.averageNPS} width={200} height={200} />
                </div>
                <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Baseado em {totalStats.totalResponses} respostas de {totalStats.totalCampaigns} campanhas
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
              <CardHeader title="Distribuição Geral" />
              <CardContent>
                <div className="h-64">
                  <NpsDistribution
                    promoters={totalStats.totalPromoters}
                    passives={totalStats.totalPassives}
                    detractors={totalStats.totalDetractors}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <div className="text-xl font-bold text-red-500">{totalStats.totalDetractors}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Detratores</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                    <div className="text-xl font-bold text-yellow-500">{totalStats.totalPassives}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Neutros</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <div className="text-xl font-bold text-green-500">{totalStats.totalPromoters}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Promotores</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Campaigns List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader 
            title="Campanhas Ativas" 
            action={
              <Link to="/">
                <Button variant="outline\" size="sm\" icon={<ArrowRight size={16} />}>
                  Ver Todas
                </Button>
              </Link>
            }
          />
          <CardContent>
            {campaignStats.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4 w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <BarChart3 size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhuma campanha encontrada</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Crie sua primeira campanha NPS para começar a coletar feedback.
                </p>
                <Link to="/campaigns/new">
                  <Button variant="outline" size="sm" icon={<ArrowRight size={16} />} className="text-gray-700 dark:text-gray-300">
                    Criar Primeira Campanha
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {campaignStats.slice(0, 5).map((stat, index) => (
                  <motion.div
                    key={stat.campaign.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          stat.npsScore >= 50 ? 'bg-green-500' : 
                          stat.npsScore >= 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {stat.npsScore}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{stat.campaign.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <MessageSquare size={14} className="mr-1" />
                            {stat.totalResponses} respostas
                          </span>
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(stat.campaign.startDate).toLocaleDateString()}
                          </span>
                          <div className={`flex items-center ${getTrendColor(stat.trend)} dark:text-gray-300`}>
                            {getTrendIcon(stat.trend)}
                            <span className="ml-1 capitalize">{stat.trend === 'up' ? 'Crescendo' : stat.trend === 'down' ? 'Declinando' : 'Estável'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={stat.campaign.active ? "success" : "danger"}>
                        {stat.campaign.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <Link to={`/campaigns/${stat.campaign.id}`}>
                        <Button variant="outline" size="sm" icon={<Eye size={14} />}>
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
                
                {campaignStats.length > 5 && (
                  <div className="text-center pt-4">
                    <Link to="/">
                      <Button variant="outline">
                        Ver todas as {campaignStats.length} campanhas
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Overview;