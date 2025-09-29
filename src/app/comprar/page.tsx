'use client'

import { useState } from 'react'

export default function ComprarPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function buyCredits(pkg: 'p1' | 'p5' | 'p10') {
    try {
      setLoading(pkg)
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageKey: pkg }),
      })

      const data = await res.json()
      console.log('Resposta do servidor:', data)

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl // redireciona para o checkout do Asaas
      } else {
        alert('Erro: ' + (data.error || data.warning))
      }
    } catch (err) {
      console.error(err)
      alert('Falha inesperada ao criar pagamento')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Comprar Créditos</h1>

      <button
        onClick={() => buyCredits('p1')}
        disabled={loading !== null}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading === 'p1' ? 'Carregando...' : 'Pacote 1 crédito (R$ 9,90)'}
      </button>

      <button
        onClick={() => buyCredits('p5')}
        disabled={loading !== null}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading === 'p5' ? 'Carregando...' : 'Pacote 5 créditos (R$ 39,90)'}
      </button>

      <button
        onClick={() => buyCredits('p10')}
        disabled={loading !== null}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        {loading === 'p10' ? 'Carregando...' : 'Pacote 10 créditos (R$ 69,90)'}
      </button>
    </div>
  )
}
