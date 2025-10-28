# Changelog

## v0.1.0-functional (Functional Preview Baseline)

Stabilized a fully functional baseline that runs cleanly in preview and production.

- Preview/Server
  - Serve built frontend (dist/) via Express with SPA fallback (Express 5 compatible)
  - Dev proxy to Vite for non-API routes (so preview at 8787 loads even in dev)
  - CORS in development with dynamic origin to support IDE previews
  - Added client error intake endpoint (`POST /client-error`) + minimal client reporter

- Assistant Orchestration
  - Knowledge base retrieval with backend embeddings + keyword fallback
  - Short-term memory with remote persistence
  - Telemetry endpoint for cost/latency and Chatwood handover triggers
  - Cost-aware model routing (Anthropic Haiku baseline; GPT‑4o for premium/high complexity)

- Product flows
  - Lead capture modal + `/leads` endpoint
  - Checkout session creation with Stripe (simulation fallback when secrets absent)
  - LinkedIn OAuth flow trigger + callback handling

- i18n/UX
  - Notification container mounted + titles/messages consistentes
  - i18n sweep across sections and modais
  - Vite `base: './'` em produção (garante assets em preview)

- Build/test
  - Fixed import cycle at runtime (moved AIModelPerformanceManager to `src/utils/aiPerformance.ts`)
  - Integration tests for services (leads/billing) mocking `fetch`

How to run
- Development
  - `npm run server`
  - `VITE_API_BASE_URL=http://localhost:8787 npm run dev`
  - Open `http://localhost:8787/` (proxy) or `http://localhost:5173/`
- Production/preview
  - `npm run build`
  - `npm run server`
  - Open `http://localhost:8787/`

Notes
- Tag created: `v0.1.0-functional`
- Baseline branch merged into `main`: `feat/preview-fixes-assistant`

