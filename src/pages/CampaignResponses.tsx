import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NpsResponse, Campaign } from '../types';
import { getResponses, getCampaigns, getSources, getSituations, getGroups } from '../utils/localStorage';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { ChevronLeft, Download, MessageSquare, Calendar, User, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';

const CampaignResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [responses, setResponses] = useState<NpsResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<NpsResponse[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sources, setSources] = useState<Record<string, string>>({});
  const [situations, setSituations] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    if (!id) return;

    // Load campaign data
    const campaigns = getCampaigns();
    const foundCampaign = campaigns.find(c => c.id === id);
    setCampaign(foundCampaign || null);

    // Load responses
    const campaignResponses = getResponses(id);
    setResponses(campaignResponses);
    setFilteredResponses(campaignResponses);

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
  }, [id]);

  // Filter responses based on search and filters
  useEffect(() => {
    let filtered = [...responses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(response =>
        response.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sources[response.sourceId]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        situations[response.situationId]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Score filter
    if (scoreFilter !== 'all') {
      if (scoreFilter === 'promoters') {
        filtered = filtered.filter(response => response.score >= 9);
      } else if (scoreFilter === 'passives') {
        filtered = filtered.filter(response => response.score >= 7 && response.score <= 8);
      } else if (scoreFilter === 'detractors') {
        filtered = filtered.filter(response => response.score <= 6);
      }
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(response => response.sourceId === sourceFilter);
    }

    setFilteredResponses(filtered);
  }, [responses, searchTerm, scoreFilter, sourceFilter, sources, situations]);

  const handleExportCSV = () => {
    if (!filteredResponses.length) return;

    const headers = ['Data', 'Hora', 'Pontuação', 'Categoria', 'Feedback', 'Fonte', 'Situação', 'Grupo'];
    const csvContent = [
      headers.join(','),
      ...filteredResponses.map(response => {
        const date = new Date(response.createdAt);
        const category = response.score >= 9 ? 'Promotor' : response.score <= 6 ? 'Detrator' : 'Neutro';
        return [
          date.toLocaleDateString('pt-BR'),
          date.toLocaleTimeString('pt-BR'),
          response.score,
          category,
          `"${response.feedback.replace(/"/g, '""')}"`,
          sources[response.sourceId] || 'Desconhecido',
          situations[response.situationId] || 'Desconhecido',
          groups[response.groupId] || 'Desconhecido'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `respostas-nps-${campaign?.name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  if (!campaign) {
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
        <div className="flex items-center space-x-4">
          <Link to={`/campaigns/${id}`}>
            <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
              Voltar ao Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {campaign.name} - Respostas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredResponses.length} de {responses.length} respostas
              {searchTerm || scoreFilter !== 'all' || sourceFilter !== 'all' ? ' (filtradas)' : ''}
            </p>
          </div>
        </div>
        
        {responses.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={handleExportCSV}
          >
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      {responses.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Filtros" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Input
                  placeholder="Buscar por feedback ou fonte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Score Filter */}
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas as categorias</option>
                <option value="promoters">Promotores (9-10)</option>
                <option value="passives">Neutros (7-8)</option>
                <option value="detractors">Detratores (0-6)</option>
              </select>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas as fontes</option>
                {Object.entries(sources).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setScoreFilter('all');
                  setSourceFilter('all');
                }}
                disabled={!searchTerm && scoreFilter === 'all' && sourceFilter === 'all'}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responses List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader 
          title={`Respostas (${filteredResponses.length})`}
          action={
            responses.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Filter size={16} />
                <span>Filtros ativos: {[
                  searchTerm && 'Busca',
                  scoreFilter !== 'all' && 'Categoria',
                  sourceFilter !== 'all' && 'Fonte'
                ].filter(Boolean).join(', ') || 'Nenhum'}</span>
              </div>
            )
          }
        />
        <CardContent>
          {filteredResponses.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <MessageSquare size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {responses.length === 0 ? 'Nenhuma resposta ainda' : 'Nenhuma resposta encontrada'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {responses.length === 0 
                  ? 'As respostas aparecerão aqui quando os clientes responderem à pesquisa.'
                  : 'Tente ajustar os filtros para encontrar as respostas que procura.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResponses.map((response, index) => {
                const category = getScoreCategory(response.score);
                return (
                  <motion.div
                    key={response.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      {/* Score and Category */}
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getScoreColor(response.score)}`}>
                          {response.score}
                        </div>
                        <div>
                          <Badge variant={category.color} className="mb-2">
                            {category.label}
                          </Badge>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Pontuação: {response.score}/10
                          </div>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <Calendar size={14} className="mr-1" />
                          {new Date(response.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(response.createdAt).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    {response.feedback && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Comentário:
                        </h4>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-900 dark:text-white italic">
                            "{response.feedback}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Fonte
                        </span>
                        <div className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                          {sources[response.sourceId] || 'Fonte Desconhecida'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Situação
                        </span>
                        <div className="mt-1">
                          <Badge variant="secondary">
                            {situations[response.situationId] || 'Desconhecido'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Grupo
                        </span>
                        <div className="mt-1 text-sm text-gray-900 dark:text-white">
                          {groups[response.groupId] || 'Grupo Desconhecido'}
                        </div>
                      </div>
                    </div>

                    {/* Response ID (for debugging/reference) */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-400">
                        ID: {response.id.slice(0, 8)}...
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {responses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {responses.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total de Respostas
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {responses.filter(r => r.score >= 9).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Promotores
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {responses.filter(r => r.score >= 7 && r.score <= 8).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Neutros
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {responses.filter(r => r.score <= 6).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Detratores
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CampaignResponses;