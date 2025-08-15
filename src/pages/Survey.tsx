import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Campaign, CampaignForm, NpsResponse } from '../types';
import { getCampaigns, getCampaignForm, saveResponse, getSituations, isSupabaseConfigured } from '../utils/supabaseStorage';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

// Language detection and translations for Survey page
const detectBrowserLanguage = (): 'en' | 'pt-BR' | 'es' => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
  if (browserLang.startsWith('pt')) {
    return 'pt-BR';
  } else if (browserLang.startsWith('es')) {
    return 'es';
  } else {
    return 'en'; // Default fallback
  }
};

// Survey-specific translations
const surveyTranslations = {
  'en': {
    thankYou: 'Thank You!',
    notFound: 'Survey not found',
    notFoundDesc: 'The survey you are looking for does not exist or has been removed.',
    submitFeedback: 'Submit Feedback',
    sending: 'Sending...',
    shareFeedback: 'Please share your feedback',
    selectOption: 'Select an option',
    chooseOption: 'Choose an option',
    notLikely: 'Not likely',
    extremelyLikely: 'Extremely likely',
    respondAgain: 'Respond Again',
    close: 'Close',
    redirectingIn: 'Redirecting in',
    returningIn: 'Returning to survey in',
    seconds: 'seconds',
    continue: 'Continue',
    processingAutomation: 'Processing automation...',
    automationWarning: 'Automation Warning',
    tryAgain: 'Try Again',
    attempt: 'Attempt',
    youCanRespond: 'You can respond as many times as you want.',
    helpImprove: 'Your responses help us improve our services.'
  },
  'pt-BR': {
    thankYou: 'Obrigado!',
    notFound: 'Pesquisa não encontrada',
    notFoundDesc: 'A pesquisa que você está procurando não existe ou foi removida.',
    submitFeedback: 'Enviar Feedback',
    sending: 'Enviando...',
    shareFeedback: 'Por favor, compartilhe seu feedback',
    selectOption: 'Selecione uma opção',
    chooseOption: 'Escolha uma opção',
    notLikely: 'Nada provável',
    extremelyLikely: 'Extremamente provável',
    respondAgain: 'Responder Novamente',
    close: 'Fechar',
    redirectingIn: 'Redirecionando em',
    returningIn: 'Retornando à pesquisa em',
    seconds: 'segundos',
    continue: 'Continuar',
    processingAutomation: 'Processando automação...',
    automationWarning: 'Aviso sobre Automação',
    tryAgain: 'Tentar novamente',
    attempt: 'Tentativa',
    youCanRespond: 'Você pode responder quantas vezes quiser.',
    helpImprove: 'Suas respostas nos ajudam a melhorar nossos serviços.'
  },
  'es': {
    thankYou: '¡Gracias!',
    notFound: 'Encuesta no encontrada',
    notFoundDesc: 'La encuesta que buscas no existe o ha sido eliminada.',
    submitFeedback: 'Enviar Comentarios',
    sending: 'Enviando...',
    shareFeedback: 'Por favor, comparte tus comentarios',
    selectOption: 'Selecciona una opción',
    chooseOption: 'Elige una opción',
    notLikely: 'Nada probable',
    extremelyLikely: 'Extremadamente probable',
    respondAgain: 'Responder Nuevamente',
    close: 'Cerrar',
    redirectingIn: 'Redirigiendo en',
    returningIn: 'Volviendo a la encuesta en',
    seconds: 'segundos',
    continue: 'Continuar',
    processingAutomation: 'Procesando automatización...',
    automationWarning: 'Advertencia de Automatización',
    tryAgain: 'Intentar de nuevo',
    attempt: 'Intento',
    youCanRespond: 'Puedes responder tantas veces como quieras.',
    helpImprove: 'Tus respuestas nos ayudan a mejorar nuestros servicios.'
  }
};

const Survey: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignForm | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [situations, setSituations] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [automationError, setAutomationError] = useState<string>('');
  const [webhookRetryCount, setWebhookRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Detect browser language for survey
  const [surveyLanguage] = useState<'en' | 'pt-BR' | 'es'>(detectBrowserLanguage());
  
  // Translation function for survey
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = surveyTranslations[surveyLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // Helper function to extract valid UUID from input string
  const extractValidUUID = (input: string): string | null => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const match = input.match(uuidRegex);
    return match ? match[0] : null;
  };

  useEffect(() => {
    if (!id) {
      setCampaign(null);
      setForm(null);
      return;
    }

    // Extract valid UUID from the input
    const validUUID = extractValidUUID(id);
    if (!validUUID) {
      console.error('No valid UUID found in:', id);
      setCampaign(null);
      setForm(null);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load campaign data
        try {
          const campaigns = await getCampaigns();
          const foundCampaign = campaigns.find(c => c.id === validUUID);
          setCampaign(foundCampaign || null);

          // Load form data
          const formData = await getCampaignForm(validUUID);
          setForm(formData);
          
          // Load situations data
          const situationsData = await getSituations();
          setSituations(situationsData);
        } catch (fetchError) {
          console.error('Error fetching campaign data:', fetchError);
          setError('Erro ao carregar dados da pesquisa. Tente novamente mais tarde.');
        }
      } catch (error) {
        console.error('Error loading survey data:', error);
        setCampaign(null);
        setForm(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
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

  const executeWebhook = async (responseData: NpsResponse, retryAttempt = 0) => {
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
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
          mode: 'cors' // Explicitly set CORS mode
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Webhook falhou com status: ${response.status} ${response.statusText}`);
        }

        console.log('Webhook sent successfully');
        setAutomationError(''); // Clear any previous errors on success
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout: O webhook demorou muito para responder (15s)');
        }
        
        // Handle different types of fetch errors
        if (fetchError.message.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          throw new Error('CORS_ERROR');
        }
        
        throw fetchError;
      }

    } catch (error) {
      console.error('Webhook error:', error);
      
      // Set user-friendly error message
      let errorMessage = 'Erro ao enviar webhook. A resposta foi salva, mas a automação falhou.';
      let showRetryOption = false;
      
      if (error instanceof Error) {
        if (error.message.includes('URL do webhook inválida')) {
          errorMessage = 'URL do webhook inválida. Verifique a configuração da campanha.';
        } else if (error.message.includes('Timeout')) {
          errorMessage = 'Timeout: O webhook demorou muito para responder. A resposta foi salva.';
          showRetryOption = retryAttempt < 2;
        } else if (error.message === 'CORS_ERROR') {
          errorMessage = `Erro de CORS: O servidor webhook não permite requisições desta origem (${window.location.origin}). Para resolver este problema:

• Configure o servidor webhook para incluir o header "Access-Control-Allow-Origin: ${window.location.origin}" ou "Access-Control-Allow-Origin: *"
• Para requisições POST com JSON, o servidor também deve responder a requisições OPTIONS com os headers apropriados
• Alternativamente, use um proxy no seu backend para contornar as restrições de CORS do navegador

A resposta da pesquisa foi salva com sucesso.`;
        } else if (error.message.includes('Webhook falhou com status')) {
          errorMessage = `Erro do servidor webhook: ${error.message}. A resposta foi salva.`;
          showRetryOption = retryAttempt < 2;
        } else if (error.message.includes('payload personalizado')) {
          errorMessage = 'Erro no payload personalizado do webhook. Verifique a configuração JSON.';
        }
      }
      
      setAutomationError(errorMessage);
      
      // Auto-retry for certain errors
      if (showRetryOption && retryAttempt < 2) {
        console.log(`Retrying webhook (attempt ${retryAttempt + 1}/3)...`);
        setWebhookRetryCount(retryAttempt + 1);
        setTimeout(() => {
          executeWebhook(responseData, retryAttempt + 1);
        }, 2000 * (retryAttempt + 1)); // Exponential backoff
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAutomationError(''); // Clear any previous errors
    setWebhookRetryCount(0); // Reset retry count

    if (!campaign || !form) return;

    const npsField = form.fields.find(f => f.type === 'nps');
    if (!npsField || !formData[npsField.id]) return;

    try {
      // Create the response with campaign defaults and all form field data
      const response: NpsResponse = {
        id: uuidv4(),
        campaignId: campaign.id,
        score: parseInt(formData[npsField.id], 10),
        feedback: formData['feedback'] || '', // Keep for backward compatibility
        sourceId: campaign.defaultSourceId || '',
        situationId: situations.length > 0 ? situations[0].id : null, // Default to first situation or null
        groupId: campaign.defaultGroupId || '',
        createdAt: new Date().toISOString(),
        formResponses: { ...formData } // Store all form responses
      };

      console.log('Saving response with form data:', response);
      
      // Always save the response first, regardless of webhook success
      await saveResponse(response);

      // Execute webhook if configured
      if (campaign.automation?.enabled && 
          (campaign.automation.action === 'webhook_return' || campaign.automation.action === 'webhook_redirect')) {
        await executeWebhook(response);
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error saving response:', error);
      setAutomationError('Erro ao salvar resposta. Tente novamente.');
    } finally {
      setIsProcessing(false);
      setCountdown(10); // Reset countdown
    }
  };

  const handleReturnToSurvey = () => {
    setSubmitted(false);
    setFormData({});
    setCountdown(10);
    setAutomationError('');
    setWebhookRetryCount(0);
  };

  const retryWebhook = async () => {
    if (!campaign || webhookRetryCount >= 3) return;
    
    setIsProcessing(true);
    setAutomationError('');
    
    // Get the last response to retry webhook
    const responses = JSON.parse(localStorage.getItem('nps_responses') || '[]');
    const lastResponse = responses[responses.length - 1];
    
    if (lastResponse) {
      await executeWebhook(lastResponse, webhookRetryCount);
    }
    
    setIsProcessing(false);
  };

  if (isLoading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ac75]"></div>
        </div>
      </div>
    );
  }

  if ((!isLoading && (!campaign || !form)) || error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {error || t('notFound')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error ? (surveyLanguage === 'pt-BR' ? 'Tente novamente mais tarde.' : surveyLanguage === 'es' ? 'Inténtalo de nuevo más tarde.' : 'Try again later.') : t('notFoundDesc')}
          </p>
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
        
        <div className="relative z-10 max-w-2xl w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-gray-200"
            style={{ backgroundColor: customization?.cardBackgroundColor || '#ffffff' }}
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
              {t('thankYou')}
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
                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left"
              >
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Aviso sobre Automação</p>
                    <div className="text-sm text-yellow-700 whitespace-pre-line">{automationError}</div>
                    
                    {/* Show retry button for certain errors */}
                    {(automationError.includes('Timeout') || automationError.includes('servidor webhook')) && webhookRetryCount < 3 && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={retryWebhook}
                          disabled={isProcessing}
                          className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                        >
                          {isProcessing ? 'Tentando novamente...' : `Tentar novamente (${webhookRetryCount + 1}/3)`}
                        </Button>
                      </div>
                    )}
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
                  <span className="text-sm text-gray-600">
                    {webhookRetryCount > 0 ? `Tentativa ${webhookRetryCount + 1}/3...` : 'Processando automação...'}
                  </span>
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
                  {t('returningIn')} {countdown} {t('seconds')}...
                </p>
                
                <Button
                  variant="outline"
                  onClick={handleReturnToSurvey}
                  className="mr-3"
                >
                  {t('respondAgain')}
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => window.close()}
                  style={{ backgroundColor: customization?.primaryColor || '#3b82f6' }}
                >
                  {t('close')}
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
                  {t('redirectingIn')} {countdown} {t('seconds')}...
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
                  {t('continue')}
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
                  {t('returningIn')} {countdown} {t('seconds')}...
                </p>
                
                <Button
                  variant="outline"
                  onClick={handleReturnToSurvey}
                  className="mr-3"
                >
                  {t('respondAgain')}
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => window.close()}
                  style={{ backgroundColor: customization?.primaryColor || '#3b82f6' }}
                >
                  {t('close')}
                </Button>
              </motion.div>
            )}

            {/* Additional Info */}
            <div className="text-xs text-gray-400 border-t border-gray-200 pt-4">
              <p>{t('youCanRespond')}</p>
              <p>{t('helpImprove')}</p>
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
          className="bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200"
          style={{ backgroundColor: customization?.cardBackgroundColor || '#ffffff' }}
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
                          <span>{t('notLikely')}</span>
                          <span>{t('extremelyLikely')}</span>
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
                        placeholder={t('shareFeedback')}
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
                        <option value="">{t('selectOption')}</option>
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
                {isProcessing ? t('sending') : t('submitFeedback')}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Survey;