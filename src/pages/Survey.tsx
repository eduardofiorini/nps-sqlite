import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Campaign, CampaignForm, NpsResponse } from '../types';
import { getCampaigns, getCampaignForm, saveResponse, getSituations } from '../utils/localStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

const Survey: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignForm | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [situations] = useState(getSituations());
  const [countdown, setCountdown] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [automationError, setAutomationError] = useState<string>('');
  const { t } = useLanguage();

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

  // Timer effect for countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (submitted && countdown > 0 && !isProcessing) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (submitted && countdown === 0 && !isProcessing) {
      // Handle automation action
      handleAutomationAction();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [submitted, countdown, isProcessing]);

  const handleAutomationAction = () => {
    if (!campaign?.automation?.enabled) {
      // No automation, just reset
      handleReturnToSurvey();
      return;
    }

    const { action, webhookUrl, redirectUrl } = campaign.automation;

    switch (action) {
      case 'return_only':
        handleReturnToSurvey();
        break;
      case 'redirect_only':
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          handleReturnToSurvey();
        }
        break;
      case 'webhook_return':
        // Webhook was already called, just return
        handleReturnToSurvey();
        break;
      case 'webhook_redirect':
        // Webhook was already called, now redirect
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          handleReturnToSurvey();
        }
        break;
      default:
        handleReturnToSurvey();
    }
  };

  const executeWebhook = async (responseData: NpsResponse) => {
    if (!campaign?.automation?.webhookUrl) return;

    try {
      const { webhookUrl, webhookHeaders, webhookPayload } = campaign.automation;
      
      // Validate webhook URL format
      try {
        new URL(webhookUrl);
      } catch (urlError) {
        throw new Error('URL do webhook inválida');
      }

      // Prepare payload
      let payload = {
        campaign_id: responseData.campaignId,
        response_id: responseData.id,
        nps_score: responseData.score,
        feedback: responseData.feedback,
        source_id: responseData.sourceId,
        situation_id: responseData.situationId,
        group_id: responseData.groupId,
        created_at: responseData.createdAt,
        form_responses: responseData.formResponses
      };

      // Apply custom payload if provided
      if (webhookPayload) {
        try {
          let customPayload = webhookPayload;
          // Replace variables
          customPayload = customPayload.replace(/\{\{nps_score\}\}/g, responseData.score.toString());
          customPayload = customPayload.replace(/\{\{feedback\}\}/g, responseData.feedback);
          customPayload = customPayload.replace(/\{\{campaign_id\}\}/g, responseData.campaignId);
          customPayload = customPayload.replace(/\{\{response_id\}\}/g, responseData.id);
          
          const parsedCustomPayload = JSON.parse(customPayload);
          payload = { ...payload, ...parsedCustomPayload };
        } catch (error) {
          console.error('Error parsing custom webhook payload:', error);
          throw new Error('Erro ao processar payload personalizado do webhook');
        }
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        ...webhookHeaders
      };

      // Send webhook with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Webhook falhou com status: ${response.status} ${response.statusText}`);
        }

        console.log('Webhook sent successfully');
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout: O webhook demorou muito para responder');
        }
        
        // Handle different types of fetch errors
        if (fetchError.message.includes('Failed to fetch')) {
          throw new Error('Erro de conectividade: Verifique se a URL do webhook está acessível e se não há problemas de CORS');
        }
        
        throw fetchError;
      }

    } catch (error) {
      console.error('Webhook error:', error);
      
      // Set user-friendly error message
      let errorMessage = 'Erro ao enviar webhook. A resposta foi salva, mas a automação falhou.';
      
      if (error instanceof Error) {
        if (error.message.includes('URL do webhook inválida')) {
          errorMessage = 'URL do webhook inválida. Verifique a configuração da campanha.';
        } else if (error.message.includes('Timeout')) {
          errorMessage = 'Timeout: O webhook demorou muito para responder. A resposta foi salva.';
        } else if (error.message.includes('Erro de conectividade')) {
          errorMessage = 'Erro de conectividade: Verifique se a URL do webhook está acessível e configurada corretamente para CORS.';
        } else if (error.message.includes('Webhook falhou com status')) {
          errorMessage = `Erro do servidor webhook: ${error.message}. A resposta foi salva.`;
        } else if (error.message.includes('payload personalizado')) {
          errorMessage = 'Erro no payload personalizado do webhook. Verifique a configuração JSON.';
        }
      }
      
      setAutomationError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAutomationError(''); // Clear any previous errors

    if (!campaign || !form) return;

    const npsField = form.fields.find(f => f.type === 'nps');
    if (!npsField || !formData[npsField.id]) return;

    // Create the response with campaign defaults and all form field data
    const response: NpsResponse = {
      id: uuidv4(),
      campaignId: campaign.id,
      score: parseInt(formData[npsField.id], 10),
      feedback: formData['feedback'] || '', // Keep for backward compatibility
      sourceId: campaign.defaultSourceId || '',
      situationId: situations[0]?.id || '', // Default to first situation (usually "Responded")
      groupId: campaign.defaultGroupId || '',
      createdAt: new Date().toISOString(),
      formResponses: { ...formData } // Store all form responses
    };

    console.log('Saving response with form data:', response);
    
    // Always save the response first, regardless of webhook success
    saveResponse(response);

    // Execute webhook if configured
    if (campaign.automation?.enabled && 
        (campaign.automation.action === 'webhook_return' || campaign.automation.action === 'webhook_redirect')) {
      await executeWebhook(response);
    }

    setSubmitted(true);
    setIsProcessing(false);
    setCountdown(10); // Reset countdown
  };

  const handleReturnToSurvey = () => {
    setSubmitted(false);
    setFormData({});
    setCountdown(10);
    setAutomationError('');
  };

  if (!campaign || !form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('survey.notFound')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('survey.notFoundDesc')}</p>
        </div>
      </div>
    );
  }

  const customization = campaign.surveyCustomization;

  // Sort fields by order property to ensure correct display order
  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);

  if (submitted) {
    const successMessage = campaign.automation?.successMessage || 'Obrigado pelo seu feedback!';
    
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 transition-colors relative"
        style={{
          backgroundColor: customization?.backgroundType === 'color' 
            ? customization?.backgroundColor 
            : '#f9fafb',
          backgroundImage: customization?.backgroundType === 'image' && customization?.backgroundImage
            ? `url(${customization.backgroundImage})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {customization?.backgroundType === 'image' && customization?.backgroundImage && (
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        )}
        
        <div className="relative z-10 max-w-lg w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-gray-200"
          >
            {customization?.logoImage && (
              <img
                src={customization.logoImage}
                alt="Logo"
                className="w-16 h-16 object-contain mx-auto mb-6"
              />
            )}
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-gray-900 mb-2"
            >
              {t('survey.thankYou')}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-6"
            >
              {successMessage}
            </motion.p>

            {/* Show automation error if any */}
            {automationError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Aviso sobre Automação</p>
                    <p className="text-sm text-yellow-700">{automationError}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Processando automação...</span>
                </div>
              </motion.div>
            )}

            {/* Countdown Timer - only show if not processing and automation is return_only or webhook_return */}
            {!isProcessing && campaign.automation?.enabled && 
             (campaign.automation.action === 'return_only' || campaign.automation.action === 'webhook_return') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    {/* Background circle */}
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    
                    {/* Progress circle */}
                    <svg className="w-16 h-16 absolute inset-0 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (countdown / 10)}`}
                        className="transition-all duration-1000 ease-linear"
                        style={{ color: customization?.primaryColor || '#3b82f6' }}
                      />
                    </svg>
                    
                    {/* Countdown number */}
                    <span className="text-xl font-bold text-gray-900 relative z-10">{countdown}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  Retornando à pesquisa em {countdown} segundos...
                </p>
                
                <Button
                  variant="outline"
                  onClick={handleReturnToSurvey}
                  className="mr-3"
                >
                  Responder Novamente
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => window.close()}
                  style={{ backgroundColor: customization?.primaryColor || '#3b82f6' }}
                >
                  Fechar
                </Button>
              </motion.div>
            )}

            {/* Show different actions based on automation settings */}
            {!isProcessing && campaign.automation?.enabled && 
             (campaign.automation.action === 'redirect_only' || campaign.automation.action === 'webhook_redirect') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <p className="text-sm text-gray-500 mb-4">
                  Redirecionando em {countdown} segundos...
                </p>
                
                <Button
                  variant="primary"
                  onClick={() => {
                    if (campaign.automation?.redirectUrl) {
                      window.location.href = campaign.automation.redirectUrl;
                    }
                  }}
                  style={{ backgroundColor: customization?.primaryColor || '#3b82f6' }}
                >
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* Default actions if no automation */}
            {!isProcessing && !campaign.automation?.enabled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    {/* Background circle */}
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    
                    {/* Progress circle */}
                    <svg className="w-16 h-16 absolute inset-0 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (countdown / 10)}`}
                        className="transition-all duration-1000 ease-linear"
                        style={{ color: customization?.primaryColor || '#3b82f6' }}
                      />
                    </svg>
                    
                    {/* Countdown number */}
                    <span className="text-xl font-bold text-gray-900 relative z-10">{countdown}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  Retornando à pesquisa em {countdown} segundos...
                </p>
                
                <Button
                  variant="outline"
                  onClick={handleReturnToSurvey}
                  className="mr-3"
                >
                  Responder Novamente
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => window.close()}
                  style={{ backgroundColor: customization?.primaryColor || '#3b82f6' }}
                >
                  Fechar
                </Button>
              </motion.div>
            )}

            {/* Additional Info */}
            <div className="text-xs text-gray-400 border-t border-gray-200 pt-4">
              <p>Você pode responder quantas vezes quiser.</p>
              <p>Suas respostas nos ajudam a melhorar nossos serviços.</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 transition-colors relative"
      style={{
        backgroundColor: customization?.backgroundType === 'color' 
          ? customization?.backgroundColor 
          : '#f9fafb',
        backgroundImage: customization?.backgroundType === 'image' && customization?.backgroundImage
          ? `url(${customization.backgroundImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {customization?.backgroundType === 'image' && customization?.backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      )}
      
      <div className="relative z-10 max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
          <div className="p-8">
            {customization?.logoImage && (
              <div className="text-center mb-6">
                <img
                  src={customization.logoImage}
                  alt="Logo"
                  className="w-16 h-16 object-contain mx-auto"
                />
              </div>
            )}
            
            <div className="text-center mb-8">
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ color: customization?.textColor || '#1f2937' }}
              >
                {campaign.name}
              </h1>
              {campaign.description && (
                <p 
                  className="text-sm opacity-80"
                  style={{ color: customization?.textColor || '#6b7280' }}
                >
                  {campaign.description}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {sortedFields.map((field) => {
                if (field.type === 'nps') {
                  return (
                    <div key={field.id} className="space-y-4">
                      <label 
                        className="block text-sm font-medium text-center"
                        style={{ color: customization?.textColor || '#374151' }}
                      >
                        {field.label}
                      </label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs" style={{ color: customization?.textColor || '#6b7280' }}>
                          <span>Nada provável</span>
                          <span>Extremamente provável</span>
                        </div>
                        <div className="flex justify-between space-x-1">
                          {Array.from({ length: 11 }, (_, i) => (
                            <motion.button
                              key={i}
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 text-sm font-medium ${
                                formData[field.id] === i
                                  ? 'text-white shadow-lg transform scale-110'
                                  : 'bg-white hover:shadow-md'
                              }`}
                              style={{
                                borderColor: customization?.primaryColor || '#3b82f6',
                                backgroundColor: formData[field.id] === i 
                                  ? customization?.primaryColor || '#3b82f6'
                                  : 'white',
                                color: formData[field.id] === i 
                                  ? 'white'
                                  : customization?.primaryColor || '#3b82f6'
                              }}
                              onClick={() => setFormData({ ...formData, [field.id]: i })}
                            >
                              {i}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (field.type === 'text') {
                  return (
                    <div key={field.id}>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: customization?.textColor || '#374151' }}
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all"
                        style={{
                          focusRingColor: customization?.primaryColor || '#3b82f6'
                        }}
                        rows={4}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        required={field.required}
                        placeholder="Compartilhe seus comentários..."
                      />
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.id}>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: customization?.textColor || '#374151' }}
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900"
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        required={field.required}
                      >
                        <option value="">Selecione uma opção</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === 'radio') {
                  return (
                    <div key={field.id} className="space-y-3">
                      <label 
                        className="block text-sm font-medium"
                        style={{ color: customization?.textColor || '#374151' }}
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="space-y-2">
                        {field.options?.map((option) => (
                          <label key={option} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={field.id}
                              value={option}
                              checked={formData[field.id] === option}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              className="h-4 w-4 border-gray-300 focus:ring-2"
                              style={{ 
                                accentColor: customization?.primaryColor || '#3b82f6'
                              }}
                              required={field.required}
                            />
                            <span 
                              className="text-sm"
                              style={{ color: customization?.textColor || '#374151' }}
                            >
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isProcessing}
                className="w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: customization?.primaryColor || '#3b82f6',
                  focusRingColor: customization?.primaryColor || '#3b82f6'
                }}
              >
                {isProcessing ? 'Enviando...' : 'Enviar Feedback'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Survey;