import React from 'react'
import { PricingCard } from '../components/subscription/PricingCard'
import { STRIPE_PRODUCTS } from '../stripe-config'
import { useSubscription } from '../hooks/useSubscription'

export function Pricing() {
  const { plan: currentPlan } = useSubscription()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Escolha o plano ideal para você
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Comece a medir a satisfação dos seus clientes hoje mesmo
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          {STRIPE_PRODUCTS.map((product, index) => (
            <PricingCard
              key={product.id}
              product={product}
              isPopular={index === 1} // Middle plan is popular
              currentPlan={currentPlan}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Todos os planos incluem suporte técnico e atualizações gratuitas.
          </p>
          <p className="text-gray-600 mt-2">
            Cancele a qualquer momento, sem taxas de cancelamento.
          </p>
        </div>
      </div>
    </div>
  )
}