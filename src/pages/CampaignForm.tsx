import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Campaign, CampaignForm as CampaignFormType, SurveyCustomization } from '../types';
import { getCampaigns, getCampaignForm, saveCampaign } from '../utils/localStorage';
import FormBuilder from '../components/dashboard/FormBuilder';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  ChevronLeft, 
  Upload, 
  Image as ImageIcon, 
  Palette,
  Eye,
  X,
  Save
} from 'lucide-react';

const CampaignForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignFormType | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'design'>('form');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Load campaign data
    const campaigns = getCampaigns();
    const foundCampaign = campaigns.find(c => c.id === id);
    setCampaign(foundCampaign || null);

    // Load form data
    const formData = getCampaignForm(id);
    setForm(formData);
  }, [id]);

  const handleSave = (updatedForm: CampaignFormType) => {
    // Navigate back to campaign dashboard after saving
    navigate(`/campaigns/${id}`);
  };

  const handleCustomizationChange = (field: keyof SurveyCustomization, value: string) => {
    if (!campaign) return;
    
    setCampaign({
      ...campaign,
      surveyCustomization: {
        ...campaign.surveyCustomization!,
        [field]: value
      }
    });
  };

  const handleImageUpload = (field: 'backgroundImage' | 'logoImage', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleCustomizationChange(field, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: 'backgroundImage' | 'logoImage') => {
    handleCustomizationChange(field, '');
  };

  const saveCustomization = async () => {
    if (!campaign) return;
    
    setIsSaving(true);
    try {
      saveCampaign(campaign);
      // Show success message or feedback
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error saving customization:', error);
      setIsSaving(false);
    }
  };

  const presetBackgrounds = [
    { name: 'Light Gray', color: '#f8fafc' },
    { name: 'Blue', color: '#dbeafe' },
    { name: 'Green', color: '#dcfce7' },
    { name: 'Purple', color: '#f3e8ff' },
    { name: 'Orange', color: '#fed7aa' },
    { name: 'Pink', color: '#fce7f3' },
  ];

  const presetPrimaryColors = [
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Green', color: '#10b981' },
    { name: 'Purple', color: '#8b5cf6' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Orange', color: '#f59e0b' },
    { name: 'Pink', color: '#ec4899' },
  ];

  if (!campaign) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to={`/campaigns/${id}`}>
          <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
            Back to Campaign
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit - {campaign.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your NPS survey form and design
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'form'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Form Builder
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'design'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Survey Design
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'form' && (
        <FormBuilder
          initialForm={form}
          campaignId={id!}
          onSave={handleSave}
        />
      )}

      {activeTab === 'design' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customization Panel */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Palette className="mr-2" size={20} />
                Survey Customization
              </h2>
              <Button
                variant="primary"
                size="sm"
                icon={<Save size={16} />}
                onClick={saveCustomization}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>

            <div className="space-y-6">
              {/* Background Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Background Type
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleCustomizationChange('backgroundType', 'color')}
                    className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                      campaign.surveyCustomization?.backgroundType === 'color'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Palette size={16} className="mr-2" />
                    Color
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomizationChange('backgroundType', 'image')}
                    className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                      campaign.surveyCustomization?.backgroundType === 'image'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ImageIcon size={16} className="mr-2" />
                    Image
                  </button>
                </div>
              </div>

              {/* Background Color/Image */}
              {campaign.surveyCustomization?.backgroundType === 'color' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Background Color
                  </label>
                  <div className="flex items-center mb-3">
                    <input
                      type="color"
                      value={campaign.surveyCustomization?.backgroundColor || '#f8fafc'}
                      onChange={(e) => handleCustomizationChange('backgroundColor', e.target.value)}
                      className="w-12 h-10 p-0 border-0 rounded mr-3"
                    />
                    <Input
                      value={campaign.surveyCustomization?.backgroundColor || '#f8fafc'}
                      onChange={(e) => handleCustomizationChange('backgroundColor', e.target.value)}
                      placeholder="#f8fafc"
                      className="flex-1"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {presetBackgrounds.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleCustomizationChange('backgroundColor', preset.color)}
                        className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                      >
                        <div
                          className="w-6 h-6 rounded mr-2"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Background Image
                  </label>
                  {campaign.surveyCustomization?.backgroundImage ? (
                    <div className="relative">
                      <img
                        src={campaign.surveyCustomization.backgroundImage}
                        alt="Background preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('backgroundImage')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> background image
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('backgroundImage', e)}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Logo (Optional)
                </label>
                {campaign.surveyCustomization?.logoImage ? (
                  <div className="relative inline-block">
                    <img
                      src={campaign.surveyCustomization.logoImage}
                      alt="Logo preview"
                      className="w-24 h-24 object-contain rounded-md border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('logoImage')}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Upload logo</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('logoImage', e)}
                    />
                  </label>
                )}
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Primary Color
                </label>
                <div className="flex items-center mb-3">
                  <input
                    type="color"
                    value={campaign.surveyCustomization?.primaryColor || '#3b82f6'}
                    onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                    className="w-12 h-10 p-0 border-0 rounded mr-3"
                  />
                  <Input
                    value={campaign.surveyCustomization?.primaryColor || '#3b82f6'}
                    onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {presetPrimaryColors.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleCustomizationChange('primaryColor', preset.color)}
                      className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                    >
                      <div
                        className="w-6 h-6 rounded mr-2"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Text Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={campaign.surveyCustomization?.textColor || '#1f2937'}
                    onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                    className="w-12 h-10 p-0 border-0 rounded mr-3"
                  />
                  <Input
                    value={campaign.surveyCustomization?.textColor || '#1f2937'}
                    onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                    placeholder="#1f2937"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
              <Eye className="mr-2" size={20} />
              Live Preview
            </h2>

            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <div
                className="p-8 min-h-[400px] flex flex-col items-center justify-center relative"
                style={{
                  backgroundColor: campaign.surveyCustomization?.backgroundType === 'color' 
                    ? campaign.surveyCustomization?.backgroundColor 
                    : undefined,
                  backgroundImage: campaign.surveyCustomization?.backgroundType === 'image' && campaign.surveyCustomization?.backgroundImage
                    ? `url(${campaign.surveyCustomization.backgroundImage})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: campaign.surveyCustomization?.textColor
                }}
              >
                {campaign.surveyCustomization?.backgroundType === 'image' && campaign.surveyCustomization?.backgroundImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                )}
                
                <div className="relative z-10 text-center max-w-md w-full">
                  {campaign.surveyCustomization?.logoImage && (
                    <img
                      src={campaign.surveyCustomization.logoImage}
                      alt="Logo"
                      className="w-16 h-16 object-contain mx-auto mb-6"
                    />
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2" style={{ color: campaign.surveyCustomization?.textColor }}>
                    {campaign.name}
                  </h3>
                  
                  <p className="mb-6 opacity-80" style={{ color: campaign.surveyCustomization?.textColor }}>
                    How likely are you to recommend our service to a friend or colleague?
                  </p>
                  
                  <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Not likely</span>
                      <span className="text-sm text-gray-600">Extremely likely</span>
                    </div>
                    <div className="flex justify-between space-x-1">
                      {Array.from({ length: 11 }, (_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium cursor-pointer hover:scale-110 transition-transform"
                          style={{
                            borderColor: campaign.surveyCustomization?.primaryColor,
                            color: campaign.surveyCustomization?.primaryColor
                          }}
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                    <button
                      className="w-full mt-6 py-2 px-4 rounded-md text-white font-medium transition-colors"
                      style={{ backgroundColor: campaign.surveyCustomization?.primaryColor }}
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Preview:</strong> This shows how your survey will appear to respondents. 
                Changes are saved automatically when you click "Save Changes".
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignForm;