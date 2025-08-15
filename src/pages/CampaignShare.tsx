import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Campaign, Contact, Group } from '../types';
import { getCampaigns, getContacts, getGroups, getAppConfig } from '../utils/supabaseStorage';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { 
  ChevronLeft, 
  Copy, 
  Link as LinkIcon, 
  QrCode, 
  Mail, 
  Send,
  Users,
  CheckSquare,
  Square,
  Eye,
  AlertCircle,
  CheckCircle,
  User,
  Building,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CampaignShare: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [copied, setCopied] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [includeLink, setIncludeLink] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      const campaigns = await getCampaigns();
      const foundCampaign = campaigns.find(c => c.id === id);
      setCampaign(foundCampaign || null);
      
      // Load contacts and groups
      const [contactsData, groupsData] = await Promise.all([
        getContacts(),
        getGroups()
      ]);
      
      setContacts(contactsData);
      setGroups(groupsData);
      setFilteredContacts(contactsData);
      
      // Check SMTP configuration
      try {
        const config = await getAppConfig();
        setSmtpConfigured(config.integrations?.smtp?.enabled || false);
      } catch (error) {
        console.error('Error checking SMTP config:', error);
        setSmtpConfigured(false);
      }
      
      // Set default email content
      if (foundCampaign) {
        setEmailSubject(`Pesquisa de Satisfação - ${foundCampaign.name}`);
        setEmailMessage(`Olá {{nome}},

Gostaríamos de conhecer sua opinião sobre nossos serviços.

Sua participação é muito importante para nós e nos ajuda a melhorar continuamente.

A pesquisa leva apenas alguns minutos para ser respondida.

Atenciosamente,
Equipe ${foundCampaign.name}`);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    // Filter contacts by selected group
    if (selectedGroup === 'all') {
      setFilteredContacts(contacts);
    } else {
      setFilteredContacts(contacts.filter(contact => 
        contact.groupIds.includes(selectedGroup)
      ));
    }
    
    // Clear selected contacts when group changes
    setSelectedContacts([]);
  }, [selectedGroup, contacts]);

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

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleSendEmails = async () => {
    if (selectedContacts.length === 0) {
      alert('Selecione pelo menos um contato para enviar o email');
      return;
    }

    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert('Assunto e mensagem são obrigatórios');
      return;
    }

    setIsSending(true);
    setSendResults(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-campaign-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId: id,
          contactIds: selectedContacts,
          subject: emailSubject,
          message: emailMessage,
          includeLink
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Falha ao enviar emails');
      }

      setSendResults(result);
      setShowResults(true);
      setShowEmailModal(false);
      
      // Reset form
      setSelectedContacts([]);
      
    } catch (error) {
      console.error('Error sending emails:', error);
      alert(`Erro ao enviar emails: ${error.message}`);
    } finally {
      setIsSending(false);
    }
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
          <CardHeader title="Enviar por Email" />
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Envie o link da pesquisa diretamente para seus contatos por email
              </p>
              
              {!smtpConfigured && (
                <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 mr-2" />
                  <div className="text-sm">
                    <span className="text-yellow-800 dark:text-yellow-200">
                      Configure o SMTP nas{' '}
                      <Link to="/settings" className="underline font-medium">
                        configurações
                      </Link>
                      {' '}para enviar emails
                    </span>
                  </div>
                </div>
              )}
              
              <Button
                variant="primary"
                fullWidth
                icon={<Mail size={16} />}
                onClick={() => setShowEmailModal(true)}
                disabled={!smtpConfigured}
              >
                Enviar por Email
              </Button>
            </div>
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
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Enviar Pesquisa por Email"
        size="xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendEmails}
              isLoading={isSending}
              disabled={selectedContacts.length === 0}
              icon={<Send size={16} />}
            >
              Enviar para {selectedContacts.length} contato{selectedContacts.length !== 1 ? 's' : ''}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Email Content */}
          <div className="space-y-4">
            <Input
              label="Assunto do Email"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Assunto do email"
              fullWidth
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensagem
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={6}
                placeholder="Digite sua mensagem personalizada"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {'Use variáveis: {{nome}}, {{email}}, {{empresa}}, {{cargo}}, {{campanha}}, {{link_pesquisa}}'}
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="include-link"
                checked={includeLink}
                onChange={(e) => setIncludeLink(e.target.checked)}
                className="w-4 h-4 text-[#00ac75] border-gray-300 rounded focus:ring-[#00ac75]"
              />
              <label htmlFor="include-link" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Incluir botão de link da pesquisa no email
              </label>
            </div>
          </div>

          {/* Contact Selection */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Selecionar Contatos
              </h3>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ac75] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">Todos os grupos</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllContacts}
                  icon={selectedContacts.length === filteredContacts.length ? <Square size={16} /> : <CheckSquare size={16} />}
                >
                  {selectedContacts.length === filteredContacts.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
            </div>
            
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum contato encontrado</p>
                <Link to="/contacts" className="text-[#00ac75] hover:underline text-sm">
                  Adicionar contatos
                </Link>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                {filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <label className="flex items-center cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                        className="w-4 h-4 text-[#00ac75] border-gray-300 rounded focus:ring-[#00ac75]"
                      />
                      <div className="ml-3 flex items-center flex-1">
                        <div className="w-8 h-8 bg-[#00ac75] text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {contact.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {contact.email}
                            {contact.company && (
                              <>
                                <span className="mx-2">•</span>
                                <Building size={12} className="mr-1" />
                                {contact.company}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {selectedContacts.length} de {filteredContacts.length} contatos selecionados
            </div>
          </div>
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        title="Resultado do Envio"
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowResults(false)}>
              Fechar
            </Button>
          </div>
        }
      >
        {sendResults && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              sendResults.summary.failed === 0
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center">
                {sendResults.summary.failed === 0 ? (
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 mr-3" />
                ) : (
                  <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 mr-3" />
                )}
                <div>
                  <h4 className={`font-medium ${
                    sendResults.summary.failed === 0
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {sendResults.message}
                  </h4>
                  <p className={`text-sm ${
                    sendResults.summary.failed === 0
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {sendResults.summary.successful} enviados com sucesso, {sendResults.summary.failed} falharam
                  </p>
                </div>
              </div>
            </div>
            
            {/* Detailed Results */}
            <div className="max-h-64 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Detalhes do Envio:
              </h4>
              <div className="space-y-2">
                {sendResults.results.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400 mr-2" />
                      ) : (
                        <AlertCircle size={16} className="text-red-600 dark:text-red-400 mr-2" />
                      )}
                      <span className="text-sm text-gray-900 dark:text-white">
                        {result.contact}
                      </span>
                    </div>
                    {!result.success && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {result.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default CampaignShare;