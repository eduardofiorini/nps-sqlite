export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
  features?: string[];
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_Starter',
    priceId: 'price_starter',
    name: 'Meu NPS - Empresarial',
    description: 'Solução completa para grandes organizações',
    mode: 'subscription',
    price: 24900, // R$249.00 in cents
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
    description: 'Recursos avançados para empresas em crescimento',
    mode: 'subscription',
    price: 9900, // R$99.00 in cents
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
    description: 'Perfeito para pequenas equipes começando com NPS',
    mode: 'subscription',
    price: 4900, // R$49.00 in cents
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
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
}

export function formatPrice(price: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(price / 100);
}