# MVP de Onboarding, Billing e Captura de Leads

## Visão Geral
- Converter o CTA “Enviar briefing” em um funil real de qualificação + onboarding.
- Recolher briefings (nome, e-mail, objetivo, orçamento, urgência) e enviá-los para o backend/CRM.
- Iniciar autenticação via LinkedIn OAuth e provisionar agentes após confirmação de pagamento.
- Criar sessão de checkout em Stripe/PayPal (preferência Stripe) e lidar com webhooks para ativação automática do plano.

## Fluxos
1. **Lead Capture**
   - Front instala `LeadCaptureModal` → POST `/leads` → retorna `leadId` (implementado).
   - Backend grava lead, enfileira e dispara notificação Chatwood/CRM.
   - Feedback imediato no front; dados persistidos localmente para enriquecer conversas no chatbot.

2. **Onboarding & OAuth**
   - `GET /auth/linkedin` inicia OAuth.
   - Callback `/auth/linkedin/callback` cria/atualiza usuário, associa `leadId`.
   - Provisiona espaço próprio (config inicial, tokens, preferências de publicação).

3. **Checkout**
   - `POST /billing/checkout` cria sessão Stripe Checkout (`mode=subscription`, plano `pro-founder-monthly`).
   - Front chama `stripe.redirectToCheckout` usando o `sessionId` retornado (ou `checkoutUrl` como fallback).
   - Webhook confirma o pagamento (`status=active`) e provisiona o agente.

## Entidades e Endpoints
- Tabelas: `users`, `leads`, `organizations`, `subscriptions`, `agents`, `audit_logs`.
- Endpoints principais:
  - `POST /leads`
  - `POST /billing/checkout`
  - `POST /billing/webhooks`
  - `GET /auth/linkedin`
  - `GET /auth/linkedin/callback`
  - `POST /agents`

## Integrações futuras
- CRM (HubSpot ou Pipedrive) → receber leads qualificados automaticamente.
- Chatwood → recepção de handovers com contexto completo.
- Stripe customer portal → permitir atualização/cancelamento pelo usuário final.
