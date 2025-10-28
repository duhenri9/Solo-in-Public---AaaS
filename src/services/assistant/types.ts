export type AssistantRole = 'user' | 'assistant';

export interface ConversationMessage {
  role: AssistantRole;
  content: string;
  timestamp: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  category: string;
  language: string;
  title: string;
  content: string;
  tags: string[];
}

export interface KnowledgeSnippet {
  id: string;
  title: string;
  content: string;
  score: number;
  category: string;
}

export interface AssistantContext {
  sessionId: string;
  locale: string;
  userTier: 'trial' | 'premium' | 'public';
  leadInformation?: {
    id?: string;
    submittedAt?: string;
    status?: string;
  };
}

export interface AssistantResponse {
  message: string;
  model: string;
  knowledgeApplied: KnowledgeSnippet[];
  handoverTriggered: boolean;
}
