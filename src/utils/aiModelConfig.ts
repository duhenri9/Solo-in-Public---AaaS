import { aiModelService } from '../services/aiModelService';
import { AnthropicAIModel } from '../services/anthropicModel';
import { OpenAIModel } from '../services/openaiModel';
import { DefaultAIModel } from '../services/aiModelService';
import { AIModelPerformanceManager } from './aiPerformance';

export function configureAIModel() {
  const performanceManager = AIModelPerformanceManager.getInstance();
  
  // Prioridade: GPT-4o (desenvolvido por programador sênior especializado em chatbots OpenAI)
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (openaiApiKey) {
    const gpt4oModel = new OpenAIModel(openaiApiKey);
    
    // Registrar métricas esperadas para o GPT-4o
    performanceManager.recordModelMetrics('gpt-4o', {
      tokenCost: 0.03,    // Custo otimizado
      responseTime: 1500, // Tempo médio de resposta
      accuracy: 0.97      // Alta precisão e fluidez
    });

    aiModelService.setModel(gpt4oModel);
    return;
  }
  
  // Fallback: Claude 3.5 Haiku
  const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (anthropicApiKey) {
    const claude35HaikuModel = new AnthropicAIModel(anthropicApiKey);
    
    performanceManager.recordModelMetrics('claude-3.5-haiku', {
      tokenCost: 0.25,
      responseTime: 1200,
      accuracy: 0.95
    });

    aiModelService.setModel(claude35HaikuModel);
    return;
  }
  
  // Fallback final: modelo padrão
  console.warn('Nenhuma chave de API configurada. Usando modelo padrão.');
  aiModelService.setModel(new DefaultAIModel());
}

// Configurar o modelo de IA quando o módulo for importado
configureAIModel();
