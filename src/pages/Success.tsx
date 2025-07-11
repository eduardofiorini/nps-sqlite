import React, { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function Success() {
  useEffect(() => {
    // Clear any checkout-related data from localStorage if needed
    localStorage.removeItem('checkout_session_id')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pagamento Realizado com Sucesso!
          </h2>
          
          <p className="text-gray-600 mb-8">
            Sua assinatura foi ativada e você já pode começar a usar todos os recursos
            do seu plano. Bem-vindo ao Meu NPS!
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
            >
              Ir para o Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/pricing'}
              className="w-full"
            >
              Ver Planos
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Você receberá um email de confirmação em breve com os detalhes da sua assinatura.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}