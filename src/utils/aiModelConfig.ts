import { aiModelService } from '../services/aiModelService';
import { AnthropicAIModel } from '../services/anthropicModel';
import { DefaultAIModel } from '../services/aiModelService';

// Interface para métricas de performance do modelo
interface AIModelMetrics {
  tokenCost: number;
  responseTime: number;
  accuracy: number;
}

export class AIModelPerformanceManager {
  private static instance: AIModelPerformanceManager;
  private modelMetrics: Map<string, AIModelMetrics> = new Map();
  private fallbackThreshold = {
    tokenCost: 0.4,     // Custo máximo por token (mais restrito)
    responseTime: 1800, // Tempo máximo de resposta em ms
    accuracy: 0.85      // Precisão mínima aceitável
  };

  private constructor() {}

  public static getInstance(): AIModelPerformanceManager {
    if (!this.instance) {
      this.instance = new AIModelPerformanceManager();
    }
    return this.instance;
  }

  // Registrar métricas de desempenho de um modelo
  public recordModelMetrics(modelName: string, metrics: AIModelMetrics) {
    this.modelMetrics.set(modelName, metrics);
  }

  // Verificar se o modelo atende aos requisitos de performance
  public isModelPerformant(modelName: string): boolean {
    const metrics = this.modelMetrics.get(modelName);
    if (!metrics) return false;

    return (
      metrics.tokenCost <= this.fallbackThreshold.tokenCost &&
      metrics.responseTime <= this.fallbackThreshold.responseTime &&
      metrics.accuracy >= this.fallbackThreshold.accuracy
    );
  }

  // Método para obter métricas de um modelo específico
  public getModelMetrics(modelName: string): AIModelMetrics | undefined {
    return this.modelMetrics.get(modelName);
  }
}

export function configureAIModel() {
  const performanceManager = AIModelPerformanceManager.getInstance();
  
  // Prioridade sempre será o modelo Claude 3.5 Haiku
  const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.warn('Chave da Anthropic não configurada. Usando modelo padrão.');
    aiModelService.setModel(new DefaultAIModel());
    return;
  }

  const claude35HaikuModel = new AnthropicAIModel(anthropicApiKey);
  
  // Registrar métricas esperadas para o modelo Claude 3.5 Haiku
  performanceManager.recordModelMetrics('claude-3.5-haiku', {
    tokenCost: 0.25,    // Custo estimado por token (mais baixo)
    responseTime: 1200, // Tempo médio de resposta
    accuracy: 0.95      // Alta precisão
  });

  // Sempre definir o modelo Claude 3.5 Haiku como principal
  aiModelService.setModel(claude35HaikuModel);
}

// Configurar o modelo de IA quando o módulo for importado
configureAIModel();
