# Orquestração do Assistente

## Componentes principais
- `AssistantOrchestrator`: ponto único para memória, conhecimento, roteamento de modelos e handover.
- `ConversationMemory`: persiste histórico curto (6 turnos) via backend (`/assistant/memory/:sessionId`) com fallback local.
- `KnowledgeBaseClient`: consulta embeddings pelo endpoint `/assistant/knowledge/search` e usa JSON local como fallback offline.
- `AssistantModelRouter`: escolhe Claude 3.5 Haiku como baseline e sobe para GPT-4o em casos premium/alta complexidade.
- `AssistantTelemetryService`: registra tokens, tempo e handovers em `/assistant/metrics`.
- `ChatwoodClient`: dispara handover quando o lead pede humano ou demonstra alta intenção.

## Fluxo de mensagem
1. Front envia `sessionId`, mensagem e locale.
2. Orquestrador salva a mensagem em `/assistant/memory/:sessionId` e recupera histórico recente.
3. Busca snippets no backend (`/assistant/knowledge/search`) e monta o prompt com histórico + contexto do lead.
4. Router seleciona o modelo (`premium → gpt-4o`, senão `claude-3.5-haiku`, fallback `DefaultAIModel`).
5. Resposta volta com metadados (modelo usado, snippets, flag de handover) e é registrada em `/assistant/metrics`.
6. Caso haja escalonamento, Chatwood recebe o contexto em `/chatwood/handover`.

## Próximos passos
- Habilitar modo streaming e compressão de histórico quando o número de turnos crescer.
- Adicionar retries/queue para falhas de rede nos endpoints de memória/telemetria.
- Conectar o handover diretamente à fila do Chatwood/CRM escolhido.
