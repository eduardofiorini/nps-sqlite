import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { BarChart3, Calendar, Clock, Edit, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { deleteCampaign, getResponses } from '../../utils/localStorage';

interface CampaignCardProps {
  campaign: Campaign;
  onDelete?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDelete }) => {
  const { t } = useLanguage();
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
      // Get response count for confirmation
      const responses = getResponses(campaign.id);
      
      // Delete the campaign and all its data
      const success = deleteCampaign(campaign.id);
      
      if (success) {
        // Clear campaign form data
        localStorage.removeItem(`forms_${campaign.id}`);
        
        // Clear campaign responses
        const allResponses = JSON.parse(localStorage.getItem('responses') || '[]');
        const filteredResponses = allResponses.filter((r: any) => r.campaignId !== campaign.id);
        localStorage.setItem('responses', JSON.stringify(filteredResponses));
        
        setShowDeleteModal(false);
        onDelete?.();
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const responses = getResponses(campaign.id);
  const responseCount = responses.length;
  
  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-lg h-full flex flex-col">
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
        <CardContent className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {campaign.description || 'No description available'}
          </p>
          
          <div className="space-y-2">
            <div className="py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <Clock size={16} className="text-gray-400 mr-2" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Created {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 size={16} className="text-blue-500 mr-2" />
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  {responseCount} {responseCount === 1 ? 'response' : 'responses'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 mt-auto">
          <div className="flex justify-between w-full">
            <div className="flex space-x-2">
              <Link to={`/campaigns/${campaign.id}`}>
                <Button variant="primary" size="sm" icon={<BarChart3 size={14} />}>
                  {t('campaign.dashboard')}
                </Button>
              </Link>
              <Link to={`/campaigns/${campaign.id}/form`}>
                <Button variant="outline" size="sm" icon={<Edit size={14} />}>
                  {t('campaign.edit')}
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="w-full">
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => setShowDeleteModal(true)}
              fullWidth
            >
              {t('common.delete')}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Campaign"
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
              Delete Campaign
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                This action cannot be undone
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                This will permanently delete the campaign and all associated data.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Name:</span>
              <span className="text-sm text-gray-900 dark:text-white font-semibold">{campaign.name}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Responses:</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {responseCount} {responseCount === 1 ? 'response' : 'responses'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created:</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <Badge variant={campaign.active ? "success" : "danger"}>
                {campaign.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              What will be deleted:
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Campaign configuration and settings</li>
              <li>• All survey responses ({responseCount} responses)</li>
              <li>• Custom form fields and design</li>
              <li>• Survey customization (colors, images, logo)</li>
              <li>• All analytics and reports data</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "<strong>{campaign.name}</strong>"? 
            This action cannot be undone and all data will be permanently lost.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default CampaignCard;