export interface StripeProduct {
  id: string;
  priceId: string;
  price: number;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  currency: string;
  features?: string[];
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_Enterprise',
    priceId: 'price_enterprise',
    name: 'Meu NPS - Empresarial',
    price: 24900, // R$249.00 in cents
    description: 'Solução completa para grandes organizações',
    mode: 'subscription',
    currency: 'BRL',
    features: [
      'Respostas ilimitadas',
      'Campanhas ilimitadas',
      'Insights avançados com IA',
      'Gerente de conta dedicado',
      'Solução white-label',
      'Integração SSO',
      'Integrações personalizadas',
      'Garantia de SLA'
    ]
  },
  {
    id: 'prod_Pro',
    priceId: 'price_pro',
    name: 'Meu NPS - Profissional',
    price: 9900, // R$99.00 in cents
    description: 'Recursos avançados para empresas em crescimento',
    mode: 'subscription',
    currency: 'BRL',
    features: [
      'Até 2.500 respostas/mês',
      'Campanhas ilimitadas',
      'Análises e relatórios avançados',
      'Suporte prioritário',
      'Marca personalizada',
      'Acesso à API',
      'Colaboração em equipe'
    ]
  },
  {
    id: 'prod_Starter',
    priceId: 'price_starter',
    name: 'Meu NPS - Iniciante',
    price: 4900, // R$49.00 in cents
    description: 'Perfeito para pequenas equipes começando com NPS',
    mode: 'subscription',
    currency: 'BRL',
    features: [
      'Até 500 respostas/mês',
      '2 campanhas ativas',
      'Análises básicas',
      'Suporte por email',
      'Templates padrão'
    ]
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  if (!priceId) return undefined;
  
  // Try to find an exact match first
  const exactMatch = STRIPE_PRODUCTS.find(product => product.priceId === priceId);
  if (exactMatch) return exactMatch;
  
  // If no exact match, try to find a partial match (for demo mode)
  const partialMatch = STRIPE_PRODUCTS.find(product => 
    priceId.includes(product.priceId) || 
    product.priceId.includes(priceId) ||
    priceId.includes(product.id.toLowerCase())
  );
  
  return partialMatch;
}

export function formatPrice(price: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(price / 100);
}