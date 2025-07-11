export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SepUQbVbq2G9Ww',
    priceId: 'price_1RjVpRJwPeWVIUa9ECuvA3FX',
    name: 'Meu NPS - Empresarial',
    description: 'Solução completa para grandes organizações',
    mode: 'subscription',
    price: 24900, // R$249.00 in cents
    currency: 'BRL'
  },
  {
    id: 'prod_SepTpOOlWoAQVJ',
    priceId: 'price_1RjVoIJwPeWVIUa9puy9krkj',
    name: 'Meu NPS - Profissional',
    description: 'Recursos avançados para empresas em crescimento',
    mode: 'subscription',
    price: 9900, // R$99.00 in cents
    currency: 'BRL'
  },
  {
    id: 'prod_SepSP5opHKX1bn',
    priceId: 'price_1RjVnGJwPeWVIUa99CJNK4I4',
    name: 'Meu NPS - Iniciante',
    description: 'Perfeito para pequenas equipes começando com NPS',
    mode: 'subscription',
    price: 4900, // R$49.00 in cents
    currency: 'BRL'
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