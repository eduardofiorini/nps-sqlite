import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Campaign, NpsResponse } from '../types';
import { getCampaigns, getResponses, getSources, getSituations, getContacts, getGroups } from '../utils/localStorage';
import { calculateNPS, categorizeResponses, responsesBySource, npsOverTime } from '../utils/npsCalculator';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { NpsDoughnut, NpsDistribution, NpsTrend } from '../components/dashboard/NpsChart';
import { 
  ChevronLeft, 
  PieChart, 
  Edit, 
  MessageSquare, 
  Share, 
  Monitor, 
  X, 
  Maximize,
  Mail,
  Send,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Code,
  Type,
  Eye,
  User,
  ExternalLink,
  Smartphone,
  MessageCircle,
  Minimize
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';

const CampaignDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [responses, setResponses] = useState<NpsResponse[]>([]);
  const [sources, setSources] = useState<Record<string, string>>({});
  const [situations, setSituations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTvMode, setIsTvMode] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [emailType, setEmailType] = useState<'text' | 'html'>('html');
  const [emailProvider, setEmailProvider] = useState<'smtp' | 'zenvia'>('smtp');
  const [smsProvider, setSmsProvider] = useState<'sms' | 'whatsapp'>('sms');
  const [targetContacts, setTargetContacts] = useState<any[]>([]);
  const [previewContact, setPreviewContact] = useState<any>(null);
  
  useEffect(() => {
    if (!id) return;
    
    const loadData = () => {
      // Load campaign data
      const campaigns = getCampaigns();
      const foundCampaign = campaigns.find((c) => c.id === id);
      
      if (!foundCampaign) {
        navigate('/');
        return;
      }
      
      setCampaign(foundCampaign);
      
      // Load responses for this campaign
      const campaignResponses = getResponses(id);
      setResponses(campaignResponses);
      
      // Load sources and situations for reference
      const allSources = getSources();
      const sourcesMap: Record<string, string> = {};
      allSources.forEach((source) => {
        sourcesMap[source.id] = source.name;
      });
      setSources(sourcesMap);
      
      const allSituations = getSituations();
      const situationsMap: Record<string, string> = {};
      allSituations.forEach((situation) => {
        situationsMap[situation.id] = situation.name;
      });
      setSituations(situationsMap);
      
      // Load contacts for the campaign's group
      if (foundCampaign.defaultGroupId) {
        const allContacts = getContacts();
        const groupContacts = allContacts.filter(contact => 
          contact.groupIds.includes(foundCampaign.defaultGroupId!)
        );
        setTargetContacts(groupContacts);
        setPreviewContact(groupContacts[0] || null);
        
        // Set default email content
        setEmailSubject(`Pesquisa NPS: ${foundCampaign.name}`);
        setEmailBody(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesquisa NPS</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; height: auto; }
        h1 { color: #073143; margin-bottom: 10px; }
        .highlight { background-color: #073143; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        .personalized { color: #073143; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pesquisa de Satisfação NPS</h1>
        </div>
        
        <p>Olá <span class="personalized">{{nome}}</span>,</p>
        
        <p>Esperamos que você esteja bem! Gostaríamos de conhecer sua opinião sobre nossos serviços.</p>
        
        <p>Sua avaliação é muito importante para nós e nos ajuda a melhorar continuamente nossos produtos e serviços.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_pesquisa}}" class="highlight">Responder Pesquisa NPS</a>
        </div>
        
        <p>A pesquisa leva apenas alguns minutos para ser concluída e sua participação faz toda a diferença!</p>
        
        <p>Obrigado pela sua confiança e por nos ajudar a crescer.</p>
        
        <p>Atenciosamente,<br>
        <strong>Equipe ${foundCampaign.name}</strong></p>
        
        <div class="footer">
            <p>Este e-mail foi enviado para {{email}}. Se você não deseja mais receber estes e-mails, pode ignorar esta mensagem.</p>
        </div>
    </div>
</body>
</html>`);

        // Set default SMS content
        setSmsBody(`Olá {{nome}}! 

Gostaríamos de conhecer sua opinião sobre nossos serviços. Sua avaliação é muito importante para nós!

Responda nossa pesquisa NPS: {{link_pesquisa}}

Obrigado!
Equipe ${foundCampaign.name}`);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [id, navigate]);

  // Handle escape key to exit TV mode
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isTvMode) {
        exitTvMode();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isTvMode]);

  // Auto-refresh data in TV mode
  useEffect(() => {
    if (!isTvMode || !id) return;

    const interval = setInterval(() => {
      const campaignResponses = getResponses(id);
      setResponses(campaignResponses);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isTvMode, id]);

  const enterTvMode = () => {
    setIsTvMode(true);
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    }
  };

  const exitTvMode = () => {
    setIsTvMode(false);
    // Exit fullscreen
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  };

  const personalizeContent = (content: string, contact: any): string => {
    const surveyLink = `${window.location.origin}/survey/${campaign?.id}`;
    
    return content
      .replace(/\{\{nome\}\}/g, contact.name)
      .replace(/\{\{email\}\}/g, contact.email)
      .replace(/\{\{telefone\}\}/g, contact.phone || '')
      .replace(/\{\{empresa\}\}/g, contact.company || '')
      .replace(/\{\{cargo\}\}/g, contact.position || '')
      .replace(/\{\{link_pesquisa\}\}/g, surveyLink);
  };

  const handleSendEmail = async () => {
    if (!campaign || targetContacts.length === 0) return;
    
    setEmailStatus('sending');
    setEmailMessage('');
    
    try {
      // Simulate email sending process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would integrate with an email service
      // For each contact, personalize the content
      const personalizedEmails = targetContacts.map(contact => ({
        to: contact.email,
        subject: personalizeContent(emailSubject, contact),
        body: personalizeContent(emailBody, contact),
        type: emailType,
        provider: emailProvider
      }));
      
      console.log('Sending personalized emails via', emailProvider, ':', personalizedEmails);
      
      setEmailStatus('success');
      setEmailMessage(`E-mails personalizados enviados com sucesso via ${emailProvider.toUpperCase()} para ${targetContacts.length} contatos!`);
      
      // Auto-close modal after success
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailStatus('idle');
        setEmailMessage('');
      }, 3000);
      
    } catch (error) {
      setEmailStatus('error');
      setEmailMessage('Erro ao enviar e-mails. Tente novamente.');
    }
  };

  const handleSendSms = async () => {
    if (!campaign || targetContacts.length === 0) return;
    
    setSmsStatus('sending');
    setSmsMessage('');
    
    try {
      // Simulate SMS sending process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would integrate with ZenVia API
      const personalizedMessages = targetContacts.map(contact => ({
        to: smsProvider === 'sms' ? contact.phone : contact.phone,
        message: personalizeContent(smsBody, contact),
        provider: smsProvider
      }));
      
      console.log(`Sending personalized ${smsProvider} messages via ZenVia:`, personalizedMessages);
      
      setSmsStatus('success');
      setSmsMessage(`Mensagens ${smsProvider.toUpperCase()} enviadas com sucesso via ZenVia para ${targetContacts.length} contatos!`);
      
      // Auto-close modal after success
      setTimeout(() => {
        setIsSmsModalOpen(false);
        setSmsStatus('idle');
        setSmsMessage('');
      }, 3000);
      
    } catch (error) {
      setSmsStatus('error');
      setSmsMessage(`Erro ao enviar mensagens ${smsProvider.toUpperCase()}. Tente novamente.`);
    }
  };

  const openEmailModal = () => {
    if (!campaign?.defaultGroupId) {
      alert('Esta campanha não possui um grupo padrão configurado. Configure um grupo nas configurações da campanha.');
      return;
    }
    
    if (targetContacts.length === 0) {
      alert('Não há contatos no grupo desta campanha. Adicione contatos ao grupo primeiro.');
      return;
    }
    
    setIsEmailModalOpen(true);
  };

  const openSmsModal = () => {
    if (!campaign?.defaultGroupId) {
      alert('Esta campanha não possui um grupo padrão configurado. Configure um grupo nas configurações da campanha.');
      return;
    }
    
    if (targetContacts.length === 0) {
      alert('Não há contatos no grupo desta campanha. Adicione contatos ao grupo primeiro.');
      return;
    }
    
    // Filter contacts that have phone numbers
    const contactsWithPhone = targetContacts.filter(contact => contact.phone && contact.phone.trim() !== '');
    
    if (contactsWithPhone.length === 0) {
      alert('Não há contatos com telefone no grupo desta campanha. Adicione números de telefone aos contatos primeiro.');
      return;
    }
    
    setIsSmsModalOpen(true);
  };

  const switchToTextTemplate = () => {
    setEmailType('text');
    setEmailBody(`Olá {{nome}},

Gostaríamos de conhecer sua opinião sobre nossos serviços. Sua avaliação é muito importante para nós!

Por favor, clique no link abaixo para responder nossa pesquisa NPS:
{{link_pesquisa}}

A pesquisa leva apenas alguns minutos para ser concluída.

Obrigado pela sua participação!

Atenciosamente,
Equipe ${campaign?.name || 'Nossa Equipe'}`);
  };

  const switchToHtmlTemplate = () => {
    setEmailType('html');
    setEmailBody(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesquisa NPS</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; height: auto; }
        h1 { color: #073143; margin-bottom: 10px; }
        .highlight { background-color: #073143; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        .personalized { color: #073143; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pesquisa de Satisfação NPS</h1>
        </div>
        
        <p>Olá <span class="personalized">{{nome}}</span>,</p>
        
        <p>Esperamos que você esteja bem! Gostaríamos de conhecer sua opinião sobre nossos serviços.</p>
        
        <p>Sua avaliação é muito importante para nós e nos ajuda a melhorar continuamente nossos produtos e serviços.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_pesquisa}}" class="highlight">Responder Pesquisa NPS</a>
        </div>
        
        <p>A pesquisa leva apenas alguns minutos para ser concluída e sua participação faz toda a diferença!</p>
        
        <p>Obrigado pela sua confiança e por nos ajudar a crescer.</p>
        
        <p>Atenciosamente,<br>
        <strong>Equipe ${campaign?.name || 'Nossa Equipe'}</strong></p>
        
        <div class="footer">
            <p>Este e-mail foi enviado para {{email}}. Se você não deseja mais receber estes e-mails, pode ignorar esta mensagem.</p>
        </div>
    </div>
</body>
</html>`);
  };
  
  if (isLoading || !campaign) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }
  
  const npsScore = calculateNPS(responses);
  const { promoters, passives, detractors } = categorizeResponses(responses);
  const trendData = npsOverTime(responses, 6);
  
  // Format dates
  const startDate = new Date(campaign.startDate).toLocaleDateString();
  const endDate = campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Presente';

  // TV Mode Component
  const TvDashboard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white z-50 overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {/* Exit Button */}
      <button
        onClick={exitTvMode}
        className="absolute top-4 right-4 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200 flex items-center space-x-2"
      >
        <Minimize size={20} className="text-white" />
        <span className="text-white text-sm">Sair do Modo TV</span>
      </button>

      {/* Header - Compact */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{campaign.name}</h1>
            <div className="flex items-center space-x-3 text-gray-300">
              <span className="text-sm">{startDate} até {endDate}</span>
              {campaign.active ? (
                <Badge variant="success" className="text-xs px-2 py-1">Ativa</Badge>
              ) : (
                <Badge variant="danger" className="text-xs px-2 py-1">Inativa</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Última atualização</div>
            <div className="text-sm text-white">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <PieChart size={48} className="text-gray-400 mx-auto mb-3" />
            <h3 className="text-2xl font-semibold text-white mb-3">Nenhuma resposta ainda</h3>
            <p className="text-lg text-gray-400">
              Aguardando primeiras respostas da pesquisa NPS
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 h-[calc(100vh-120px)] flex flex-col">
          {/* Main Metrics Row */}
          <div className="grid grid-cols-12 gap-4 mb-4 flex-shrink-0">
            {/* NPS Score - Compact */}
            <div className="col-span-3">
              <div className="bg-gray-800 rounded-xl p-4 h-full flex flex-col items-center justify-center border border-gray-700">
                <h2 className="text-lg font-semibold text-gray-300 mb-3">Pontuação NPS</h2>
                <div className="flex justify-center mb-3">
                  <NpsDoughnut npsScore={npsScore} width={160} height={160} />
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Baseado em</div>
                  <div className="text-xl font-bold text-white">{responses.length} respostas</div>
                </div>
              </div>
            </div>

            {/* Distribution - Compact */}
            <div className="col-span-4">
              <div className="bg-gray-800 rounded-xl p-4 h-full border border-gray-700">
                <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">Distribuição</h2>
                <div className="h-32 mb-3">
                  <NpsDistribution
                    promoters={promoters}
                    passives={passives}
                    detractors={detractors}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-red-900/30 p-2 rounded-lg text-center border border-red-800">
                    <div className="text-xl font-bold text-red-400">{detractors}</div>
                    <div className="text-xs text-red-300">Detratores</div>
                  </div>
                  <div className="bg-yellow-900/30 p-2 rounded-lg text-center border border-yellow-800">
                    <div className="text-xl font-bold text-yellow-400">{passives}</div>
                    <div className="text-xs text-yellow-300">Neutros</div>
                  </div>
                  <div className="bg-green-900/30 p-2 rounded-lg text-center border border-green-800">
                    <div className="text-xl font-bold text-green-400">{promoters}</div>
                    <div className="text-xs text-green-300">Promotores</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend - Compact */}
            <div className="col-span-5">
              <div className="bg-gray-800 rounded-xl p-4 h-full border border-gray-700">
                <h2 className="text-lg font-semibold text-gray-300 mb-3 text-center">Tendência NPS</h2>
                <div className="h-40">
                  <NpsTrend data={trendData} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Responses - Flexible Height */}
          <div className="flex-1 min-h-0">
            <div className="bg-gray-800 rounded-xl p-4 h-full border border-gray-700 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-300 mb-3">Últimas Respostas</h2>
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {responses.slice(0, 8).map((response) => (
                    <div key={response.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600 flex-shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                            response.score >= 9 
                              ? 'bg-green-500 text-white' 
                              : response.score <= 6 
                              ? 'bg-red-500 text-white' 
                              : 'bg-yellow-500 text-white'
                          }`}
                        >
                          {response.score}
                        </div>
                        <div className="text-right flex-1 ml-2">
                          <div className="text-sm font-medium text-white truncate">
                            {sources[response.sourceId] || 'Fonte Desconhecida'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(response.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {response.feedback && (
                        <div className="text-xs text-gray-300 bg-gray-600 p-2 rounded line-clamp-2">
                          "{response.feedback}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Compact */}
      <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center text-gray-400 text-xs">
        <div>Pressione ESC ou clique no botão para sair do modo TV</div>
        <div>Atualização automática a cada 30 segundos</div>
      </div>
    </motion.div>
  );
  
  return (
    <>
      <div>
        <div className="mb-6">
          <Link to="/campaigns">
            <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
        
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
              <div className="flex items-center mt-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {startDate} até {endDate}
                </span>
                {campaign.active ? (
                  <Badge variant="success" className="ml-2">
                    Ativa
                  </Badge>
                ) : (
                  <Badge variant="danger" className="ml-2">
                    Inativa
                  </Badge>
                )}
              </div>
              {campaign.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">{campaign.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                icon={<Monitor size={16} />}
                onClick={enterTvMode}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Modo TV
              </Button>
              <Button 
                variant="secondary" 
                icon={<Mail size={16} />}
                onClick={openEmailModal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Enviar por E-mail
              </Button>
              <Button 
                variant="secondary" 
                icon={<MessageCircle size={16} />}
                onClick={openSmsModal}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Enviar por Mensagem
              </Button>
              <Link to={`/campaigns/${id}/form`}>
                <Button variant="outline" icon={<Edit size={16} />}>
                  Editar Formulário
                </Button>
              </Link>
              <Link to={`/campaigns/${id}/responses`}>
                <Button variant="outline" icon={<MessageSquare size={16} />}>
                  Ver Respostas
                </Button>
              </Link>
              <Link to={`/campaigns/${id}/share`}>
                <Button variant="primary" icon={<Share size={16} />}>
                  Compartilhar
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        {responses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="mb-4 w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <PieChart size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhuma resposta ainda</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Compartilhe sua pesquisa NPS com clientes para começar a coletar feedback.
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="secondary" icon={<Mail size={16} />} onClick={openEmailModal}>
                Enviar por E-mail
              </Button>
              <Button variant="secondary" icon={<MessageCircle size={16} />} onClick={openSmsModal}>
                Enviar por Mensagem
              </Button>
              <Link to={`/campaigns/${id}/share`}>
                <Button variant="primary">
                  Compartilhar Pesquisa
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader title="Pontuação NPS Atual" />
                <CardContent>
                  <div className="flex justify-center py-4">
                    <NpsDoughnut npsScore={npsScore} width={200} height={200} />
                  </div>
                  <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Baseado em {responses.length} respostas
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-8">
              <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader title="Tendência NPS" />
                <CardContent>
                  <div className="h-64">
                    <NpsTrend data={trendData} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader title="Distribuição de Respostas" />
                <CardContent>
                  <div className="h-64">
                    <NpsDistribution
                      promoters={promoters}
                      passives={passives}
                      detractors={detractors}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      <div className="text-xl font-bold text-red-500">{detractors}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Detratores</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                      <div className="text-xl font-bold text-yellow-500">{passives}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Neutros</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                      <div className="text-xl font-bold text-green-500">{promoters}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Promotores</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader title="Últimas Respostas" />
                <CardContent>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {responses.slice(0, 5).map((response) => (
                      <div key={response.id} className="py-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                response.score >= 9 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                                  : response.score <= 6 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' 
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                              }`}
                            >
                              {response.score}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {sources[response.sourceId] || 'Fonte Desconhecida'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(response.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge>
                            {situations[response.situationId] || 'Desconhecido'}
                          </Badge>
                        </div>
                        {response.feedback && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-13 ml-10">
                            "{response.feedback}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {responses.length > 5 && (
                    <div className="mt-4 text-center">
                      <Link to={`/campaigns/${id}/responses`}>
                        <Button variant="outline" size="sm">
                          Ver Todas ({responses.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* TV Mode Overlay */}
      <AnimatePresence>
        {isTvMode && <TvDashboard />}
      </AnimatePresence>

      {/* Email Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Enviar Campanha por E-mail"
        size="2xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEmailModalOpen(false)}
              disabled={emailStatus === 'sending'}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendEmail}
              isLoading={emailStatus === 'sending'}
              icon={emailStatus === 'sending' ? <Clock size={16} /> : <Send size={16} />}
              disabled={!emailSubject || !emailBody || targetContacts.length === 0}
            >
              {emailStatus === 'sending' ? 'Enviando...' : `Enviar para ${targetContacts.length} contatos`}
            </Button>
          </div>
        }
      >
        <div className="max-h-[80vh] overflow-y-auto space-y-6">
          {/* Status Messages */}
          {emailStatus === 'success' && (
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle size={18} className="text-green-600 dark:text-green-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">E-mails Enviados!</h4>
                <p className="text-xs text-green-700 dark:text-green-300">{emailMessage}</p>
              </div>
            </div>
          )}

          {emailStatus === 'error' && (
            <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Erro no Envio</h4>
                <p className="text-xs text-red-700 dark:text-red-300">{emailMessage}</p>
              </div>
            </div>
          )}

          {/* Target Contacts Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-1">
              <Users size={14} className="text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Grupo: {getGroups().find(g => g.id === campaign?.defaultGroupId)?.name || 'Grupo Padrão'}
              </h4>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>{targetContacts.length} contatos</strong> receberão o e-mail personalizado.
            </p>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Provedor de E-mail
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setEmailProvider('smtp')}
                className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                  emailProvider === 'smtp'
                    ? 'bg-[#073143]/10 dark:bg-[#073143]/20 border-[#073143] dark:border-[#073143] text-[#073143] dark:text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Mail size={16} className="mr-2" />
                SMTP
              </button>
              <button
                type="button"
                onClick={() => setEmailProvider('zenvia')}
                className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                  emailProvider === 'zenvia'
                    ? 'bg-[#073143]/10 dark:bg-[#073143]/20 border-[#073143] dark:border-[#073143] text-[#073143] dark:text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Send size={16} className="mr-2" />
                ZenVia E-mail
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Email configuration */}
            <div className="space-y-4">
              {/* Email Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de E-mail
                </label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={switchToTextTemplate}
                    className={`flex items-center px-3 py-2 rounded-md border text-sm transition-colors ${
                      emailType === 'text'
                        ? 'bg-[#073143]/10 dark:bg-[#073143]/20 border-[#073143] dark:border-[#073143] text-[#073143] dark:text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Type size={14} className="mr-1" />
                    Texto
                  </button>
                  <button
                    type="button"
                    onClick={switchToHtmlTemplate}
                    className={`flex items-center px-3 py-2 rounded-md border text-sm transition-colors ${
                      emailType === 'html'
                        ? 'bg-[#073143]/10 dark:bg-[#073143]/20 border-[#073143] dark:border-[#073143] text-[#073143] dark:text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Code size={14} className="mr-1" />
                    HTML
                  </button>
                </div>
              </div>

              {/* Email Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Digite o assunto do e-mail"
                  disabled={emailStatus === 'sending'}
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Conteúdo ({emailType === 'html' ? 'HTML' : 'Texto'})
                </label>
                
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  {emailType === 'html' ? (
                    <div style={{ isolation: 'isolate' }}>
                      <CodeMirror
                        value={emailBody}
                        onChange={(value) => setEmailBody(value)}
                        extensions={[html()]}
                        theme={isDark ? oneDark : undefined}
                        height="300px"
                        basicSetup={{
                          lineNumbers: true,
                          foldGutter: false,
                          dropCursor: false,
                          allowMultipleSelections: false,
                          indentOnInput: true,
                          bracketMatching: true,
                          closeBrackets: true,
                          autocompletion: true,
                          highlightSelectionMatches: false,
                        }}
                        placeholder="Digite o HTML do e-mail"
                        editable={emailStatus !== 'sending'}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm"
                      rows={12}
                      placeholder="Digite o conteúdo do e-mail"
                      disabled={emailStatus === 'sending'}
                    />
                  )}
                </div>
              </div>

              {/* Contact Selector for Preview */}
              {targetContacts.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visualizar como:
                  </label>
                  <select
                    value={previewContact?.id || ''}
                    onChange={(e) => {
                      const contact = targetContacts.find(c => c.id === e.target.value);
                      setPreviewContact(contact);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {targetContacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Personalization Variables */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Variáveis Disponíveis:
                </h4>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{nome}}'}</code>
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{email}}'}</code>
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{telefone}}'}</code>
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{empresa}}'}</code>
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{cargo}}'}</code>
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{link_pesquisa}}'}</code>
                </div>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preview do E-mail
                </h4>
                {previewContact && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Visualizando como: {previewContact.name}
                  </div>
                )}
              </div>

              {/* Email Preview Container */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                {/* Email Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-12">Para:</span>
                      <span className="text-gray-900 dark:text-white">
                        {previewContact ? `${previewContact.name} <${previewContact.email}>` : 'Contato não selecionado'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-12">Assunto:</span>
                      <span className="text-gray-900 dark:text-white">
                        {previewContact ? personalizeContent(emailSubject, previewContact) : emailSubject}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-12">Via:</span>
                      <span className="text-gray-900 dark:text-white">
                        {emailProvider.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Content Preview */}
                <div className="p-4 max-h-96 overflow-y-auto">
                  {previewContact ? (
                    emailType === 'html' ? (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: personalizeContent(emailBody, previewContact) 
                        }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                        {personalizeContent(emailBody, previewContact)}
                      </div>
                    )
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      Selecione um contato para visualizar o preview
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {previewContact && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Dados do Contato:
                  </h4>
                  <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                    <div><strong>Nome:</strong> {previewContact.name}</div>
                    <div><strong>Email:</strong> {previewContact.email}</div>
                    {previewContact.phone && <div><strong>Telefone:</strong> {previewContact.phone}</div>}
                    {previewContact.company && <div><strong>Empresa:</strong> {previewContact.company}</div>}
                    {previewContact.position && <div><strong>Cargo:</strong> {previewContact.position}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warning if no contacts */}
          {targetContacts.length === 0 && (
            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Nenhum Contato</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Adicione contatos ao grupo desta campanha primeiro.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* SMS/WhatsApp Modal */}
      <Modal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        title="Enviar Campanha por Mensagem"
        size="2xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsSmsModalOpen(false)}
              disabled={smsStatus === 'sending'}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendSms}
              isLoading={smsStatus === 'sending'}
              icon={smsStatus === 'sending' ? <Clock size={16} /> : <Send size={16} />}
              disabled={!smsBody || targetContacts.filter(c => c.phone).length === 0}
            >
              {smsStatus === 'sending' ? 'Enviando...' : `Enviar ${smsProvider.toUpperCase()} para ${targetContacts.filter(c => c.phone).length} contatos`}
            </Button>
          </div>
        }
      >
        <div className="max-h-[80vh] overflow-y-auto space-y-6">
          {/* Status Messages */}
          {smsStatus === 'success' && (
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle size={18} className="text-green-600 dark:text-green-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Mensagens Enviadas!</h4>
                <p className="text-xs text-green-700 dark:text-green-300">{smsMessage}</p>
              </div>
            </div>
          )}

          {smsStatus === 'error' && (
            <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Erro no Envio</h4>
                <p className="text-xs text-red-700 dark:text-red-300">{smsMessage}</p>
              </div>
            </div>
          )}

          {/* Target Contacts Info */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center mb-1">
              <Users size={14} className="text-green-600 dark:text-green-400 mr-2" />
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                Grupo: {getGroups().find(g => g.id === campaign?.defaultGroupId)?.name || 'Grupo Padrão'}
              </h4>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              <strong>{targetContacts.filter(c => c.phone).length} contatos</strong> com telefone receberão a mensagem personalizada.
            </p>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Mensagem (ZenVia)
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setSmsProvider('sms')}
                className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                  smsProvider === 'sms'
                    ? 'bg-[#073143]/10 dark:bg-[#073143]/20 border-[#073143] dark:border-[#073143] text-[#073143] dark:text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Smartphone size={16} className="mr-2" />
                SMS
              </button>
              <button
                type="button"
                onClick={() => setSmsProvider('whatsapp')}
                className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                  smsProvider === 'whatsapp'
                    ? 'bg-[#073143]/10 dark:bg-[#073143]/20 border-[#073143] dark:border-[#073143] text-[#073143] dark:text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <MessageCircle size={16} className="mr-2" />
                WhatsApp
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Message configuration */}
            <div className="space-y-4">
              {/* Message Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Conteúdo da Mensagem
                </label>
                <textarea
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm"
                  rows={8}
                  placeholder={`Digite o conteúdo da mensagem ${smsProvider.toUpperCase()}`}
                  disabled={smsStatus === 'sending'}
                  maxLength={smsProvider === 'sms' ? 160 : 1000}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {smsBody.length}/{smsProvider === 'sms' ? '160' : '1000'} caracteres
                  </p>
                  {smsProvider === 'sms' && smsBody.length > 160 && (
                    <p className="text-xs text-red-500">
                      Mensagem muito longa para SMS
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Selector for Preview */}
              {targetContacts.filter(c => c.phone).length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visualizar como:
                  </label>
                  <select
                    value={previewContact?.id || ''}
                    onChange={(e) => {
                      const contact = targetContacts.find(c => c.id === e.target.value);
                      setPreviewContact(contact);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {targetContacts.filter(c => c.phone).map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Personalization Variables */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Variáveis Disponíveis:
                </h4>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{nome}}'}</code>
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{telefone}}'}</code>
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{empresa}}'}</code>
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{cargo}}'}</code>
                  <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{'{{link_pesquisa}}'}</code>
                </div>
              </div>

              {/* SMS/WhatsApp Info */}
              <div className={`p-3 rounded-lg border ${
                smsProvider === 'sms' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}>
                <h4 className={`text-xs font-medium mb-2 ${
                  smsProvider === 'sms' 
                    ? 'text-blue-800 dark:text-blue-200'
                    : 'text-green-800 dark:text-green-200'
                }`}>
                  Informações sobre {smsProvider.toUpperCase()}:
                </h4>
                <ul className={`text-xs space-y-1 ${
                  smsProvider === 'sms' 
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-green-700 dark:text-green-300'
                }`}>
                  {smsProvider === 'sms' ? (
                    <>
                      <li>• Limite de 160 caracteres por mensagem</li>
                      <li>• Entrega rápida e confiável</li>
                      <li>• Funciona em qualquer celular</li>
                    </>
                  ) : (
                    <>
                      <li>• Limite de 1000 caracteres por mensagem</li>
                      <li>• Suporte a emojis e formatação</li>
                      <li>• Requer WhatsApp instalado</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preview da Mensagem
                </h4>
                {previewContact && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Visualizando como: {previewContact.name}
                  </div>
                )}
              </div>

              {/* Message Preview Container */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                {/* Message Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-12">Para:</span>
                      <span className="text-gray-900 dark:text-white">
                        {previewContact ? `${previewContact.name} (${previewContact.phone})` : 'Contato não selecionado'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-12">Via:</span>
                      <span className="text-gray-900 dark:text-white">
                        ZenVia {smsProvider.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Content Preview */}
                <div className="p-4">
                  {previewContact ? (
                    <div className={`p-3 rounded-lg ${
                      smsProvider === 'sms' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                        {personalizeContent(smsBody, previewContact)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      Selecione um contato para visualizar o preview
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {previewContact && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-xs font-medium text-green-800 dark:text-green-200 mb-2">
                    Dados do Contato:
                  </h4>
                  <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
                    <div><strong>Nome:</strong> {previewContact.name}</div>
                    <div><strong>Telefone:</strong> {previewContact.phone}</div>
                    {previewContact.company && <div><strong>Empresa:</strong> {previewContact.company}</div>}
                    {previewContact.position && <div><strong>Cargo:</strong> {previewContact.position}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warning if no contacts with phone */}
          {targetContacts.filter(c => c.phone).length === 0 && (
            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Nenhum Contato com Telefone</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Adicione números de telefone aos contatos do grupo desta campanha primeiro.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default CampaignDashboard;