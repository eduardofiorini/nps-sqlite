import React from 'react'
import { Crown, AlertTriangle, CheckCircle } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { formatPrice } from '../../stripe-config'

export function SubscriptionStatus() {
  const { subscription, plan, isActive, isPastDue, isCanceled, loading } = useSubscription()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!subscription || !plan) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
        <Crown className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum plano ativo</h3>
        <p className="text-gray-600 mb-4">Escolha um plano para começar a usar o Meu NPS</p>
        <a
          href="/pricing"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Ver Planos
        </a>
      </div>
    )
  }

  const getStatusIcon = () => {
    if (isActive) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (isPastDue || isCanceled) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <Crown className="h-5 w-5 text-blue-500" />
  }

  const getStatusText = () => {
    if (isActive) return 'Ativo'
    if (isPastDue) return 'Pagamento em atraso'
    if (isCanceled) return 'Cancelado'
    return subscription.subscription_status
  }

  const getStatusColor = () => {
    if (isActive) return 'text-green-600 bg-green-50 border-green-200'
    if (isPastDue || isCanceled) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {getStatusIcon()}
          <h3 className="ml-2 text-lg font-medium text-gray-900">
            {plan.name}
          </h3>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Valor:</span> {formatPrice(plan.price)}/mês
        </p>
        
        {subscription.current_period_end && (
          <p>
            <span className="font-medium">
              {subscription.cancel_at_period_end ? 'Expira em:' : 'Próxima cobrança:'}
            </span>{' '}
            {new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR')}
          </p>
        )}
        
        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <p>
            <span className="font-medium">Cartão:</span>{' '}
            {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
          </p>
        )}
      </div>
      
      {subscription.cancel_at_period_end && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Sua assinatura será cancelada no final do período atual.
          </p>
        </div>
      )}
    </div>
  )
}