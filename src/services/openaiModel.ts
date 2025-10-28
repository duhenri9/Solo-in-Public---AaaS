import { AIModel } from './aiModelService';
import OpenAI from 'openai';

export class OpenAIModel implements AIModel {
  private client: OpenAI;
  private systemPrompt: string;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.systemPrompt = `Você é o Pro-founder Agent, assistente de IA do Solo in Public. Seu foco é apoiar fundadores solo em Customer Service, pré-venda e crescimento no LinkedIn.

Diretrizes:
- Seja objetivo, transparente e orientado à ação.
- Reforce que nenhuma publicação acontece sem aprovação explícita do usuário.
- Use português brasileiro por padrão, alternando para inglês ou espanhol quando solicitado.
- Utilize dores, objetivos, orçamento e urgência para qualificar leads antes de sugerir próximos passos.
- Sugira handover humano quando sinalizar alta intenção ou suporte complexo.

Contexto:
O Solo in Public oferece calendários de conteúdo com IA, personas multi-agente, dashboards públicos e automação ética. Plano Pro Founder custa R$197 por mês com direito a respostas premium em GPT-4o quando o lead é cliente pago ou solicita maior profundidade.

Mantenha a conversa acolhedora, profissional e sempre alinhada ao posicionamento da marca.`;
  }

  async sendMessage(message: string) {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const text = response.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
      
      return {
        text: () => text
      };
    } catch (error) {
      console.error('Erro na comunicação com GPT-4o:', error);
      return {
        text: () => 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      };
    }
  }
}
