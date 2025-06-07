import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCampaign, saveCampaignForm } from '../utils/localStorage';
import { Campaign, CampaignForm } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormBuilder from '../components/dashboard/FormBuilder';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CampaignCreate: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [campaign, setCampaign] = useState<Campaign>({
    id: uuidv4(),
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    description: '',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  const handleCampaignChange = (field: keyof Campaign, value: string | boolean | null) => {
    setCampaign({ ...campaign, [field]: value });
  };
  
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!campaign.name) {
        alert('Please enter a campaign name');
        return;
      }
      
      // Save campaign first
      saveCampaign(campaign);
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleFormSave = (form: CampaignForm) => {
    saveCampaignForm(form);
    
    // Navigate to the campaign dashboard
    navigate(`/campaigns/${campaign.id}`);
  };
  
  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button 
          variant="outline" 
          icon={<ChevronLeft size={16} />}
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
        
        <h1 className="text-2xl font-bold mt-4">Create New NPS Campaign</h1>
        <div className="flex mt-6 mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <span className={`ml-2 ${currentStep === 1 ? 'font-medium' : ''}`}>
              Campaign Details
            </span>
          </div>
          
          <div className={`w-16 h-1 mt-5 mx-2 ${
            currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
          }`} />
          
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className={`ml-2 ${currentStep === 2 ? 'font-medium' : ''}`}>
              Design Form
            </span>
          </div>
        </div>
      </div>
      
      {currentStep === 1 && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          className="bg-white shadow-md rounded-lg p-6"
        >
          <div className="space-y-6">
            <Input
              label="Campaign Name"
              value={campaign.name}
              onChange={(e) => handleCampaignChange('name', e.target.value)}
              placeholder="Enter campaign name"
              fullWidth
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={campaign.startDate.toString().split('T')[0]}
                onChange={(e) => handleCampaignChange('startDate', e.target.value)}
                fullWidth
                required
              />
              
              <Input
                label="End Date (Optional)"
                type="date"
                value={campaign.endDate ? campaign.endDate.toString().split('T')[0] : ''}
                onChange={(e) => handleCampaignChange('endDate', e.target.value || null)}
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                value={campaign.description}
                onChange={(e) => handleCampaignChange('description', e.target.value)}
                placeholder="Describe the purpose of this campaign"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                rows={4}
              />
            </div>
            
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={campaign.active}
                  onChange={(e) => handleCampaignChange('active', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">Activate Campaign</span>
              </label>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              onClick={handleNextStep}
              icon={<ChevronRight size={16} />}
              iconPosition="right"
            >
              Next: Design Form
            </Button>
          </div>
        </motion.div>
      )}
      
      {currentStep === 2 && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
        >
          <FormBuilder
            campaignId={campaign.id}
            onSave={handleFormSave}
          />
          
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              icon={<ChevronLeft size={16} />}
            >
              Previous
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CampaignCreate;