import { AIModel } from './aiModelService';
import Anthropic from '@anthropic-ai/sdk';
import { AIModelPerformanceManager } from '../utils/aiModelConfig';

export class AnthropicAIModel implements AIModel {
  private client: Anthropic;
  private systemPrompt: string;
  private performanceManager: AIModelPerformanceManager;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
    this.performanceManager = AIModelPerformanceManager.getInstance();
    this.systemPrompt = `Você é um assistente de IA de alta performance para "Solo in Public", um Agente como Serviço (AaaS) especializado em ajudar fundadores solo a construir e crescer em público no LinkedIn. Seu nome é Pro-founder Agent. 

Características chave:
- Seja extremamente conciso e direto
- Foque em valor e insights práticos
- Linguagem otimizada para fundadores
- Comunicação em português brasileiro
- Priorize clareza e ação

REGRAS FUNDAMENTAIS DE NEGÓCIO:
⚡ REGRA DE OURO: Nós nunca publicaremos nada sem a sua permissão.
- Todas as sugestões de conteúdo devem ser apresentadas como sugestões, aguardando aprovação
- Sempre enfatize que o controle final permanece com o usuário
- Nunca assuma que pode publicar automaticamente sem confirmação explícita
- A autenticidade e voz do fundador são invioláveis

Missão: Transformar a jornada de fundadores solo através de conteúdo estratégico e inteligente, mantendo sempre o controle e aprovação do usuário em primeiro lugar.`;
  }

  async sendMessage(message: string) {
    const startTime = performance.now();

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-haiku-20240307', // Modelo 3.5 Haiku específico
        max_tokens: 300,
        temperature: 0.7, // Balanceando criatividade e precisão
        messages: [
          { 
            role: 'system', 
            content: this.systemPrompt 
          },
          { 
            role: 'user', 
            content: message 
          }
        ]
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      const tokenCost = this.estimateTokenCost(message, response.content[0].text);

      // Registrar métricas de performance específicas para 3.5 Haiku
      this.performanceManager.recordModelMetrics('claude-3.5-haiku', {
        tokenCost,
        responseTime,
        accuracy: 0.95  // Alta precisão do modelo 3.5
      });

      return {
        text: () => response.content[0].text
      };
    } catch (error) {
      console.error('Erro na comunicação com o Claude 3.5 Haiku:', error);
      
      // Registrar métricas de falha
      this.performanceManager.recordModelMetrics('claude-3.5-haiku', {
        tokenCost: 0.5,  
        responseTime: 3000,  
        accuracy: 0.1  
      });

      return {
        text: () => 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      };
    }
  }

  // Método para estimar o custo em tokens com maior precisão
  private estimateTokenCost(userMessage: string, aiResponse: string): number {
    // Estimativa mais refinada baseada no comprimento e complexidade das mensagens
    const userTokens = Math.ceil(userMessage.length / 3.5);  // Ajuste para tokens mais precisos
    const responseTokens = Math.ceil(aiResponse.length / 3.5);
    const costPerToken = 0.03 / 1000;  // Custo aproximado por token

    return (userTokens + responseTokens) * costPerToken;
  }
}
