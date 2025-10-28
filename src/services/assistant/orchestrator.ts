import { ConversationMemory } from './memory';
import { KnowledgeBaseClient } from './knowledgeBase';
import { AssistantModelRouter } from './modelRouter';
import { HandoverEvaluator, ChatwoodClient } from './handover';
import { PromptBuilder } from './promptBuilder';
import { AssistantContext, AssistantResponse, ConversationMessage } from './types';
import { LeadSubmissionResult, LeadCaptureService } from '../leadCaptureService';
import { AssistantTelemetryService } from './telemetryService';

interface ProcessMessageInput {
  sessionId: string;
  message: string;
  locale: string;
  leadSubmission?: LeadSubmissionResult | null;
}

export class AssistantOrchestrator {
  private readonly memory = new ConversationMemory();
  private readonly knowledgeBase = new KnowledgeBaseClient();
  private readonly modelRouter = new AssistantModelRouter();
  private readonly telemetry = new AssistantTelemetryService();

  async processMessage(input: ProcessMessageInput): Promise<AssistantResponse> {
    const { sessionId, message, locale, leadSubmission } = input;

    const normalizedLocale = locale?.split('-')[0] ?? 'pt';
    const leadInfo = leadSubmission ?? this.getCachedLeadSubmission();

    const assistantContext: AssistantContext = {
      sessionId,
      locale: normalizedLocale,
      userTier: leadInfo?.status === 'synced' ? 'premium' : 'trial',
      leadInformation: leadInfo
        ? {
            id: leadInfo.id,
            submittedAt: leadInfo.submittedAt,
            status: leadInfo.status
          }
        : undefined
    };

    await this.memory.append(sessionId, this.toMessage('user', message));

    const knowledge = await this.knowledgeBase.search(message, normalizedLocale, 3);
    const history = await this.memory.getContext(sessionId);

    const prompt = PromptBuilder.build({
      userMessage: message,
      memory: history,
      knowledge,
      context: assistantContext
    });

    const { model, modelName } = this.modelRouter.selectModel({
      assistantContext,
      knowledge,
      messageLength: message.length
    });

    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const result = await model.sendMessage(prompt);
    const end = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const assistantReply = result.text();

    await this.memory.append(sessionId, this.toMessage('assistant', assistantReply));

    const responseTime = end - start;

    this.modelRouter.recordUsage(modelName, {
      tokenCost: 0,
      responseTime,
      accuracy: knowledge.length > 0 ? 0.95 : 0.9
    });

    const shouldEscalate = HandoverEvaluator.shouldTrigger(message, assistantReply);
    if (shouldEscalate) {
      await ChatwoodClient.triggerHandover({
        sessionId,
        userMessage: message,
        assistantReply,
        context: assistantContext
      });
    }

    await this.telemetry.recordUsage({
      sessionId,
      model: modelName,
      responseTime,
      tokenCost: 0,
      handoverTriggered: shouldEscalate,
      knowledgeApplied: knowledge
    });

    return {
      message: assistantReply,
      model: modelName,
      knowledgeApplied: knowledge,
      handoverTriggered: shouldEscalate
    };
  }

  async resetSession(sessionId: string) {
    await this.memory.clear(sessionId);
  }

  private toMessage(role: ConversationMessage['role'], content: string): ConversationMessage {
    return {
      role,
      content,
      timestamp: new Date().toISOString()
    };
  }

  private getCachedLeadSubmission(): LeadSubmissionResult | null {
    const cached = LeadCaptureService.getCachedLead();
    if (!cached) return null;
    return {
      id: cached.id,
      status: cached.status,
      submittedAt: cached.submittedAt
    };
  }
}
