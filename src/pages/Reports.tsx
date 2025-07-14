import React, { useState, useEffect } from 'react';
import { Campaign, NpsResponse } from '../types';
import { getCampaigns, getResponses, getSources, getSituations, getGroups } from '../utils/localStorage';
import { calculateNPS, categorizeResponses, responsesByScore, npsOverTime } from '../utils/npsCalculator';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { NpsDoughnut, NpsDistribution, NpsTrend } from '../components/dashboard/NpsChart';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  MessageSquare,
  Target,
  Award,
  AlertTriangle,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportData {
  campaign: Campaign;
  responses: NpsResponse[];
  npsScore: number;
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  averageScore: number;
  responseRate: number;
  trend: 'up' | 'down' | 'stable';
}

const Reports: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [sources, setSources] = useState<Record<string, string>>({});
  const [situations, setSituations] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Record<string, string>>({});
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('30');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    campaigns: true,
    trends: true,
    distribution: true
  });

  useEffect(() => {
    loadReportData();
  }, [selectedCampaigns, dateRange]);

  const handleCampaignToggle = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleSelectAllCampaigns = () => {
    if (selectedCampaigns.length === campaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(campaigns.map(c => c.id));
    }
  };

  const loadReportData = () => {
    setIsLoading(true);
    
    // Load campaigns
    const allCampaigns = getCampaigns();
    setCampaigns(allCampaigns);

    // Load reference data
    const allSources = getSources();
    const sourcesMap: Record<string, string> = {};
    allSources.forEach(source => {
      sourcesMap[source.id] = source.name;
    });
    setSources(sourcesMap);

    const allSituations = getSituations();
    const situationsMap: Record<string, string> = {};
    allSituations.forEach(situation => {
      situationsMap[situation.id] = situation.name;
    });
    setSituations(situationsMap);

    const allGroups = getGroups();
    const groupsMap: Record<string, string> = {};
    allGroups.forEach(group => {
      groupsMap[group.id] = group.name;
    });
    setGroups(groupsMap);

    // Filter campaigns based on selection
    const filteredCampaigns = selectedCampaigns.length === 0
      ? allCampaigns 
      : allCampaigns.filter(c => selectedCampaigns.includes(c.id));

    // Calculate date filter
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(dateRange));

    // Generate report data for each campaign
    const reports: ReportData[] = filteredCampaigns.map(campaign => {
      const allResponses = getResponses(campaign.id);
      
      // Filter responses by date range
      const filteredResponses = allResponses.filter(response => 
        new Date(response.createdAt) >= dateFilter
      );

      const npsScore = calculateNPS(filteredResponses);
      const { promoters, passives, detractors } = categorizeResponses(filteredResponses);
      const averageScore = filteredResponses.length > 0 
        ? filteredResponses.reduce((sum, r) => sum + r.score, 0) / filteredResponses.length 
        : 0;

      // Calculate trend (simplified)
      const trend: 'up' | 'down' | 'stable' = npsScore > 50 ? 'up' : npsScore < 0 ? 'down' : 'stable';

      return {
        campaign,
        responses: filteredResponses,
        npsScore,
        totalResponses: filteredResponses.length,
        promoters,
        passives,
        detractors,
        averageScore: Math.round(averageScore * 10) / 10,
        responseRate: 85, // Mock response rate
        trend
      };
    });

    setReportData(reports);
    setIsLoading(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  const exportReport = () => {
    const csvContent = [
      ['Campanha', 'NPS Score', 'Total Respostas', 'Promotores', 'Neutros', 'Detratores', 'Média', 'Taxa de Resposta'].join(','),
      ...reportData.map(data => [
        `"${data.campaign.name}"`,
        data.npsScore,
        data.totalResponses,
        data.promoters,
        data.passives,
        data.detractors,
        data.averageScore,
        `${data.responseRate}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-nps-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Calculate overall statistics
  const overallStats = reportData.reduce((acc, data) => ({
    totalResponses: acc.totalResponses + data.totalResponses,
    totalPromoters: acc.totalPromoters + data.promoters,
    totalPassives: acc.totalPassives + data.passives,
    totalDetractors: acc.totalDetractors + data.detractors,
    totalCampaigns: acc.totalCampaigns + 1
  }), { totalResponses: 0, totalPromoters: 0, totalPassives: 0, totalDetractors: 0, totalCampaigns: 0 });

  const overallNPS = overallStats.totalResponses > 0 
    ? Math.round(((overallStats.totalPromoters - overallStats.totalDetractors) / overallStats.totalResponses) * 100)
    : 0;

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="mr-3" size={32} />
            Relatórios NPS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Análise detalhada do desempenho das campanhas NPS
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={loadReportData}
          >
            Atualizar
          </Button>
          <Button
            variant="primary"
            icon={<Download size={16} />}
            onClick={exportReport}
          >
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title="Filtros" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campanhas
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="select-all-campaigns"
                    checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                    onChange={handleSelectAllCampaigns}
                    className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                  />
                  <label htmlFor="select-all-campaigns" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedCampaigns.length === campaigns.length ? 'Desmarcar todas' : 'Selecionar todas'}
                  </label>
                </div>
                <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        id={`campaign-${campaign.id}`}
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={() => handleCampaignToggle(campaign.id)}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                      />
                      <label htmlFor={`campaign-${campaign.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {campaign.name}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedCampaigns.length} de {campaigns.length} campanhas selecionadas
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="365">Último ano</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                icon={<Filter size={16} />}
                onClick={loadReportData}
                fullWidth
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Section */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader 
          title={
            <button
              onClick={() => toggleSection('overview')}
              className="flex items-center justify-between w-full text-left"
            >
              <span>Visão Geral</span>
              {expandedSections.overview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          }
        />
        {expandedSections.overview && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#073143] to-[#0a4a5c] rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">NPS Geral</p>
                    <p className="text-3xl font-bold">{overallNPS}</p>
                    <p className="text-xs opacity-75">
                      {overallStats.totalResponses} respostas
                    </p>
                  </div>
                  <Target size={32} className="opacity-80" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Promotores</p>
                    <p className="text-3xl font-bold">{overallStats.totalPromoters}</p>
                    <p className="text-xs opacity-75">
                      {overallStats.totalResponses > 0 ? Math.round((overallStats.totalPromoters / overallStats.totalResponses) * 100) : 0}% do total
                    </p>
                  </div>
                  <Award size={32} className="opacity-80" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Detratores</p>
                    <p className="text-3xl font-bold">{overallStats.totalDetractors}</p>
                    <p className="text-xs opacity-75">
                      {overallStats.totalResponses > 0 ? Math.round((overallStats.totalDetractors / overallStats.totalResponses) * 100) : 0}% do total
                    </p>
                  </div>
                  <AlertTriangle size={32} className="opacity-80" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Campanhas</p>
                    <p className="text-3xl font-bold">{overallStats.totalCampaigns}</p>
                    <p className="text-xs opacity-75">
                      {campaigns.filter(c => c.active).length} ativas
                    </p>
                  </div>
                  <BarChart3 size={32} className="opacity-80" />
                </div>
              </motion.div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Charts Section */}
      {overallStats.totalResponses > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall NPS */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="NPS Consolidado" />
            <CardContent>
              <div className="flex justify-center py-4">
                <NpsDoughnut npsScore={overallNPS} width={200} height={200} />
              </div>
              <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                Baseado em {overallStats.totalResponses} respostas
              </div>
            </CardContent>
          </Card>

          {/* Distribution */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title="Distribuição Consolidada" />
            <CardContent>
              <div className="h-64">
                <NpsDistribution
                  promoters={overallStats.totalPromoters}
                  passives={overallStats.totalPassives}
                  detractors={overallStats.totalDetractors}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign Details */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader 
          title={
            <button
              onClick={() => toggleSection('campaigns')}
              className="flex items-center justify-between w-full text-left"
            >
              <span>Detalhes por Campanha</span>
              {expandedSections.campaigns ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          }
        />
        {expandedSections.campaigns && (
          <CardContent>
            {reportData.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum dado encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ajuste os filtros para visualizar os dados das campanhas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Campanha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        NPS Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Respostas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Promotores
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Neutros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Detratores
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tendência
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.map((data, index) => (
                      <motion.tr
                        key={data.campaign.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {data.campaign.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(data.campaign.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-2xl font-bold ${
                            data.npsScore >= 50 ? 'text-green-600' : 
                            data.npsScore >= 0 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {data.npsScore}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {data.totalResponses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {data.promoters}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                          {data.passives}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {data.detractors}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${getTrendColor(data.trend)}`}>
                            {getTrendIcon(data.trend)}
                            <span className="ml-1 text-sm capitalize">
                              {data.trend === 'up' ? 'Crescendo' : data.trend === 'down' ? 'Declinando' : 'Estável'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={data.campaign.active ? "success" : "danger"}>
                            {data.campaign.active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Insights and Recommendations */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader title="Insights e Recomendações" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Pontos Positivos</h4>
              <div className="space-y-3">
                {overallNPS >= 50 && (
                  <div className="flex items-start p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Award size={16} className="text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Excelente NPS Geral
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Seu NPS de {overallNPS} está acima da média do mercado.
                      </p>
                    </div>
                  </div>
                )}
                
                {overallStats.totalPromoters > overallStats.totalDetractors && (
                  <div className="flex items-start p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp size={16} className="text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Mais Promotores que Detratores
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        {overallStats.totalPromoters} promotores vs {overallStats.totalDetractors} detratores.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Oportunidades de Melhoria</h4>
              <div className="space-y-3">
                {overallNPS < 0 && (
                  <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle size={16} className="text-red-600 dark:text-red-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        NPS Negativo
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Foque em reduzir detratores e melhorar a experiência do cliente.
                      </p>
                    </div>
                  </div>
                )}
                
                {overallStats.totalDetractors > 0 && (
                  <div className="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Target size={16} className="text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Atenção aos Detratores
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        {overallStats.totalDetractors} clientes insatisfeitos precisam de atenção especial.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <MessageSquare size={16} className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Colete Mais Feedback
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Aumente a frequência de pesquisas para obter insights mais precisos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;