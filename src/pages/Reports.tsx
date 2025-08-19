import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  BarChart3, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  X,
  CheckSquare,
  Square,
  PieChart,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCampaigns, getResponses, getSources, getSituations } from '../utils/supabaseStorage';
import { calculateNPS, categorizeResponses, responsesByScore, npsOverTime } from '../utils/npsCalculator';
import { useLanguage } from '../contexts/LanguageContext';
import type { Campaign, NpsResponse } from '../types';

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('30');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [situations, setSituations] = useState<any[]>([]);
  const [allResponses, setAllResponses] = useState<NpsResponse[]>([]);
  const [responsesBySource, setResponsesBySource] = useState<any>({});
  const [responsesByDay, setResponsesByDay] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const campaignData = await getCampaigns();
        setCampaigns(campaignData);
        
        // Auto-select all campaigns initially
        setSelectedCampaigns(campaignData.map(c => c.id));
        
        // Load all responses for all campaigns
        const allResponsesData: NpsResponse[] = [];
        for (const campaign of campaignData) {
          const campaignResponses = await getResponses(campaign.id);
          allResponsesData.push(...campaignResponses);
        }
        setAllResponses(allResponsesData);
        
        // Load sources and situations for reporting
        const sourcesData = await getSources();
        const situationsData = await getSituations();
        setSources(sourcesData);
        setSituations(situationsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCampaigns.length > 0) {
      loadReportData();
    }
  }, [selectedCampaigns, dateRange, customStartDate, customEndDate, isCustomRange]);

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

  const clearFilters = () => {
    setSelectedCampaigns([]);
    setDateRange('30');
    setIsCustomRange(false);
    setCustomStartDate('');
    setCustomEndDate('');
    setReportData(null);
  };

  const loadReportData = async () => {
    setIsLoading(true);
    
    try {
      // Get responses for each selected campaign
      let filteredResponses: NpsResponse[] = [];
      
      // Filter responses by selected campaigns
      filteredResponses = allResponses.filter(response => 
        selectedCampaigns.includes(response.campaignId)
      );

      // Calculate date range
      let startDate: Date;
      let endDate: Date = new Date();
      
      if (isCustomRange && customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
      } else {
        const now = new Date();
        startDate = new Date(now.getTime() - (parseInt(dateRange) * 24 * 60 * 60 * 1000));
      }
      
      const dateFilteredResponses = filteredResponses.filter(response => {
        const responseDate = new Date(response.createdAt);
        return responseDate >= startDate && responseDate <= endDate;
      });

      // Calculate metrics
      const npsScore = calculateNPS(dateFilteredResponses);
      const totalResponses = dateFilteredResponses.length;
      const { promoters, passives, detractors } = categorizeResponses(dateFilteredResponses);
      
      // Calculate responses by source
      const bySource: Record<string, NpsResponse[]> = {};
      sources.forEach(source => {
        bySource[source.id] = dateFilteredResponses.filter(r => r.sourceId === source.id);
      });
      setResponsesBySource(bySource);
      
      // Calculate score distribution
      const byScore = responsesByScore(dateFilteredResponses);
      setScoreDistribution(byScore);
      
      // Calculate responses by day for the last 30 days
      const byDay: {date: string, count: number}[] = [];
      let daysToShow: number;
      
      if (isCustomRange && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        daysToShow = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        for (let i = 0; i < daysToShow; i++) {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          const count = dateFilteredResponses.filter(r => {
            const responseDate = new Date(r.createdAt).toISOString().split('T')[0];
            return responseDate === dateStr;
          }).length;
          
          byDay.push({ date: dateStr, count });
        }
      } else {
        daysToShow = parseInt(dateRange);
        for (let i = 0; i < daysToShow; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const count = dateFilteredResponses.filter(r => {
            const responseDate = new Date(r.createdAt).toISOString().split('T')[0];
            return responseDate === dateStr;
          }).length;
          
          byDay.unshift({ date: dateStr, count });
        }
      }
      setResponsesByDay(byDay);
      
      // Calculate NPS trend
      const npsTrend = npsOverTime(dateFilteredResponses);

      setReportData({
        npsScore,
        totalResponses,
        promoters,
        passives,
        detractors,
        responses: dateFilteredResponses,
        npsTrend
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData || !reportData.responses) return;

    // Create a more detailed CSV with individual responses
    const headers = [
      'Data',
      'Campanha',
      'Pontuação NPS',
      'Categoria',
      'Fonte',
      'Feedback'
    ];
    
    const rows = reportData.responses.map((response: NpsResponse) => {
      const campaign = campaigns.find(c => c.id === response.campaignId);
      const source = sources.find(s => s.id === response.sourceId);
      const category = response.score >= 9 ? 'Promotor' : response.score <= 6 ? 'Detrator' : 'Neutro';
      
      return [
        new Date(response.createdAt).toLocaleDateString('pt-BR'),
        campaign ? campaign.name : 'Desconhecida',
        response.score,
        category,
        source ? source.name : 'Desconhecida',
        `"${response.feedback?.replace(/"/g, '""') || ''}"`
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-nps-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={loadReportData}
            isLoading={isLoading}
            icon={<RefreshCw size={16} />}
          >
            {t('reports.update')}
          </Button>
          <Button
            variant="primary"
            onClick={exportReport}
            disabled={!reportData}
            icon={<Download size={16} />}
          >
            {t('reports.exportReport')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns Filter */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title={t('reports.campaigns')} />
            <CardContent>
              {/* Select All */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                      onChange={handleSelectAllCampaigns}
                      className="w-4 h-4 text-[#073143] border-gray-300 dark:border-gray-500 rounded focus:ring-[#073143] focus:ring-2"
                    />
                    {selectedCampaigns.length > 0 && selectedCampaigns.length < campaigns.length && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-2 h-2 bg-[#073143] rounded-sm"></div>
                      </div>
                    )}
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                    {selectedCampaigns.length === campaigns.length ? t('common.cancel') : 'Selecionar todas'}
                  </span>
                </label>
                {selectedCampaigns.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    icon={<X size={14} />}
                  >
                    {t('reports.clearFilters')}
                  </Button>
                )}
              </div>

              {/* Campaign List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {campaigns.map(campaign => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <label className="flex items-center cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={() => handleCampaignToggle(campaign.id)}
                        className="w-4 h-4 text-[#073143] border-gray-300 dark:border-gray-500 rounded focus:ring-[#073143] focus:ring-2"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {campaign.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('common.created')} {new Date(campaign.startDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </label>
                    <Badge 
                      variant={campaign.active ? "success" : "secondary"} 
                      className="text-xs ml-2"
                    >
                      {campaign.active ? t('overview.active') : t('overview.inactive')}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              {campaigns.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t('overview.noCampaigns')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Period and Actions */}
        <div className="space-y-6">
          {/* Period Filter */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title={t('reports.period')} />
            <CardContent>
              <div className="space-y-4">
                <select
                  value={isCustomRange ? 'custom' : dateRange}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomRange(true);
                      // Set default dates if not set
                      if (!customStartDate) {
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        setCustomStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
                      }
                      if (!customEndDate) {
                        setCustomEndDate(new Date().toISOString().split('T')[0]);
                      }
                    } else {
                      setIsCustomRange(false);
                      setDateRange(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="7">{t('reports.last7Days')}</option>
                  <option value="30">{t('reports.last30Days')}</option>
                  <option value="90">{t('reports.last90Days')}</option>
                  <option value="365">{t('reports.lastYear')}</option>
                  <option value="custom">Período Personalizado</option>
                </select>
                
                {isCustomRange && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    {customStartDate && customEndDate && new Date(customStartDate) > new Date(customEndDate) && (
                      <div className="text-xs text-red-600 dark:text-red-400">
                        A data inicial deve ser anterior à data final
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filter Summary */}
          {selectedCampaigns.length > 0 && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader title={t('reports.filtersApplied')} />
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">{t('reports.campaigns')}:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {selectedCampaigns.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">{t('reports.period')}:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {isCustomRange 
                        ? `${customStartDate ? new Date(customStartDate).toLocaleDateString('pt-BR') : ''} - ${customEndDate ? new Date(customEndDate).toLocaleDateString('pt-BR') : ''}`
                        : dateRange === '7' ? t('reports.last7Days')
                        : dateRange === '30' ? t('reports.last30Days')
                        : dateRange === '90' ? t('reports.last90Days')
                        : dateRange === '365' ? t('reports.lastYear')
                        : ''
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Apply Filters Button */}
          <Button
            variant="primary"
            onClick={loadReportData}
            isLoading={isLoading}
            disabled={selectedCampaigns.length === 0 || (isCustomRange && (!customStartDate || !customEndDate || new Date(customStartDate) > new Date(customEndDate)))}
            icon={<Filter size={16} />}
            className="w-full"
          >
            {t('reports.applyFilters')}
          </Button>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* NPS Score */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('reports.nps')} Score</p>
                    <p className={`text-3xl font-bold ${
                      reportData.npsScore >= 50 ? 'text-green-600' : 
                      reportData.npsScore >= 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {reportData.npsScore}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#073143]/10 dark:bg-[#073143]/20 rounded-lg flex items-center justify-center">
                    <BarChart3 size={24} className="text-[#073143] dark:text-[#4a9eff]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Responses */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('reports.totalResponses')}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {reportData.totalResponses}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <MessageSquare size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promoters */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('reports.promoters')}</p>
                    <p className="text-3xl font-bold text-green-600">
                      {reportData.promoters}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {reportData.totalResponses > 0 ? Math.round((reportData.promoters / reportData.totalResponses) * 100) : 0}% {t('overview.ofTotal')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detractors */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('reports.detractors')}</p>
                    <p className="text-3xl font-bold text-red-600">
                      {reportData.detractors}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {reportData.totalResponses > 0 ? Math.round((reportData.detractors / reportData.totalResponses) * 100) : 0}% {t('overview.ofTotal')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NPS Trend Chart */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader title={t('reports.npsTrend')} />
              <CardContent>
                <div className="h-64">
                  {reportData.npsTrend && reportData.npsTrend.length > 1 ? (
                    <Line
                      data={{
                        labels: reportData.npsTrend.map((item: any) => item.date),
                        datasets: [
                          {
                            label: 'NPS Score',
                            data: reportData.npsTrend.map((item: any) => item.nps),
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: t('reports.npsOverTime'),
                          },
                        },
                        scales: {
                          y: {
                            min: -100,
                            max: 100,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                        <p>{t('reports.insufficientData')}</p>
                        <p className="text-sm">{t('reports.collectMoreData')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Distribution Chart */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader title={t('reports.responseDistribution')} />
              <CardContent>
                <div className="h-64">
                  <Doughnut
                    data={{
                      labels: [t('reports.detractors'), t('reports.neutrals'), t('reports.promoters')],
                      datasets: [
                        {
                          data: [reportData.detractors, reportData.passives, reportData.promoters],
                          backgroundColor: ['#F87171', '#FBBF24', '#4ADE80'],
                          borderColor: ['transparent', 'transparent', 'transparent'],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Score Distribution Chart */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader title={t('reports.scoreDistribution')} />
              <CardContent>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: Object.keys(scoreDistribution).map(score => `${score}`),
                      datasets: [
                        {
                          label: 'Respostas',
                          data: Object.values(scoreDistribution),
                          backgroundColor: Object.keys(scoreDistribution).map(score => {
                            const scoreNum = parseInt(score);
                            if (scoreNum >= 9) return '#4ADE80'; // Green for promoters
                            if (scoreNum <= 6) return '#F87171'; // Red for detractors
                            return '#FBBF24'; // Yellow for passives
                          }),
                          borderColor: 'transparent',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: true,
                          text: t('reports.responsesByScore'),
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Responses by Day Chart */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader title={t('reports.responsesByDay')} />
              <CardContent>
                <div className="h-64">
                  <Line
                    data={{
                      labels: responsesByDay.map(day => day.date),
                      datasets: [
                        {
                          label: 'Respostas',
                          data: responsesByDay.map(day => day.count),
                          borderColor: '#8B5CF6',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          fill: true,
                          tension: 0.2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: t('reports.dailyResponseVolume'),
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Responses by Source */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title={t('reports.responsesBySource')} />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map(source => {
                  const sourceResponses = responsesBySource[source.id] || [];
                  const sourceNPS = calculateNPS(sourceResponses);
                  const { promoters, passives, detractors } = categorizeResponses(sourceResponses);
                  
                  return (
                    <div 
                      key={source.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center mb-3">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: source.color }}
                        ></div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{source.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {sourceResponses.length}
                          </div>
                          <div className="text-xs text-gray-500">{t('reports.responses')}</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-bold ${
                            sourceNPS >= 50 ? 'text-green-600' : 
                            sourceNPS >= 0 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {sourceNPS}
                          </div>
                          <div className="text-xs text-gray-500">NPS</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">
                            {promoters}
                          </div>
                          <div className="text-xs text-gray-500">{t('reports.promoters')}</div>
                        </div>
                      </div>
                      
                      {sourceResponses.length > 0 && (
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="flex h-full">
                            <div 
                              className="bg-red-500 h-full" 
                              style={{ width: `${(detractors / sourceResponses.length) * 100}%` }}
                            ></div>
                            <div 
                              className="bg-yellow-500 h-full" 
                              style={{ width: `${(passives / sourceResponses.length) * 100}%` }}
                            ></div>
                            <div 
                              className="bg-green-500 h-full" 
                              style={{ width: `${(promoters / sourceResponses.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Campaign Comparison */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader title={t('reports.campaignComparison')} />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.campaign')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.responses')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.nps')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.promoters')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.neutrals')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.detractors')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedCampaigns.map((campaignId) => {
                      const campaign = campaigns.find(c => c.id === campaignId);
                      if (!campaign) return null;
                      
                      // Get responses for this campaign
                      const campaignResponses = reportData.responses.filter(
                        (r: NpsResponse) => r.campaignId === campaignId
                      );
                      
                      const campaignNPS = calculateNPS(campaignResponses);
                      const { promoters, passives, detractors } = categorizeResponses(campaignResponses);
                      
                      return (
                        <tr key={campaignId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {campaign.name}
                          </td> 
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {campaignResponses.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              campaignNPS >= 50 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                              campaignNPS >= 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {campaignNPS}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                            {promoters} ({campaignResponses.length > 0 ? Math.round((promoters / campaignResponses.length) * 100) : 0}%)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">
                            {passives} ({campaignResponses.length > 0 ? Math.round((passives / campaignResponses.length) * 100) : 0}%)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                            {detractors} ({campaignResponses.length > 0 ? Math.round((detractors / campaignResponses.length) * 100) : 0}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Data State */}
      {selectedCampaigns.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-12">
            <div className="text-center py-8">
              <BarChart3 size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('reports.selectCampaigns')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('reports.selectCampaignsDesc')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;