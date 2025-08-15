export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  features: string[];
  popular?: boolean;
  color: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SepSP5opHKX1bn',
    priceId: 'price_1RjVnGJwPeWVIUa99CJNK4I4',
    name: 'Meu NPS - Iniciante',
    description: 'Perfeito para pequenas equipes começando com NPS',
    mode: 'subscription',
    price: 49.00,
    currency: 'BRL',
    interval: 'month',
    color: 'bg-green-500',
    features: [
      'Até 500 respostas/mês',
      '2 campanhas ativas',
      'Análises básicas',
      'Suporte por email',
      'Templates padrão'
    ]
  },
  {
    id: 'prod_SepTpOOlWoAQVJ',
    priceId: 'price_1RjVoIJwPeWVIUa9puy9krkj',
    name: 'Meu NPS - Profissional',
    description: 'Recursos avançados para empresas em crescimento',
    mode: 'subscription',
    price: 99.00,
    currency: 'BRL',
    interval: 'month',
    color: 'bg-[#00ac75]',
    popular: true,
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
    id: 'prod_SepUQbVbq2G9Ww',
    priceId: 'price_1RjVpRJwPeWVIUa9ECuvA3FX',
    name: 'Meu NPS - Empresarial',
    description: 'Solução completa para grandes organizações',
    mode: 'subscription',
    price: 249.00,
    currency: 'BRL',
    interval: 'month',
    color: 'bg-purple-500',
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
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (productId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === productId);
};