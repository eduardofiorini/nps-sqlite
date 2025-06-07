import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NpsResponse, Campaign } from '../types';
import { getResponses, getCampaigns, getSources, getSituations, getGroups } from '../utils/localStorage';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { ChevronLeft, Download } from 'lucide-react';

const CampaignResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [responses, setResponses] = useState<NpsResponse[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sources, setSources] = useState<Record<string, string>>({});
  const [situations, setSituations] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;

    // Load campaign data
    const campaigns = getCampaigns();
    const foundCampaign = campaigns.find(c => c.id === id);
    setCampaign(foundCampaign || null);

    // Load responses
    const campaignResponses = getResponses(id);
    setResponses(campaignResponses);

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

  const handleExportCSV = () => {
    if (!responses.length) return;

    const headers = ['Date', 'Score', 'Feedback', 'Source', 'Situation', 'Group'];
    const csvContent = [
      headers.join(','),
      ...responses.map(response => [
        new Date(response.createdAt).toLocaleDateString(),
        response.score,
        `"${response.feedback.replace(/"/g, '""')}"`,
        sources[response.sourceId] || 'Unknown',
        situations[response.situationId] || 'Unknown',
        groups[response.groupId] || 'Unknown'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nps-responses-${campaign?.name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!campaign) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <Link to={`/campaigns/${id}`}>
          <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
            Back to Campaign
          </Button>
        </Link>
        {responses.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{campaign.name} - Responses</h1>
        <p className="text-gray-600 mt-1">
          {responses.length} total responses
        </p>
      </div>

      <Card>
        <CardHeader title="All Responses" />
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No responses yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {responses.map((response) => (
                <div key={response.id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                          response.score >= 9
                            ? 'bg-green-100 text-green-800'
                            : response.score <= 6
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <span className="text-lg font-semibold">{response.score}</span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {sources[response.sourceId] || 'Unknown Source'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(response.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge>{situations[response.situationId] || 'Unknown'}</Badge>
                      <Badge variant="secondary">{groups[response.groupId] || 'Unknown'}</Badge>
                    </div>
                  </div>
                  {response.feedback && (
                    <div className="mt-3 text-gray-700 bg-gray-50 p-4 rounded-md">
                      "{response.feedback}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CampaignResponses