import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Campaign, Contact } from '../types';
import { getCampaigns, getContacts, getGroups } from '../utils/supabaseStorage';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { ChevronLeft, Copy, Link as LinkIcon, QrCode, Mail, Users, Send, Check, AlertCircle, X, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CampaignShare: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingTotal, setSendingTotal] = useState(0);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    const loadCampaign = async () => {
      const campaigns = await getCampaigns();
      const foundCampaign = campaigns.find(c => c.id === id);
      setCampaign(foundCampaign || null);
      
      // Load contacts and groups
      const loadedContacts = await getContacts();
      const loadedGroups = await getGroups();
      
      setContacts(loadedContacts);
      setGroups(loadedGroups);
      
      // Set default email content
      if (foundCampaign) {
        setEmailSubject(`Pesquisa de Satisfação - ${foundCampaign.name}`);
        setEmailBody('Olá {{nome}},\n\nGostaríamos de convidar você a participar de nossa pesquisa de satisfação "{{campanha}}".\n\nSua opinião é muito importante para nós e nos ajudará a melhorar nossos produtos e serviços.\n\nPara participar, basta clicar no link abaixo:\n{{link_pesquisa}}\n\nA pesquisa leva apenas alguns minutos para ser concluída.\n\nAgradecemos sua participação!');
      }
    };

    loadCampaign();
  }, [id]);

  useEffect(() => {
    if (selectedGroupId) {
      // Filter contacts by selected group
      const groupContacts = contacts.filter(contact => 
        contact.groupIds.includes(selectedGroupId)
      );
      setSelectedContacts(groupContacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  }, [selectedGroupId, contacts]);

  const surveyUrl = `${window.location.origin}/survey/${id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const personalizeContent = (content: string, contact: any): string => {
    if (!contact) return content;
    
    const surveyLink = `${window.location.origin}/survey/${id}`;
    
    return content
      .replace(/\{\{nome\}\}/g, contact.name)
      .replace(/\{\{email\}\}/g, contact.email)
      .replace(/\{\{telefone\}\}/g, contact.phone || '')
      .replace(/\{\{empresa\}\}/g, contact.company || '')
      .replace(/\{\{cargo\}\}/g, contact.position || '')
      .replace(/\{\{campanha\}\}/g, campaign?.name || '')
      .replace(/\{\{link_pesquisa\}\}/g, surveyLink);
  };

  const handleSendEmails = async () => {
    if (!campaign || selectedContacts.length === 0) return;
    
    try {
      setIsSending(true);
      setSendingStatus('sending');
      setSendingTotal(selectedContacts.length);
      setSendingProgress(0);
    
      // Get selected contacts
      const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id));
      
      // Create email queue
      const emailQueue = selectedContactsData.map(contact => {
        // Personalize email content
        const personalizedSubject = personalizeContent(emailSubject, contact);
        const personalizedBody = personalizeContent(emailBody, contact);
        
        return {
          to: contact.email,
          subject: personalizedSubject,
          body: personalizedBody,
          contactId: contact.id,
          campaignId: campaign.id
        };
      });
      
      // Process queue with batching (5 at a time)
      const batchSize = 5;
      let processed = 0;

      for (let i = 0; i < emailQueue.length; i += batchSize) {
        const batch = emailQueue.slice(i, i + batchSize);
        
        // Process batch in parallel
        await Promise.all(batch.map(async (email) => {
          try {
            // In a real implementation, this would call your email sending service
            // For now, we'll simulate sending by adding to a queue in Supabase
            const { error } = await supabase.from('email_queue').insert({
              campaign_id: email.campaignId,
              contact_id: email.contactId,
              subject: email.subject,
              body: email.body,
              status: 'pending',
              created_at: new Date().toISOString()
            });
            
            if (error) throw error;
            
            // Update progress
            processed++;
            setSendingProgress(processed);
          } catch (error) {
            console.error('Error queueing email:', error);
            // Continue with other emails even if one fails
          }
        }));
        
        // Small delay between batches to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setSendingStatus('success');
    } catch (error) {
      console.error('Error sending emails:', error);
      setSendingStatus('error');
      setErrorMessage(error.message || 'Erro ao enviar emails');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(cid => cid !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedGroupId) {
      const groupContacts = contacts.filter(contact => 
        contact.groupIds.includes(selectedGroupId)
      );
      
      if (selectedContacts.length === groupContacts.length) {
        // Deselect all
        setSelectedContacts([]);
      } else {
        // Select all
        setSelectedContacts(groupContacts.map(c => c.id));
      }
    } else {
      if (selectedContacts.length === contacts.length) {
        // Deselect all
        setSelectedContacts([]);
      } else {
        // Select all
        setSelectedContacts(contacts.map(c => c.id));
      }
    }
  };

  const getContactsForPreview = () => {
    if (selectedGroupId) {
      return contacts.filter(contact => 
        contact.groupIds.includes(selectedGroupId)
      );
    }
    return contacts;
  };

  if (!campaign) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073143]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link to={`/campaigns/${id}`}>
          <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
            Voltar à Campanha
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compartilhar {campaign.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Compartilhe sua pesquisa NPS com clientes usando estes métodos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Link Direto" />
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
              <code className="text-sm break-all text-gray-900 dark:text-white">{surveyUrl}</code>
            </div>
            <Button
              variant="outline"
              fullWidth
              icon={copied ? undefined : <Copy size={16} />}
              onClick={handleCopyLink}
            >
              {copied ? 'Copiado!' : 'Copiar Link'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Código de Incorporação" />
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4 font-mono text-sm text-gray-900 dark:text-white">
              {`<iframe src="${surveyUrl}" width="100%" height="600" frameborder="0"></iframe>`}
            </div>
            <Button
              variant="outline"
              fullWidth
              icon={<LinkIcon size={16} />}
              onClick={() => {
                navigator.clipboard.writeText(
                  `<iframe src="${surveyUrl}" width="100%" height="600" frameborder="0"></iframe>`
                );
              }}
            >
              Copiar Código
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Compartilhar por E-mail" />
          <CardContent>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Envie a pesquisa por e-mail para seus contatos
              </p>
              <Button
                variant="outline"
                icon={<Mail size={16} />}
                onClick={() => setEmailModalOpen(true)}
              >
                Preparar E-mail
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader title="Código QR" />
          <CardContent>
            <div className="text-center">
              <Button
                variant="outline"
                icon={<QrCode size={16} />}
                onClick={() => setQrVisible(!qrVisible)}
              >
                {qrVisible ? 'Ocultar QR Code' : 'Mostrar QR Code'}
              </Button>
              {qrVisible && (
                <div className="mt-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      surveyUrl
                    )}`}
                    alt="QR Code da Pesquisa"
                    className="mx-auto"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Modal */}
      <Modal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Compartilhar por E-mail"
        size="xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setEmailModalOpen(false)}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendEmails}
              isLoading={isSending}
              disabled={selectedContacts.length === 0 || isSending || sendingStatus === 'success'}
              icon={<Send size={16} />}
            >
              {sendingStatus === 'success' ? 'Enviado' : `Enviar para ${selectedContacts.length} contatos`}
            </Button>
          </div>
        }
      >
        {sendingStatus === 'sending' && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-3"></div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Enviando e-mails...
              </h3>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${(sendingProgress / sendingTotal) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Enviando {sendingProgress} de {sendingTotal} e-mails
            </p>
          </div>
        )}

        {sendingStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <Check size={20} className="text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  E-mails enviados com sucesso!
                </h3>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {sendingTotal} e-mails foram adicionados à fila de envio e serão processados em breve.
                </p>
              </div>
            </div>
          </div>
        )}

        {sendingStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erro ao enviar e-mails
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {errorMessage || 'Ocorreu um erro ao enviar os e-mails. Tente novamente.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por Grupo (Opcional)
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isSending || sendingStatus === 'success'}
            >
              <option value="">Todos os contatos</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Selecionar Contatos
              </label>
              <button
                type="button"
                onClick={handleSelectAllContacts}
                className="text-sm text-[#073143] hover:text-[#0a4a5c] dark:text-[#4a9eff]"
                disabled={isSending || sendingStatus === 'success'}
              >
                {selectedContacts.length === getContactsForPreview().length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
              {getContactsForPreview().length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Nenhum contato encontrado
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {getContactsForPreview().map(contact => (
                    <div 
                      key={contact.id} 
                      className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleToggleContact(contact.id)}
                        className="w-4 h-4 text-[#073143] border-gray-300 rounded focus:ring-[#073143]"
                        disabled={isSending || sendingStatus === 'success'}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{contact.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {selectedContacts.length} contatos selecionados
            </p>
          </div>

          {/* Email Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assunto do E-mail
            </label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Assunto do e-mail"
              fullWidth
              disabled={isSending || sendingStatus === 'success'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conteúdo do E-mail
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Conteúdo do e-mail"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={10}
              disabled={isSending || sendingStatus === 'success'}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Você pode usar as seguintes variáveis: <code>{{nome}}</code>, <code>{{email}}</code>, <code>{{link_pesquisa}}</code>
            </p>
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pré-visualização
              </label>
              <Link 
                to={`/email-preview/${id}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}&type=text`} 
                target="_blank"
                className="text-sm text-[#073143] hover:text-[#0a4a5c] dark:text-[#4a9eff] flex items-center"
              >
                <Eye size={14} className="mr-1" />
                Visualizar em nova aba
              </Link>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {emailSubject
                  .replace(/\{\{nome\}\}/g, 'Nome do Contato')
                  .replace(/\{\{email\}\}/g, 'email@exemplo.com')
                  .replace(/\{\{campanha\}\}/g, campaign.name)
                  .replace(/\{\{link_pesquisa\}\}/g, surveyUrl)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {emailBody
                  .replace(/\{\{nome\}\}/g, 'Nome do Contato')
                  .replace(/\{\{email\}\}/g, 'email@exemplo.com')
                  .replace(/\{\{campanha\}\}/g, campaign.name)
                  .replace(/\{\{link_pesquisa\}\}/g, surveyUrl)}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CampaignShare;