import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCampaign, saveCampaignForm, getSources, getGroups } from '../utils/supabaseStorage';
import { Campaign, CampaignForm, SurveyCustomization, CampaignAutomation, Source, Group } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import FormBuilder from '../components/dashboard/FormBuilder';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Image as ImageIcon, 
  Palette,
  Eye,
  X,
  Database,
  Users,
  Zap,
  Globe,
  ArrowRight,
  Settings,
  Webhook,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CampaignCreate: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [sources, setSources] = useState<Source[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [campaign, setCampaign] = useState<Campaign>({
    id: '',
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    description: '',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    defaultSourceId: '',
    defaultGroupId: '',
    surveyCustomization: {
      backgroundType: 'color',
      backgroundColor: '#f8fafc',
      primaryColor: '#073143',
      textColor: '#1f2937'
    },
    automation: {
      enabled: false,
      action: 'return_only',
      successMessage: 'Obrigado pelo seu feedback!',
      errorMessage: 'Ocorreu um erro. Tente novamente.'
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load sources and groups
        const loadedSources = await getSources();
        const loadedGroups = await getGroups();
        
        setSources(loadedSources);
        setGroups(loadedGroups);

        // Set default selections if available
        if (loadedSources.length > 0 && !campaign.defaultSourceId) {
          setCampaign(prev => ({ ...prev, defaultSourceId: loadedSources[0].id }));
        }
        if (loadedGroups.length > 0 && !campaign.defaultGroupId) {
          setCampaign(prev => ({ ...prev, defaultGroupId: loadedGroups[0].id }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);
  
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

  const handleAutomationChange = (field: keyof CampaignAutomation, value: string | boolean) => {
    setCampaign({
      ...campaign,
      automation: {
        ...campaign.automation!,
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
  
  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!campaign.name) {
        alert('Por favor, digite o nome da campanha');
        return;
      }
      if (!campaign.defaultSourceId) {
        alert('Por favor, selecione uma fonte de dados');
        return;
      }
      if (!campaign.defaultGroupId) {
        alert('Por favor, selecione um grupo');
        return;
      }
      
      // Save campaign and update state with returned ID
      try {
        const savedCampaign = await saveCampaign(campaign);
        setCampaign(savedCampaign);
      } catch (error) {
        console.error('Error saving campaign:', error);
        alert('Erro ao salvar campanha. Tente novamente.');
        return;
      }
    }
    
    if (currentStep === 2) {
      // Save campaign with customization
      try {
        const savedCampaign = await saveCampaign(campaign);
        setCampaign(savedCampaign);
      } catch (error) {
        console.error('Error saving campaign:', error);
        alert('Erro ao salvar campanha. Tente novamente.');
        return;
      }
    }

    if (currentStep === 3) {
      // Save campaign with automation
      try {
        const savedCampaign = await saveCampaign(campaign);
        setCampaign(savedCampaign);
      } catch (error) {
        console.error('Error saving campaign:', error);
        alert('Erro ao salvar campanha. Tente novamente.');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleFormSave = async (form: CampaignForm) => {
    try {
      await saveCampaignForm(form);
      
      // Navigate to the campaign dashboard
      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Erro ao salvar formulário. Tente novamente.');
    }
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

  // Convert sources and groups to options format
  const sourceOptions = sources.map(source => ({
    value: source.id,
    label: source.name
  }));

  const groupOptions = groups.map(group => ({
    value: group.id,
    label: group.name
  }));

  const automationActions = [
    {
      value: 'return_only',
      label: 'Apenas voltar para campanha',
      description: 'Após enviar, mostra mensagem de sucesso e retorna à pesquisa',
      icon: <RotateCcw size={20} />,
      color: 'from-gray-400 to-gray-600'
    },
    {
      value: 'redirect_only',
      label: 'Apenas direcionar para outra página',
      description: 'Redireciona para uma URL específica após o envio',
      icon: <ExternalLink size={20} />,
      color: 'from-blue-400 to-blue-600'
    },
    {
      value: 'webhook_return',
      label: 'Disparar webhook e voltar para campanha',
      description: 'Envia dados para webhook e retorna à pesquisa',
      icon: <Webhook size={20} />,
      color: 'from-green-400 to-green-600'
    },
    {
      value: 'webhook_redirect',
      label: 'Disparar webhook e direcionar para outra página',
      description: 'Envia dados para webhook e redireciona para URL',
      icon: <Zap size={20} />,
      color: 'from-purple-400 to-purple-600'
    }
  ];
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Button 
          variant="outline" 
          icon={<ChevronLeft size={16} />}
          onClick={() => navigate('/campaigns')}
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

          <div className={`w-16 h-1 mt-5 mx-2 ${
            currentStep >= 4 ? 'bg-[#073143]' : 'bg-gray-200 dark:bg-gray-700'
          }`} />
          
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 4 ? 'bg-[#073143] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              4
            </div>
            <span className={`ml-2 text-gray-900 dark:text-white ${currentStep === 4 ? 'font-medium' : ''}`}>
              Automação
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

            {/* Source and Group Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Select
                  label="Fonte de Dados Padrão"
                  options={sourceOptions}
                  value={campaign.defaultSourceId || ''}
                  onChange={(e) => handleCampaignChange('defaultSourceId', e.target.value)}
                  fullWidth
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Fonte padrão para novas respostas desta campanha
                </p>
              </div>

              <div className="relative">
                <Select
                  label="Grupo Padrão"
                  options={groupOptions}
                  value={campaign.defaultGroupId || ''}
                  onChange={(e) => handleCampaignChange('defaultGroupId', e.target.value)}
                  fullWidth
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Grupo padrão para segmentação das respostas
                </p>
              </div>
            </div>

            {/* Warning if no sources or groups */}
            {(sources.length === 0 || groups.length === 0) && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Configuração necessária
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        {sources.length === 0 && 'Você precisa configurar pelo menos uma fonte de dados. '}
                        {groups.length === 0 && 'Você precisa configurar pelo menos um grupo. '}
                        Vá para Configurações para adicionar essas opções.
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="-mx-2 -my-1.5 flex">
                        <button
                          type="button"
                          onClick={() => navigate('/settings/sources')}
                          className="bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                        >
                          Configurar Fontes
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/settings/groups')}
                          className="ml-3 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                        >
                          Configurar Grupos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
              disabled={sources.length === 0 || groups.length === 0}
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
                className="min-h-[400px] flex flex-col items-center justify-center relative"
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
                <div className="relative z-10 text-center max-w-lg w-full p-8">
                  {campaign.surveyCustomization?.logoImage && (
                    <img
                      src={campaign.surveyCustomization.logoImage}
                      alt="Logo"
                      className="w-16 h-16 object-contain mx-auto mb-4"
                    />
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2" style={{ color: campaign.surveyCustomization?.textColor }}>
                    {campaign.name || 'Nome da Campanha'}
                  </h3>
                  
                  <p className="mb-6 opacity-80" style={{ color: campaign.surveyCustomization?.textColor }}>
                    O quanto você recomendaria nosso serviço para um amigo ou colega?
                  </p>
                  
                  <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between text-xs mb-4" style={{ color: '#6b7280' }}>
                      <span>Nada provável</span>
                      <span>Extremamente provável</span>
                    </div>
                    <div className="flex justify-between space-x-1 mb-6">
                      {Array.from({ length: 11 }, (_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium cursor-pointer hover:scale-110 transition-transform"
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
                      className="w-full py-3 px-6 rounded-lg text-white font-medium transition-colors hover:shadow-lg"
                      style={{ backgroundColor: campaign.surveyCustomization?.primaryColor }}
                    >
                      Enviar Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Info Preview */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Configurações da Campanha:
              </h4>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Fonte padrão:</strong> {sources.find(s => s.id === campaign.defaultSourceId)?.name || 'Não selecionada'}</p>
                <p><strong>Grupo padrão:</strong> {groups.find(g => g.id === campaign.defaultGroupId)?.name || 'Não selecionado'}</p>
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
            onSave={() => {
              // Save campaign and move to automation step
              saveCampaign(campaign);
              setCurrentStep(4);
            }}
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

      {currentStep === 4 && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Settings className="mr-2" size={20} />
              Configuração de Automação
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure o que acontece após o envio das respostas da pesquisa
            </p>
          </div>

          <div className="space-y-6">
            {/* Enable Automation Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ativar Automação</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Habilite para configurar ações automáticas após o envio
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={campaign.automation?.enabled || false}
                  onChange={(e) => handleAutomationChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#073143]/30 dark:peer-focus:ring-[#073143]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#073143]"></div>
              </label>
            </div>

            {campaign.automation?.enabled && (
              <>
                {/* Action Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Selecione a Ação
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {automationActions.map((action) => (
                      <motion.div
                        key={action.value}
                        whileHover={{ scale: 1.02 }}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          campaign.automation?.action === action.value
                            ? 'border-[#073143] bg-[#073143]/5 dark:bg-[#073143]/10'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => handleAutomationChange('action', action.value)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-white flex-shrink-0`}>
                            {action.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {action.label}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        {campaign.automation?.action === action.value && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle size={20} className="text-[#073143]" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Webhook Configuration */}
                {(campaign.automation?.action === 'webhook_return' || campaign.automation?.action === 'webhook_redirect') && (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
                      <Webhook size={16} className="mr-2" />
                      Configuração do Webhook
                    </h4>
                    
                    <Input
                      label="URL do Webhook"
                      value={campaign.automation?.webhookUrl || ''}
                      onChange={(e) => handleAutomationChange('webhookUrl', e.target.value)}
                      placeholder="https://api.exemplo.com/webhook"
                      fullWidth
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Headers Personalizados (JSON)
                      </label>
                      <textarea
                        value={campaign.automation?.webhookHeaders ? JSON.stringify(campaign.automation.webhookHeaders, null, 2) : '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer seu-token"\n}'}
                        onChange={(e) => {
                          try {
                            const headers = JSON.parse(e.target.value);
                            handleAutomationChange('webhookHeaders', headers);
                          } catch (error) {
                            // Invalid JSON, keep the text for editing
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        rows={4}
                        placeholder='{"Content-Type": "application/json"}'
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payload Personalizado (Opcional)
                      </label>
                      <textarea
                        value={campaign.automation?.webhookPayload || ''}
                        onChange={(e) => handleAutomationChange('webhookPayload', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        rows={3}
                        placeholder='{"custom_field": "valor", "outro_campo": "{{nps_score}}"}'
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Use variáveis como: {`{{nps_score}}, {{feedback}}, {{campaign_id}}, {{response_id}}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Redirect Configuration */}
                {(campaign.automation?.action === 'redirect_only' || campaign.automation?.action === 'webhook_redirect') && (
                  <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center">
                      <ExternalLink size={16} className="mr-2" />
                      Configuração de Redirecionamento
                    </h4>
                    
                    <Input
                      label="URL de Redirecionamento"
                      value={campaign.automation?.redirectUrl || ''}
                      onChange={(e) => handleAutomationChange('redirectUrl', e.target.value)}
                      placeholder="https://www.exemplo.com/obrigado"
                      fullWidth
                      required
                    />
                  </div>
                )}

                {/* Messages Configuration */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mensagens Personalizadas
                  </h4>
                  
                  <Input
                    label="Mensagem de Sucesso"
                    value={campaign.automation?.successMessage || ''}
                    onChange={(e) => handleAutomationChange('successMessage', e.target.value)}
                    placeholder="Obrigado pelo seu feedback!"
                    fullWidth
                  />

                  <Input
                    label="Mensagem de Erro"
                    value={campaign.automation?.errorMessage || ''}
                    onChange={(e) => handleAutomationChange('errorMessage', e.target.value)}
                    placeholder="Ocorreu um erro. Tente novamente."
                    fullWidth
                  />
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Resumo da Automação
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Ação: {automationActions.find(a => a.value === campaign.automation?.action)?.label}
                      </span>
                    </div>
                    {campaign.automation?.webhookUrl && (
                      <div className="flex items-center">
                        <Webhook size={16} className="text-blue-500 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Webhook: {campaign.automation.webhookUrl}
                        </span>
                      </div>
                    )}
                    {campaign.automation?.redirectUrl && (
                      <div className="flex items-center">
                        <ExternalLink size={16} className="text-purple-500 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Redirecionamento: {campaign.automation.redirectUrl}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              icon={<ChevronLeft size={16} />}
            >
              Anterior
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // Save final campaign and navigate to form builder
                try {
                  saveCampaign(campaign);
                } catch (error) {
                  console.error('Error saving campaign:', error);
                  // Continue with form save even if there's an error with campaign save
                  // since the campaign might have been saved successfully despite the error
                }
                handleFormSave({
                  id: uuidv4(),
                  campaignId: campaign.id,
                  fields: [
                    {
                      id: uuidv4(),
                      type: 'nps',
                      label: 'O quanto você recomendaria nosso serviço para um amigo ou colega?',
                      required: true,
                      order: 0,
                    },
                  ],
                });
              }}
              icon={<CheckCircle size={16} />}
            >
              Finalizar Campanha
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CampaignCreate;