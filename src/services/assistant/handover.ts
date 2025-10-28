import { AssistantContext } from './types';
import { getApiBaseUrl } from '@/src/utils/runtimeConfig';

const HIGH_INTENT_PATTERNS = [
  /falar com (uma )?pessoa/i,
  /human/i,
  /quero (uma )?demonstração/i,
  /speak to (a )?human/i,
  /call me/i,
  /agendar (uma )?chamada/i,
  /contactar/i,
  /cerrar compra/i
];

interface HandoverPayload {
  sessionId: string;
  userMessage: string;
  assistantReply: string;
  context: AssistantContext;
}

export class HandoverEvaluator {
  static shouldTrigger(userMessage: string, assistantReply: string): boolean {
    const combinedText = `${userMessage}\n${assistantReply}`;
    return HIGH_INTENT_PATTERNS.some((pattern) => pattern.test(combinedText));
  }
}

export class ChatwoodClient {
  static async triggerHandover(payload: HandoverPayload): Promise<void> {
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      console.info('Chatwood handover simulated. Payload:', payload);
      return;
    }

    const response = await fetch(`${apiBaseUrl}/chatwood/handover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Chatwood handover failed with status ${response.status}`);
    }
  }
}
