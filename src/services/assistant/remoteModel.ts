import { AIModel } from '@/src/services/aiModelService';

type PreferredModel = 'gpt-4o' | 'claude-3.5-haiku' | 'auto';

export class RemoteAIModel implements AIModel {
  private readonly baseUrl: string;
  private readonly preferredModel: PreferredModel;

  constructor(preferredModel: PreferredModel = 'auto') {
    const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    // Fallback to same-origin in preview/prod
    this.baseUrl = envBase || '';
    this.preferredModel = preferredModel;
  }

  async sendMessage(prompt: string) {
    try {
      const res = await fetch(`${this.baseUrl}/assistant/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelPreference: this.preferredModel, max_tokens: 300 })
      });

      const data = await res.json().catch(() => null);
      if (res.ok) {
        const text: string = (data && data.text) || 'Desculpe, não consegui gerar uma resposta.';
        return { text: () => text };
      }
      // If server returned a fallback text, use it instead of generic error
      if (data && typeof data.text === 'string') {
        return { text: () => data.text as string };
      }
      const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      throw new Error(String(msg));
    } catch (err) {
      console.error('Erro ao gerar resposta remota do assistente:', err);
      return {
        text: () => 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      };
    }
  }
}
