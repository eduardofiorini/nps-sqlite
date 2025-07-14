import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getCampaigns, getContacts } from '../utils/localStorage';
import { Campaign } from '../types';
import { ArrowLeft, User, Mail, Phone, Building, Briefcase } from 'lucide-react';

const EmailPreview: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailType, setEmailType] = useState<'text' | 'html'>('html');

  useEffect(() => {
    if (!campaignId) return;

    // Load campaign
    const campaigns = getCampaigns();
    const foundCampaign = campaigns.find(c => c.id === campaignId);
    setCampaign(foundCampaign || null);

    // Initialize groupContacts as empty array
    let groupContacts: any[] = [];

    // Load contacts from campaign group
    if (foundCampaign?.defaultGroupId) {
      const allContacts = getContacts();
      groupContacts = allContacts.filter(contact => 
        contact.groupIds.includes(foundCampaign.defaultGroupId!)
      );
      setContacts(groupContacts);
      setSelectedContact(groupContacts[0] || null);
    }

    // Get email data from URL params
    const subject = searchParams.get('subject') || '';
    const body = searchParams.get('body') || '';
    const type = searchParams.get('type') as 'text' | 'html' || 'html';
    const contactId = searchParams.get('contactId');

    setEmailSubject(decodeURIComponent(subject));
    setEmailBody(decodeURIComponent(body));
    setEmailType(type);

    // Set specific contact if provided
    if (contactId && groupContacts.length > 0) {
      const contact = groupContacts.find(c => c.id === contactId) || groupContacts[0];
      setSelectedContact(contact);
    }
  }, [campaignId, searchParams]);

  const personalizeContent = (content: string, contact: any): string => {
    if (!contact) return content;
    
    const surveyLink = `${window.location.origin}/survey/${campaignId}`;
    
    return content
      .replace(/\{\{nome\}\}/g, contact.name)
      .replace(/\{\{email\}\}/g, contact.email)
      .replace(/\{\{telefone\}\}/g, contact.phone || '')
      .replace(/\{\{empresa\}\}/g, contact.company || '')
      .replace(/\{\{cargo\}\}/g, contact.position || '')
      .replace(/\{\{link_pesquisa\}\}/g, surveyLink);
  };

  if (!campaign || !selectedContact) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Preview não disponível
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Campanha ou contato não encontrado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.close()}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Fechar Preview
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Preview do E-mail
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Campanha: {campaign.name}
                </p>
              </div>
            </div>

            {/* Contact Selector */}
            {contacts.length > 1 && (
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visualizar como:
                </label>
                <select
                  value={selectedContact.id}
                  onChange={(e) => {
                    const contact = contacts.find(c => c.id === e.target.value);
                    setSelectedContact(contact);
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#073143] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} ({contact.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User size={20} className="mr-2" />
                Dados do Contato
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {selectedContact.name}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Mail size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedContact.email}
                  </span>
                </div>
                
                {selectedContact.phone && (
                  <div className="flex items-center text-sm">
                    <Phone size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedContact.phone}
                    </span>
                  </div>
                )}
                
                {selectedContact.company && (
                  <div className="flex items-center text-sm">
                    <Building size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedContact.company}
                    </span>
                  </div>
                )}
                
                {selectedContact.position && (
                  <div className="flex items-center text-sm">
                    <Briefcase size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedContact.position}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Variáveis Personalizadas:
                </h4>
                <div className="space-y-1 text-xs">
                  <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{{nome}}'}</code> → {selectedContact.name}</div>
                  <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{{email}}'}</code> → {selectedContact.email}</div>
                  {selectedContact.phone && (
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{{telefone}}'}</code> → {selectedContact.phone}</div>
                  )}
                  {selectedContact.company && (
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{{empresa}}'}</code> → {selectedContact.company}</div>
                  )}
                  {selectedContact.position && (
                    <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{{cargo}}'}</code> → {selectedContact.position}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Email Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">Para:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {selectedContact.name} &lt;{selectedContact.email}&gt;
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">Assunto:</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {personalizeContent(emailSubject, selectedContact)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">Tipo:</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {emailType.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Content */}
              <div className="p-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 min-h-[400px]">
                  {emailType === 'html' ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: personalizeContent(emailBody, selectedContact) 
                      }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {personalizeContent(emailBody, selectedContact)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;