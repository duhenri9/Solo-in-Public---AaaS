import { OpenAIModel } from '../openaiModel';
import { AnthropicAIModel } from '../anthropicModel';
import { AIModel, DefaultAIModel } from '../aiModelService';
import { AIModelPerformanceManager } from '../../utils/aiPerformance';
import { AssistantContext, KnowledgeSnippet } from './types';

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
  private readonly openAIModel?: OpenAIModel;
  private readonly anthropicModel?: AnthropicAIModel;
  private readonly defaultModel: DefaultAIModel;

  constructor() {
    const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    this.defaultModel = new DefaultAIModel();
    if (openAIKey) {
      this.openAIModel = new OpenAIModel(openAIKey);
    }
    if (anthropicKey) {
      this.anthropicModel = new AnthropicAIModel(anthropicKey);
    }
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
