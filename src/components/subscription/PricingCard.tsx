import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { StripeProduct, formatPrice } from '../../stripe-config'
import { supabase } from '../../lib/supabase'

interface PricingCardProps {
  product: StripeProduct
  isPopular?: boolean
  currentPlan?: StripeProduct | null
}

export function PricingCard({ product, isPopular = false, currentPlan }: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const isCurrentPlan = currentPlan?.priceId === product.priceId

  const handleSubscribe = async () => {
    setLoading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const features = getFeaturesByPlan(product.name)

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
      isPopular ? 'border-blue-500 scale-105' : 'border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Mais Popular
          </span>
        </div>
      )}
      
      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        <div className="mb-8">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-gray-600 ml-2">/mês</span>
        </div>
        
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          onClick={handleSubscribe}
          loading={loading}
          disabled={isCurrentPlan}
          variant={isPopular ? 'primary' : 'outline'}
          className="w-full"
        >
          {isCurrentPlan ? 'Plano Atual' : 'Assinar Agora'}
        </Button>
      </div>
    </div>
  )
}

function getFeaturesByPlan(planName: string): string[] {
  const features = {
    'Meu NPS - Iniciante': [
      'Até 100 pesquisas por mês',
      'Dashboard básico',
      'Relatórios simples',
      'Suporte por email',
      '1 usuário'
    ],
    'Meu NPS - Profissional': [
      'Até 1.000 pesquisas por mês',
      'Dashboard avançado',
      'Relatórios detalhados',
      'Suporte prioritário',
      'Até 5 usuários',
      'Integração com APIs',
      'Segmentação avançada'
    ],
    'Meu NPS - Empresarial': [
      'Pesquisas ilimitadas',
      'Dashboard personalizado',
      'Relatórios customizados',
      'Suporte dedicado',
      'Usuários ilimitados',
      'Integrações completas',
      'White label',
      'SLA garantido',
      'Consultoria especializada'
    ]
  }
  
  return features[planName as keyof typeof features] || []
}