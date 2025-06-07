import React from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { BarChart3, Calendar, Clock, Edit } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const { t } = useLanguage();
  const startDate = new Date(campaign.startDate);
  const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader
        title={
          <div className="flex items-center">
            <span className="text-gray-900 dark:text-white">{campaign.name}</span>
            {campaign.active && <Badge variant="success" className="ml-2">{t('campaign.active')}</Badge>}
            {!campaign.active && <Badge variant="danger" className="ml-2">{t('campaign.inactive')}</Badge>}
          </div>
        }
        description={
          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2 text-sm">
            <Calendar size={14} className="mr-1" />
            <span>
              {formatDate(startDate)}
              {endDate ? ` - ${formatDate(endDate)}` : ' - Present'}
            </span>
          </div>
        }
      />
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{campaign.description || 'No description available'}</p>
        
        <div className="mt-4 py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex items-center">
          <Clock size={18} className="text-gray-400 mr-2" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Created {new Date(campaign.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link to={`/campaigns/${campaign.id}`}>
          <Button variant="primary" icon={<BarChart3 size={16} />}>
            {t('campaign.dashboard')}
          </Button>
        </Link>
        <Link to={`/campaigns/${campaign.id}/edit`}>
          <Button variant="outline" icon={<Edit size={16} />}>
            {t('campaign.edit')}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;