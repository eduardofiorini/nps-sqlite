import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Campaign, CampaignForm as CampaignFormType, SurveyCustomization, CampaignAutomation } from '../types';
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
  Save,
  Settings,
  Webhook,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  Zap,
  Edit
} from 'lucide-react';
import { motion } from 'framer-motion';

const CampaignForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignFormType | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'design' | 'automation' | 'general'>('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        // Load campaign data
        const campaigns = await getCampaigns();
        const foundCampaign = campaigns.find(c => c.id === id);
        setCampaign(foundCampaign || null);

        // Load form data
        const formData = await getCampaignForm(id);
        setForm(formData);
      } catch (error) {
        console.error('Error loading campaign data:', error);
      }
    };

    loadData();
  }, [id]);

  const handleSave = (updatedForm: CampaignFormType) => {
    // Navigate back to campaign dashboard after saving
    navigate(`/campaigns/${id}`);
  };

  const handleCampaignChange = (field: keyof Campaign, value: string | boolean | null) => {
    if (!campaign) return;
    setCampaign({ ...campaign, [field]: value });
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

  const handleAutomationChange = (field: keyof CampaignAutomation, value: string | boolean) => {
    if (!campaign) return;
    
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

  const saveChanges = async () => {
    if (!campaign) return;
    
    setIsSaving(true);
    try {
      saveCampaign(campaign);
      // Show success message or feedback
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error saving campaign:', error);
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
    { name: 'Blue', color: '#073143' },
    { name: 'Green', color: '#10b981' },
    { name: 'Purple', color: '#8b5cf6' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Orange', color: '#f59e0b' },
    { name: 'Pink', color: '#ec4899' },
  ];

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

  if (!campaign) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to={`/user/campaigns/${id}`}>
          <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
            Voltar à Campanha
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar - {campaign.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Personalize sua campanha NPS, formulário, design e automações
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'general'
                  ? 'border-[#073143] text-[#073143] dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Edit size={16} className="inline mr-2" />
              Informações Gerais
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'form'
                  ? 'border-[#073143] text-[#073143] dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Construtor de Formulário
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'design'
                  ? 'border-[#073143] text-[#073143] dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Design da Pesquisa
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'automation'
                  ? 'border-[#073143] text-[#073143] dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Settings size={16} className="inline mr-2" />
              Automação
            </button>
          </nav>
        </div>
      </div>

      {/* General Information Tab */}
      {activeTab === 'general' && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Edit className="mr-2" size={20} />
              Informações da Campanha
            </h2>
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              onClick={saveChanges}
              isLoading={isSaving}
            >
              Salvar Alterações
            </Button>
          </div>

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
        </div>
      )}

      {/* Form Builder Tab */}
      {activeTab === 'form' && (
        <FormBuilder
          initialForm={form}
          campaignId={id!}
          onSave={handleSave}
        />
      )}

      {/* Design Tab */}
      {activeTab === 'design' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customization Panel */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Palette className="mr-2" size={20} />
                Personalização da Pesquisa
              </h2>
              <Button
                variant="primary"
                size="sm"
                icon={<Save size={16} />}
                onClick={saveChanges}
                isLoading={isSaving}
              >
                Salvar Alterações
              </Button>
            </div>

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

              {/* Card Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Cor de Fundo do Cartão
                </label>
                <div className="flex items-center mb-3">
                  <input
                    type="color"
                    value={campaign.surveyCustomization?.cardBackgroundColor || '#ffffff'}
                    onChange={(e) => handleCustomizationChange('cardBackgroundColor', e.target.value)}
                    className="w-12 h-10 p-0 border-0 rounded mr-3"
                  />
                  <Input
                    value={campaign.surveyCustomization?.cardBackgroundColor || '#ffffff'}
                    onChange={(e) => handleCustomizationChange('cardBackgroundColor', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCustomizationChange('cardBackgroundColor', '#ffffff')}
                    className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded mr-2"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Branco</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomizationChange('cardBackgroundColor', '#f3f4f6')}
                    className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded mr-2"
                      style={{ backgroundColor: '#f3f4f6' }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Cinza Claro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomizationChange('cardBackgroundColor', '#eff6ff')}
                    className="flex items-center p-2 rounded-md border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded mr-2"
                      style={{ backgroundColor: '#eff6ff' }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Azul Claro</span>
                  </button>
                </div>
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
              Pré-visualização
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
                    {campaign.name}
                  </h3>
                  
                  <p className="mb-6 opacity-80" style={{ color: campaign.surveyCustomization?.textColor }}>
                    O quanto você recomendaria nosso serviço para um amigo ou colega?
                  </p>
                  
                  <div 
                    className="bg-opacity-95 backdrop-blur-sm rounded-lg p-6 shadow-lg"
                    style={{ backgroundColor: campaign.surveyCustomization?.cardBackgroundColor || '#ffffff' }}
                  >
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
          </div>
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Settings className="mr-2" size={20} />
                Configuração de Automação
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure o que acontece após o envio das respostas da pesquisa
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              onClick={saveChanges}
              isLoading={isSaving}
            >
              Salvar Alterações
            </Button>
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ac75] transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
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
        </div>
      )}
    </div>
  );
};

export default CampaignForm;