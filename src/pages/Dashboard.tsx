import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CampaignCard from '../components/dashboard/CampaignCard';
import Button from '../components/ui/Button';
import { Campaign } from '../types';
import { getCampaigns, initializeDefaultData } from '../utils/supabaseStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t, language } = useLanguage();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load campaigns
        const loadedCampaigns = await getCampaigns();
        setCampaigns(loadedCampaigns);
        
        // Initialize default data if no campaigns exist
        if (loadedCampaigns.length === 0) {
          await initializeDefaultData();
          // Reload campaigns after initialization
          const reloadedCampaigns = await getCampaigns();
          setCampaigns(reloadedCampaigns);
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleCampaignDeleted = () => {
    setIsRefreshing(true);
    // Reload campaigns after deletion
    setTimeout(async () => {
      try {
        const loadedCampaigns = await getCampaigns();
        setCampaigns(loadedCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
      }
      setIsRefreshing(false);
    }, 500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(async () => {
      try {
        const loadedCampaigns = await getCampaigns();
        setCampaigns(loadedCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
      }
      setIsRefreshing(false);
    }, 500);
  };
  
  // Animation variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const pageTitle = t('campaigns.title');
  const pageSubtitle = t('campaigns.subtitle');
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{pageSubtitle}</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            icon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {t('common.refresh')}
          </Button>
          <Link to="/campaigns/new">
          <Link to="/dashboard/campaigns/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              {t('campaigns.newCampaign')}
            </Button>
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-4 w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('campaigns.noCampaigns')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('campaigns.noCampaignsDesc')}
          </p>
          <Link to="/dashboard/campaigns/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              {t('campaigns.createCampaign')}
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {campaigns.map((campaign) => (
            <motion.div key={campaign.id} variants={item}>
              <CampaignCard 
                campaign={campaign} 
                onDelete={handleCampaignDeleted}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {campaigns.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {campaigns.length} {campaigns.length === 1 ? t('campaigns.campaign') : t('campaigns.campaigns')} {t('campaigns.total')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;