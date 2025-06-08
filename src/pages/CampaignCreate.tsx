import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCampaign, saveCampaignForm } from '../utils/localStorage';
import { Campaign, CampaignForm, SurveyCustomization } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormBuilder from '../components/dashboard/FormBuilder';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Image as ImageIcon, 
  Palette,
  Eye,
  X
} from 'lucide-react';
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
    surveyCustomization: {
      backgroundType: 'color',
      backgroundColor: '#f8fafc',
      primaryColor: '#073143',
      textColor: '#1f2937'
    }
  });
  
  const handleCampaignChange = (field: keyof Campaign, value: string | boolean | null) => {
    setCampaign({ ...campaign, [field]: value });
  };

  const handleCustomizationChange = (field: keyof SurveyCustomization, value: string) => {
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
  
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!campaign.name) {
        alert('Please enter a campaign name');
        return;
      }
    }
    
    if (currentStep === 2) {
      // Save campaign with customization
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

  const presetBackgrounds = [
    { name: 'Light Gray', color: '#f8fafc' },
    { name: 'Blue', color: '#dbeafe' },
    { name: 'Green', color: '#dcfce7' },
    { name: 'Purple', color: '#f3e8ff' },
    { name: 'Orange', color: '#fed7aa' },
    { name: 'Pink', color: '#fce7f3' },
  ];

  const presetPrimaryColors = [
    { name: 'Blue', color: '#073143' },
    { name: 'Green', color: '#10b981' },
    { name: 'Purple', color: '#8b5cf6' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Orange', color: '#f59e0b' },
    { name: 'Pink', color: '#ec4899' },
  ];
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Button 
          variant="outline" 
          icon={<ChevronLeft size={16} />}
          onClick={() => navigate('/')}
        >
          Voltar ao Dashboard
        </Button>
        
        <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">Criar Nova Campanha NPS</h1>
        <div className="flex mt-6 mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-[#073143] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              1
            </div>
            <span className={`ml-2 text-gray-900 dark:text-white ${currentStep === 1 ? 'font-medium' : ''}`}>
              Detalhes da Campanha
            </span>
          </div>
          
          <div className={`w-16 h-1 mt-5 mx-2 ${
            currentStep >= 2 ? 'bg-[#073143]' : 'bg-gray-200 dark:bg-gray-700'
          }`} />
          
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-[#073143] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              2
            </div>
            <span className={`ml-2 text-gray-900 dark:text-white ${currentStep === 2 ? 'font-medium' : ''}`}>
              Design da Pesquisa
            </span>
          </div>

          <div className={`w-16 h-1 mt-5 mx-2 ${
            currentStep >= 3 ? 'bg-[#073143]' : 'bg-gray-200 dark:bg-gray-700'
          }`} />
          
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-[#073143] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              3
            </div>
            <span className={`ml-2 text-gray-900 dark:text-white ${currentStep === 3 ? 'font-medium' : ''}`}>
              Construtor de Formulário
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
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="space-y-6">
            <Input
              label="Nome da Campanha"
              value={campaign.name}
              onChange={(e) => handleCampaignChange('name', e.target.value)}
              placeholder="Digite o nome da campanha"
              fullWidth
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data de Início"
                type="date"
                value={campaign.startDate.toString().split('T')[0]}
                onChange={(e) => handleCampaignChange('startDate', e.target.value)}
                fullWidth
                required
              />
              
              <Input
                label="Data de Fim (Opcional)"
                type="date"
                value={campaign.endDate ? campaign.endDate.toString().split('T')[0] : ''}
                onChange={(e) => handleCampaignChange('endDate', e.target.value || null)}
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Descrição (Opcional)
              </label>
              <textarea
                value={campaign.description}
                onChange={(e) => handleCampaignChange('description', e.target.value)}
                placeholder="Descreva o propósito desta campanha"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#073143]/30 dark:peer-focus:ring-[#073143]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#073143]"></div>
                <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">Ativar Campanha</span>
              </label>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              onClick={handleNextStep}
              icon={<ChevronRight size={16} />}
            >
              Próximo: Design da Pesquisa
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Customization Panel */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
              <Palette className="mr-2" size={20} />
              Personalização da Pesquisa
            </h2>

            <div className="space-y-6">
              {/* Background Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tipo de Fundo
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleCustomizationChange('backgroundType', 'color')}
                    className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                      campaign.surveyCustomization?.backgroundType === 'color'
                        ? 'bg-[#073143]/10 dark:bg-[#073143]/20 border-[#073143] dark:border-[#073143] text-[#073143] dark:text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Palette size={16} className="mr-2" />
                    Cor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomizationChange('backgroundType', 'image')}
                    className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                      campaign.surveyCustomization?.backgroundType === 'image'
                        ? 'bg-[#073143]/10 dark:bg-[#073143]/20 border-[#073143] dark:border-[#073143] text-[#073143] dark:text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ImageIcon size={16} className="mr-2" />
                    Imagem
                  </button>
                </div>
              </div>

              {/* Background Color/Image */}
              {campaign.surveyCustomization?.backgroundType === 'color' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Cor de Fundo
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
                    Imagem de Fundo
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
                          <span className="font-semibold">Clique para enviar</span> imagem de fundo
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
                  Logo (Opcional)
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enviar logo</p>
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
                  Cor Primária
                </label>
                <div className="flex items-center mb-3">
                  <input
                    type="color"
                    value={campaign.surveyCustomization?.primaryColor || '#073143'}
                    onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                    className="w-12 h-10 p-0 border-0 rounded mr-3"
                  />
                  <Input
                    value={campaign.surveyCustomization?.primaryColor || '#073143'}
                    onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                    placeholder="#073143"
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
                  Cor do Texto
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
              Pré-visualização da Pesquisa
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
                    {campaign.name || 'Nome da Campanha'}
                  </h3>
                  
                  <p className="mb-6 opacity-80" style={{ color: campaign.surveyCustomization?.textColor }}>
                    O quanto você recomendaria nosso serviço para um amigo ou colega?
                  </p>
                  
                  <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Nada provável</span>
                      <span className="text-sm text-gray-600">Extremamente provável</span>
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
                      Enviar Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              icon={<ChevronLeft size={16} />}
            >
              Anterior
            </Button>
            <Button
              variant="primary"
              onClick={handleNextStep}
              icon={<ChevronRight size={16} />}
            >
              Próximo: Construtor de Formulário
            </Button>
          </div>
        </motion.div>
      )}
      
      {currentStep === 3 && (
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
              Anterior
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CampaignCreate;