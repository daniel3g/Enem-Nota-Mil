'use client';

import { useState } from 'react';

interface RedacaoFormProps {
  email: string;
}

const RedacaoForm = ({ email }: RedacaoFormProps) => {
  const [redaction, setRedaction] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const webhookUrl = 'https://workflows.guarumidia.com/webhook/47c137f1-3e87-4aed-acca-ec741a2c95a4';
    const payload = { email, redaction };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setResponseMessage('Redação enviada com sucesso!');
        setRedaction('');
      } else {
        throw new Error('Erro ao enviar redação');
      }
    } catch (error) {
      setResponseMessage('Erro ao enviar redação. Por favor, tente novamente.');
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
          className="w-full py-2 px-4 bg-customPurple text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Enviar Redação
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
