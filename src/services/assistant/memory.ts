import { ConversationMessage } from './types';
import { getApiBaseUrl } from '@/src/utils/runtimeConfig';

type MemoryMap = Map<string, ConversationMessage[]>;

const DEFAULT_LIMIT = 6;

class LocalConversationMemory {
  private buffer: MemoryMap = new Map();

  constructor(private readonly limit: number) {}

  getContext(sessionId: string): ConversationMessage[] {
    return this.buffer.get(sessionId) ?? [];
  }

  append(sessionId: string, message: ConversationMessage) {
    const history = this.getContext(sessionId);
    const updated = [...history, message].slice(-this.limit);
    this.buffer.set(sessionId, updated);
  }

  clear(sessionId: string) {
    this.buffer.delete(sessionId);
  }
}

export class ConversationMemory {
  private readonly apiBaseUrl = getApiBaseUrl();
  private readonly localMemory = new LocalConversationMemory(DEFAULT_LIMIT);

  async getContext(sessionId: string): Promise<ConversationMessage[]> {
    if (!this.apiBaseUrl) {
      return this.localMemory.getContext(sessionId);
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/assistant/memory/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to load conversation memory (${response.status})`);
      }

      const data = await response.json();
      if (Array.isArray(data?.messages)) {
        return data.messages as ConversationMessage[];
      }
    } catch (error) {
      console.warn('Falling back to local conversation memory:', error);
    }

    return this.localMemory.getContext(sessionId);
  }

  async append(sessionId: string, message: ConversationMessage): Promise<void> {
    if (!this.apiBaseUrl) {
      this.localMemory.append(sessionId, message);
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/assistant/memory/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Failed to append conversation memory (${response.status})`);
      }
    } catch (error) {
      console.warn('Persisting memory remotely failed, storing locally:', error);
      this.localMemory.append(sessionId, message);
    }
  }

  async clear(sessionId: string): Promise<void> {
    if (!this.apiBaseUrl) {
      this.localMemory.clear(sessionId);
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/assistant/memory/${sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to clear conversation memory (${response.status})`);
      }
    } catch (error) {
      console.warn('Clearing remote memory failed; clearing local cache instead:', error);
      this.localMemory.clear(sessionId);
    }
  }
}
