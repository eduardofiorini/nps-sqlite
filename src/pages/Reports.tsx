import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  RefreshCw,
  Filter,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCampaigns, getResponses } from '../utils/localStorage';
import { calculateNPS } from '../utils/npsCalculator';
import type { Campaign, NPSResponse } from '../types';

const Reports: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaigns.length > 0) {
      loadReportData();
    }
  }, [selectedCampaigns, dateRange]);

  const loadCampaigns = () => {
    const campaignData = getCampaigns();
    setCampaigns(campaignData);
    // Auto-select all campaigns initially
    setSelectedCampaigns(campaignData.map(c => c.id));
  };

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
    setReportData(null);
  };

  const loadReportData = () => {
    setIsLoading(true);
    
    try {
      const allResponses = getResponses();
      const filteredResponses = allResponses.filter(response => 
        selectedCampaigns.includes(response.campaignId)
      );

      // Calculate date range
      const now = new Date();
      const daysAgo = new Date(now.getTime() - (parseInt(dateRange) * 24 * 60 * 60 * 1000));
      
      const dateFilteredResponses = filteredResponses.filter(response => 
        new Date(response.submittedAt) >= daysAgo
      );

      // Calculate metrics
      const npsScore = calculateNPS(dateFilteredResponses);
      const totalResponses = dateFilteredResponses.length;
      const promoters = dateFilteredResponses.filter(r => r.score >= 9).length;
      const passives = dateFilteredResponses.filter(r => r.score >= 7 && r.score <= 8).length;
      const detractors = dateFilteredResponses.filter(r => r.score <= 6).length;

      setReportData({
        npsScore,
        totalResponses,
        promoters,
        passives,
        detractors,
        responses: dateFilteredResponses
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;

    const csvContent = [
      ['Métrica', 'Valor'],
      ['NPS Score', reportData.npsScore],
      ['Total de Respostas', reportData.totalResponses],
      ['Promotores', reportData.promoters],
      ['Neutros', reportData.passives],
      ['Detratores', reportData.detractors],
      ['Período', `Últimos ${dateRange} dias`],
      ['Campanhas', selectedCampaigns.length]
    ].map(row => row.join(',')).join('\n');

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios NPS</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Análise detalhada do desempenho das campanhas NPS
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={loadReportData}
            isLoading={isLoading}
            icon={<RefreshCw size={16} />}
          >
            Atualizar
          </Button>
          <Button
            variant="primary"
            onClick={exportReport}
            disabled={!reportData}
            icon={<Download size={16} />}
          >
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns Filter */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 size={20} className="text-[#073143] dark:text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campanhas</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {selectedCampaigns.length} de {campaigns.length} selecionadas
                </Badge>
              </div>
            </CardHeader>
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
                    {selectedCampaigns.length === campaigns.length ? 'Desmarcar todas' : 'Selecionar todas'}
                  </span>
                </label>
                {selectedCampaigns.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    icon={<X size={14} />}
                  >
                    Limpar
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
                          Criada em {new Date(campaign.startDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </label>
                    <Badge 
                      variant={campaign.active ? "success" : "secondary"} 
                      className="text-xs ml-2"
                    >
                      {campaign.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              {campaigns.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhuma campanha encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Period and Actions */}
        <div className="space-y-6">
          {/* Period Filter */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center">
                <Calendar size={20} className="text-[#073143] dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Período</h3>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Filter Summary */}
          {selectedCampaigns.length > 0 && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center">
                  <Filter size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Filtros Aplicados</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Campanhas:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {selectedCampaigns.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Período:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {dateRange === '7' && 'Últimos 7 dias'}
                      {dateRange === '30' && 'Últimos 30 dias'}
                      {dateRange === '90' && 'Últimos 90 dias'}
                      {dateRange === '365' && 'Último ano'}
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
            disabled={selectedCampaigns.length === 0}
            icon={<Filter size={16} />}
            className="w-full"
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* NPS Score */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#073143] dark:text-blue-400 mb-2">
                  {reportData.npsScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">NPS Score</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Responses */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {reportData.totalResponses}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de Respostas</div>
              </div>
            </CardContent>
          </Card>

          {/* Promoters */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {reportData.promoters}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Promotores</div>
              </div>
            </CardContent>
          </Card>

          {/* Detractors */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {reportData.detractors}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Detratores</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Data State */}
      {selectedCampaigns.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-12">
            <div className="text-center">
              <BarChart3 size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selecione campanhas para gerar relatório
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Escolha uma ou mais campanhas nos filtros acima para visualizar os dados de NPS.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;