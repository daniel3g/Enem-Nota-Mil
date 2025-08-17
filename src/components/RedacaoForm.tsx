'use client';

import { useState } from 'react';

interface RedacaoFormProps {
  email: string; // não é mais necessário, mas mantive compatível
}

const RedacaoForm = ({ email }: RedacaoFormProps) => {
  const [redaction, setRedaction] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResponseMessage('');
    if (!redaction.trim()) {
      setResponseMessage('Digite o conteúdo da redação.');
      return;
    }

    setBusy(true);
    try {
      // Agora chamamos a sua API interna: debita 1 crédito + cria 'queued' + envia ao n8n
      const res = await fetch('/api/essays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: null,
          content: redaction,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResponseMessage(data?.error || 'Erro ao enviar redação.');
      } else {
        setResponseMessage('Redação enviada com sucesso!');
        setRedaction('');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('credits:changed'));
        }
      }
    } catch {
      setResponseMessage('Erro ao enviar redação. Por favor, tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-md shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Escreva sua Redação</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            name="redaction"
            id="redaction"
            value={redaction}
            onChange={(e) => setRedaction(e.target.value)}
            required
            rows={20}
            placeholder="Digite aqui sua redação..."
            className="w-full resize-none p-4 text-gray-800 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={busy || !redaction.trim()}
          className="w-full py-2 px-4 bg-customPurple text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {busy ? 'Enviando…' : 'Enviar Redação (–1 crédito)'}
        </button>
      </form>
      {responseMessage && (
        <p className={`mt-4 text-center ${responseMessage.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
          {responseMessage}
        </p>
      )}
    </div>
  );
};

export default RedacaoForm;
