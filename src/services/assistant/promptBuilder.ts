import { AssistantContext, ConversationMessage, KnowledgeSnippet } from './types';

interface PromptInput {
  userMessage: string;
  memory: ConversationMessage[];
  knowledge: KnowledgeSnippet[];
  context: AssistantContext;
}

const formatMemory = (memory: ConversationMessage[]) => {
  if (memory.length === 0) {
    return 'Sem histórico relevante disponível.';
  }

  return memory
    .map(entry => {
      const prefix = entry.role === 'user' ? 'Usuário' : 'Assistente';
      return `- ${prefix}: ${entry.content}`;
    })
    .join('\n');
};

const formatKnowledge = (snippets: KnowledgeSnippet[]) => {
  if (snippets.length === 0) {
    return 'Nenhum trecho do knowledge base foi recuperado. Use apenas informações confirmadas na conversa.';
  }

  return snippets
    .map(snippet => `- (${snippet.category}) ${snippet.title}: ${snippet.content}`)
    .join('\n');
};

export class PromptBuilder {
  static build(input: PromptInput): string {
    const { userMessage, memory, knowledge, context } = input;

    return `
Você é o Pro-founder Agent em modo de suporte e pré-venda.

Contexto da sessão:
- ID da sessão: ${context.sessionId}
- Idioma do usuário: ${context.locale}
- Nível do usuário: ${context.userTier}
- Lead: ${context.leadInformation ? `status ${context.leadInformation.status}, enviado em ${context.leadInformation.submittedAt}` : 'não identificado'}

Histórico recente:
${formatMemory(memory)}

Conhecimento recuperado:
${formatKnowledge(knowledge)}

Mensagem atual do usuário:
${userMessage}

Instruções de resposta:
- Fale no idioma do usuário indicado.
- Responda com clareza, cite dados do conhecimento apenas quando forem relevantes, e indique próximos passos quando fizer sentido.
- Se perceber alta intenção de compra, sugira uma conexão humana e prepare dados para handover.
- Reforce que toda publicação depende de aprovação explícita do usuário.
`;
  }
}
