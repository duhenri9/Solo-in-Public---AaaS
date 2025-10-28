import { KnowledgeSnippet } from './types';
import { getApiBaseUrl } from '@/src/utils/runtimeConfig';

interface UsagePayload {
  sessionId: string;
  model: string;
  responseTime: number;
  tokenCost: number;
  handoverTriggered: boolean;
  knowledgeApplied: KnowledgeSnippet[];
}

export class AssistantTelemetryService {
  private readonly apiBaseUrl = getApiBaseUrl();

  async recordUsage(payload: UsagePayload): Promise<void> {
    if (!this.apiBaseUrl) {
      return;
    }

    try {
      await fetch(`${this.apiBaseUrl}/assistant/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.warn('Unable to send assistant telemetry:', error);
    }
  }
}
