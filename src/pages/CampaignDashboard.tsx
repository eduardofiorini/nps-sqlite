import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Campaign, NpsResponse } from '../types';
import { getCampaigns, getResponses, getSources, getSituations } from '../utils/localStorage';
import { calculateNPS, categorizeResponses, responsesBySource, npsOverTime } from '../utils/npsCalculator';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { NpsDoughnut, NpsDistribution, NpsTrend } from '../components/dashboard/NpsChart';
import { ChevronLeft, PieChart, Edit, MessageSquare, X } from 'lucide-react';
import Badge from '../components/ui/Badge';

const CampaignDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [responses, setResponses] = useState<NpsResponse[]>([]);
  const [sources, setSources] = useState<Record<string, string>>({});
  const [situations, setSituations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  if (isLoading || !campaign) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const npsScore = calculateNPS(responses);
  const { promoters, passives, detractors } = categorizeResponses(responses);
  const trendData = npsOverTime(responses, 6);
  
  // Format dates
  const startDate = new Date(campaign.startDate).toLocaleDateString();
  const endDate = campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Present';
  
  return (
    <div>
      <div className="mb-6">
        <Link to="/">
          <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex items-center mt-2">
              <span className="text-gray-500 text-sm">
                {startDate} to {endDate}
              </span>
              {campaign.active ? (
                <Badge variant="success" className="ml-2">
                  Active
                </Badge>
              ) : (
                <Badge variant="danger" className="ml-2">
                  Inactive
                </Badge>
              )}
            </div>
            {campaign.description && (
              <p className="text-gray-600 mt-2 max-w-2xl">{campaign.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Link to={`/campaigns/${id}/form`}>
              <Button variant="outline" icon={<Edit size={16} />}>
                Edit Form
              </Button>
            </Link>
            <Link to={`/campaigns/${id}/responses`}>
              <Button variant="outline" icon={<MessageSquare size={16} />}>
                View Responses
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {responses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4 w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <PieChart size={24} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No responses yet</h3>
          <p className="text-gray-600 mb-6">
            Share your NPS survey with customers to start collecting feedback.
          </p>
          <Link to={`/campaigns/${id}/share`}>
            <Button variant="primary">
              Share Survey
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader title="Current NPS Score" />
              <CardContent>
                <div className="flex justify-center py-4">
                  <NpsDoughnut npsScore={npsScore} width={200} height={200} />
                </div>
                <div className="text-center mt-2 text-sm text-gray-500">
                  Based on {responses.length} responses
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-8">
            <Card className="h-full">
              <CardHeader title="NPS Trend" />
              <CardContent>
                <div className="h-64">
                  <NpsTrend data={trendData} />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-6">
            <Card>
              <CardHeader title="Response Distribution" />
              <CardContent>
                <div className="h-64">
                  <NpsDistribution
                    promoters={promoters}
                    passives={passives}
                    detractors={detractors}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-red-50 p-3 rounded-md">
                    <div className="text-xl font-bold text-red-500">{detractors}</div>
                    <div className="text-sm text-gray-600">Detractors</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <div className="text-xl font-bold text-yellow-500">{passives}</div>
                    <div className="text-sm text-gray-600">Passives</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <div className="text-xl font-bold text-green-500">{promoters}</div>
                    <div className="text-sm text-gray-600">Promoters</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-6">
            <Card>
              <CardHeader title="Latest Responses" />
              <CardContent>
                <div className="divide-y">
                  {responses.slice(0, 5).map((response) => (
                    <div key={response.id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              response.score >= 9 
                                ? 'bg-green-100 text-green-800' 
                                : response.score <= 6 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {response.score}
                          </div>
                          <div>
                            <div className="font-medium">
                              {sources[response.sourceId] || 'Unknown Source'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(response.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge>
                          {situations[response.situationId] || 'Unknown'}
                        </Badge>
                      </div>
                      {response.feedback && (
                        <div className="mt-2 text-sm text-gray-600 pl-13 ml-10">
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
                        View All ({responses.length})
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
  );
};

export default CampaignDashboard;