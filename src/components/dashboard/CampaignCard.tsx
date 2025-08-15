import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { BarChart3, Calendar, Clock, Edit, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { deleteCampaign, getResponses } from '../../utils/supabaseStorage';

interface CampaignCardProps {
  campaign: Campaign;
  onDelete?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDelete }) => {
  const { t, language } = useLanguage();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const startDate = new Date(campaign.startDate);
  const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Delete the campaign and all its data
      const success = await deleteCampaign(campaign.id);
      
      if (success) {
        setShowDeleteModal(false);
        onDelete?.();
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const [responseCount, setResponseCount] = useState(0);
  
  useEffect(() => {
    const loadResponseCount = async () => {
      try {
        const responses = await getResponses(campaign.id);
        setResponseCount(responses.length);
      } catch (error) {
        console.error('Error loading response count:', error);
      }
    };
    
    loadResponseCount();
  }, [campaign.id]);
  
  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-lg h-full flex flex-col">
        <CardHeader
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-gray-900 dark:text-white">{campaign.name}</span>
                {campaign.active && <Badge variant="success" className="ml-2">{t('campaign.active')}</Badge>}
                {!campaign.active && <Badge variant="danger" className="ml-2">{t('campaign.inactive')}</Badge>}
              </div>
              <div className="flex space-x-1">
                <Link to={`/campaigns/${campaign.id}/form`}>
                <Link to={`/dashboard/campaigns/${campaign.id}/form`}>
                  <button
                    className="p-1 text-gray-400 hover:text-[#073143] dark:hover:text-white transition-colors"
                    title={t('campaigns.editCampaign')}
                  >
                    <Edit size={14} />
                  </button>
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title={t('campaigns.deleteCampaign')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          }
          description={
                }
            <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2 text-sm">
              <Calendar size={14} className="mr-1" />
              <span>
                {formatDate(startDate)}
                {endDate ? ` - ${formatDate(endDate)}` : ' - Present'}
              </span>
            </div>
          }
        />
        <CardContent className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {campaign.description || (language === 'pt-BR' ? 'Nenhuma descrição disponível' : 'No description available')}
          </p>
          
          <div className="space-y-2">
            <div className="py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <Clock size={16} className="text-gray-400 mr-2" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('campaigns.created')} {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 size={16} className="text-blue-500 mr-2" />
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  {responseCount} {responseCount === 1 ? t('campaigns.response') : t('campaigns.responses')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 mt-auto">
          <Link to={`/dashboard/campaigns/${campaign.id}`} className="w-full">
            <Button variant="primary" size="sm" icon={<BarChart3 size={14} />} fullWidth>
              {t('campaign.dashboard')}
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('campaigns.deleteCampaign')}
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              isLoading={isDeleting}
              icon={<Trash2 size={16} />}
            >
              {t('campaigns.deleteCampaignButton')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t('campaigns.deleteConfirm')}
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {t('campaigns.deleteDescription')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('campaigns.campaignName')}:</span>
              <span className="text-sm text-gray-900 dark:text-white font-semibold">{campaign.name}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('campaigns.responses')}:</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {responseCount} {responseCount === 1 ? t('campaigns.response') : t('campaigns.responses')}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('campaigns.created')}:</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.status')}:</span>
              <Badge variant={campaign.active ? "success" : "danger"}>
                {campaign.active ? t('campaign.active') : t('campaign.inactive')}
              </Badge>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              {t('campaigns.whatWillBeDeleted')}
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• {t('campaigns.campaignConfig')}</li>
              <li>• {t('campaigns.allResponses')} ({responseCount} {t('campaigns.responses')})</li>
              <li>• {t('campaigns.customFields')}</li>
              <li>• {t('campaigns.surveyCustomization')}</li>
              <li>• {t('campaigns.analyticsData')}</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('campaigns.deleteWarning')} "<strong>{campaign.name}</strong>"? 
            {t('campaigns.actionCannotBeUndone')}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default CampaignCard;