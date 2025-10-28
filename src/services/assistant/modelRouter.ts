import { AIModel, DefaultAIModel } from '../aiModelService';
import { AIModelPerformanceManager } from '../../utils/aiPerformance';
import { AssistantContext, KnowledgeSnippet } from './types';
import { RemoteAIModel } from './remoteModel';

interface RoutingInput {
  assistantContext: AssistantContext;
  knowledge: KnowledgeSnippet[];
  messageLength: number;
}

interface RoutingResult {
  model: AIModel;
  modelName: string;
}

export class AssistantModelRouter {
  private readonly performanceManager = AIModelPerformanceManager.getInstance();
  private readonly openAIModel: RemoteAIModel;
  private readonly anthropicModel: RemoteAIModel;
  private readonly defaultModel: DefaultAIModel;

  constructor() {
    this.defaultModel = new DefaultAIModel();
    // Sempre usar o backend para gerar respostas (evita CORS e exposição de chaves no browser)
    this.openAIModel = new RemoteAIModel('gpt-4o');
    this.anthropicModel = new RemoteAIModel('claude-3.5-haiku');
  }

  selectModel(input: RoutingInput): RoutingResult {
    const { assistantContext, knowledge, messageLength } = input;
    const knowledgeDepth = knowledge.length;

    const shouldUsePremiumModel =
      assistantContext.userTier === 'premium' ||
      knowledgeDepth >= 2 ||
      messageLength > 400;

    if (shouldUsePremiumModel && this.openAIModel) {
      return { model: this.openAIModel, modelName: 'gpt-4o' };
    }

    if (this.anthropicModel) {
      return { model: this.anthropicModel, modelName: 'claude-3.5-haiku' };
    }

    return { model: this.defaultModel, modelName: 'default' };
  }

  recordUsage(modelName: string, metrics: { tokenCost: number; responseTime: number; accuracy: number }) {
    this.performanceManager.recordModelMetrics(modelName, metrics);
  }
}
