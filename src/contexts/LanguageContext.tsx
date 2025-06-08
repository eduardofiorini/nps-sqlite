import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'pt-BR';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'NPS Campaigns',
    'dashboard.subtitle': 'Monitor and manage your NPS campaigns',
    'dashboard.newCampaign': 'New Campaign',
    'dashboard.noCampaigns': 'No campaigns yet',
    'dashboard.noCampaignsDesc': 'Create your first NPS campaign to start collecting customer feedback.',
    'dashboard.createCampaign': 'Create Campaign',
    
    // Campaign
    'campaign.active': 'Active',
    'campaign.inactive': 'Inactive',
    'campaign.dashboard': 'Dashboard',
    'campaign.edit': 'Edit',
    'campaign.responses': 'View Responses',
    'campaign.editForm': 'Edit Form',
    'campaign.share': 'Share Survey',
    'campaign.noResponses': 'No responses yet',
    'campaign.noResponsesDesc': 'Share your NPS survey with customers to start collecting feedback.',
    'campaign.currentNps': 'Current NPS Score',
    'campaign.npsTrend': 'NPS Trend',
    'campaign.responseDistribution': 'Response Distribution',
    'campaign.latestResponses': 'Latest Responses',
    'campaign.detractors': 'Detractors',
    'campaign.passives': 'Passives',
    'campaign.promoters': 'Promoters',
    'campaign.viewAll': 'View All',
    
    // Settings
    'settings.title': 'Settings',
    'settings.appConfig': 'App Configuration',
    'settings.dataManagement': 'Data Management',
    'settings.themeColor': 'Theme Color',
    'settings.logoUrl': 'Logo URL (Optional)',
    'settings.defaultEmail': 'Default Email',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.sources': 'Sources',
    'settings.situations': 'Situations',
    'settings.groups': 'Groups',
    'settings.sourcesDesc': 'Manage sources where customer feedback comes from',
    'settings.situationsDesc': 'Manage possible statuses for NPS responses',
    'settings.groupsDesc': 'Manage customer groups for segmentation',
    'settings.saveSettings': 'Save Settings',
    'settings.saved': 'Settings saved successfully',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.back': 'Back',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.color': 'Color',
    'common.actions': 'Actions',
    'common.required': 'Required',
    'common.optional': 'Optional',
    'common.confirm': 'Confirm',
    'common.warning': 'Warning',
    
    // Login
    'login.title': 'NPS Master',
    'login.subtitle': 'Sign in to your account',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.signIn': 'Sign in',
    'login.demo': 'For demo purposes, enter any email and password',
    
    // Survey
    'survey.notFound': 'Survey Not Found',
    'survey.notFoundDesc': 'This survey may have been removed or is no longer active.',
    'survey.thankYou': 'Thank You!',
    'survey.submitted': 'Your feedback has been submitted successfully. We appreciate your input!',
    'survey.notLikely': 'Not likely at all',
    'survey.extremelyLikely': 'Extremely likely',
    'survey.submitFeedback': 'Submit Feedback',
  },
  'pt-BR': {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Configurações',
    'nav.logout': 'Sair',
    
    // Dashboard
    'dashboard.title': 'Campanhas NPS',
    'dashboard.subtitle': 'Monitore e gerencie suas campanhas NPS',
    'dashboard.newCampaign': 'Nova Campanha',
    'dashboard.noCampaigns': 'Nenhuma campanha ainda',
    'dashboard.noCampaignsDesc': 'Crie sua primeira campanha NPS para começar a coletar feedback dos clientes.',
    'dashboard.createCampaign': 'Criar Campanha',
    
    // Campaign
    'campaign.active': 'Ativa',
    'campaign.inactive': 'Inativa',
    'campaign.dashboard': 'Dashboard',
    'campaign.edit': 'Editar',
    'campaign.responses': 'Ver Respostas',
    'campaign.editForm': 'Editar Formulário',
    'campaign.share': 'Compartilhar Pesquisa',
    'campaign.noResponses': 'Nenhuma resposta ainda',
    'campaign.noResponsesDesc': 'Compartilhe sua pesquisa NPS com clientes para começar a coletar feedback.',
    'campaign.currentNps': 'Pontuação NPS Atual',
    'campaign.npsTrend': 'Tendência NPS',
    'campaign.responseDistribution': 'Distribuição de Respostas',
    'campaign.latestResponses': 'Últimas Respostas',
    'campaign.detractors': 'Detratores',
    'campaign.passives': 'Neutros',
    'campaign.promoters': 'Promotores',
    'campaign.viewAll': 'Ver Todos',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.appConfig': 'Configuração do App',
    'settings.dataManagement': 'Gerenciamento de Dados',
    'settings.themeColor': 'Cor do Tema',
    'settings.logoUrl': 'URL do Logo (Opcional)',
    'settings.defaultEmail': 'Email Padrão',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.light': 'Claro',
    'settings.dark': 'Escuro',
    'settings.sources': 'Fontes',
    'settings.situations': 'Situações',
    'settings.groups': 'Grupos',
    'settings.sourcesDesc': 'Gerencie fontes de onde vem o feedback dos clientes',
    'settings.situationsDesc': 'Gerencie possíveis status para respostas NPS',
    'settings.groupsDesc': 'Gerencie grupos de clientes para segmentação',
    'settings.saveSettings': 'Salvar Configurações',
    'settings.saved': 'Configurações salvas com sucesso',
    
    // Common
    'common.loading': 'Carregando...',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.add': 'Adicionar',
    'common.back': 'Voltar',
    'common.name': 'Nome',
    'common.description': 'Descrição',
    'common.color': 'Cor',
    'common.actions': 'Ações',
    'common.required': 'Obrigatório',
    'common.optional': 'Opcional',
    'common.confirm': 'Confirmar',
    'common.warning': 'Aviso',
    
    // Login
    'login.title': 'NPS Master',
    'login.subtitle': 'Entre na sua conta',
    'login.email': 'Endereço de Email',
    'login.password': 'Senha',
    'login.signIn': 'Entrar',
    'login.demo': 'Para demonstração, digite qualquer email e senha',
    
    // Survey
    'survey.notFound': 'Pesquisa Não Encontrada',
    'survey.notFoundDesc': 'Esta pesquisa pode ter sido removida ou não está mais ativa.',
    'survey.thankYou': 'Obrigado!',
    'survey.submitted': 'Seu feedback foi enviado com sucesso. Agradecemos sua contribuição!',
    'survey.notLikely': 'Nada provável',
    'survey.extremelyLikely': 'Extremamente provável',
    'survey.submitFeedback': 'Enviar Feedback',
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};