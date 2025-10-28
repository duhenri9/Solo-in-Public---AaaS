<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Solo in Public - Agente como Serviço (AaaS)

## Descrição
Solo in Public é uma plataforma que ajuda fundadores solo a construir e crescer em público no LinkedIn, utilizando inteligência artificial para otimizar a criação de conteúdo.

## Agente Pro-Founder

O **Agente Pro-Founder** é o assistente de IA da plataforma que trabalha em conjunto com fundadores solo para otimizar a criação e publicação de conteúdo no LinkedIn.

### Filosofia e Regras de Negócio

**Regra Fundamental:**
> **Nós nunca publicaremos nada sem a sua permissão.**

Todas as publicações, sugestões de conteúdo e ações no LinkedIn serão sempre submetidas à sua aprovação explícita antes de qualquer publicação. O agente trabalha como um copiloto inteligente que:

- Sugere conteúdo baseado em suas preferências e estratégia
- Propõe timing ideal para publicações
- Analisa engajamento e métricas
- **Sempre aguarda sua aprovação antes de publicar**

O controle total permanece com você, garantindo autenticidade e alinhamento com sua voz e valores.

### Tecnologia e Funcionalidades

**Modelo de IA:** GPT-4o da OpenAI
- Desenvolvido por programador sênior especializado em chatbots da OpenAI
- Interação fluida e natural, tanto por voz quanto por texto
- Respostas contextualizadas e otimizadas para fundadores solo

**Voice-in-Chat:**
- Reconhecimento de voz em tempo real (Web Speech API)
- Transcrição automática durante a fala
- Síntese de voz para respostas do assistente
- Suporte completo em português brasileiro
- Alternância entre entrada por texto e voz

## Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

## Configuração do Ambiente

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/solo-in-public.git
cd solo-in-public
```

2. Copie o arquivo de exemplo de variáveis de ambiente
```bash
cp .env.example .env
```

3. Configure suas variáveis de ambiente
- Abra o arquivo `.env`
- Defina `VITE_API_BASE_URL` apontando para o backend (ex.: `http://localhost:8787`)
- Adicione sua chave pública da Stripe em `VITE_STRIPE_PUBLIC_KEY`
- Configure as chaves de modelo no backend: `OPENAI_API_KEY` e/ou `ANTHROPIC_API_KEY`
- Evite usar `VITE_OPENAI_API_KEY` / `VITE_ANTHROPIC_API_KEY` (frontend) para produção — o app agora gera respostas via backend

## Instalação de Dependências
```bash
npm install
# ou
yarn install
```

## Executando o Projeto
```bash
# Desenvolvimento (recomendado)
npm run server                                    # API em http://localhost:8787
VITE_API_BASE_URL=http://localhost:8787 npm run dev  # Vite em http://localhost:5173

# Acesse: http://localhost:8787/ (serve SPA em prod ou proxy em dev)
# Alternativamente: http://localhost:5173/ (dev server direto)

# Build para produção do frontend
npm run build

# Preview da build de produção
npm run preview
```

## Estrutura do Projeto
- `src/`: Código-fonte principal
- `components/`: Componentes React
- `hooks/`: Hooks personalizados
- `locales/`: Arquivos de internacionalização
- `types.ts`: Definições de tipos TypeScript

## Tecnologias Principais
- React + TypeScript + Vite
- Tailwind CSS
- Stripe Checkout (assinaturas via backend `/billing/checkout`)
- LinkedIn OAuth (fluxo iniciado em `/auth/linkedin`)
- OpenAI GPT-4o (premium) e Anthropic Claude 3.5 Haiku (baseline) — geração feita no backend
- Orquestração híbrida do assistente (memória remota + knowledge base com embeddings)
- Web Speech API (reconhecimento e síntese de voz no chat)

## Fluxos conectados
- **Briefing / Lead Capture**: o modal envia dados para `POST /leads`, guarda o `leadId` localmente e o reaproveita no chat e no checkout.
- **Checkout**: o botão “Ativar” chama `POST /billing/checkout`, redirecionando para o Stripe ou simulando o fluxo quando o backend ainda não está configurado.
- **LinkedIn OAuth**: o login abre `/auth/linkedin?redirect_uri=...&lead_id=...`; quando o usuário retorna com `?oauth=linkedin&status=success`, o app finaliza o login automaticamente.
- **Assistente**: cada mensagem consulta `/assistant/knowledge/search`, persiste memória via `/assistant/memory/:sessionId`, gera resposta via `/assistant/generate` (chaves no backend) e envia métricas para `/assistant/metrics`. Handover humano aciona `/chatwood/handover`.

Detalhes adicionais encontram-se em `docs/onboarding-billing-mvp.md` e `docs/assistant-orchestration.md`.

## Endpoints expostos
- `POST /leads`
- `POST /billing/checkout`
- `POST /billing/webhook`
- `GET|POST|DELETE /assistant/memory/:sessionId`
- `POST /assistant/knowledge/search`
- `POST /assistant/generate`
- `POST /assistant/metrics`
- `POST /chatwood/handover`

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça um push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença
[Inserir informações de licença]

## Contato
[Inserir informações de contato]

## Releases
- v0.1.0-functional: baseline funcional com backend Express (leads, billing, memory/knowledge, telemetry), orquestração do assistente (memória curta, base de conhecimento, roteamento de modelos) e fallback SPA estável para preview.
  - Detalhes e notas adicionais em `CHANGELOG.md`.
