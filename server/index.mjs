import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import OpenAI from 'openai';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;
const clientOrigin = process.env.CLIENT_APP_URL || process.env.VITE_CLIENT_APP_URL || 'http://localhost:5173';

// Em dev, refletimos a origem da requisição para evitar bloqueios no preview
const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: clientOrigin, credentials: true }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));

app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

const dataDir = path.join(__dirname, 'db');
await fs.mkdir(dataDir, { recursive: true });

const leadsFile = path.join(dataDir, 'leads.json');
const memoryFile = path.join(dataDir, 'memory.json');
const metricsFile = path.join(dataDir, 'metrics.json');
const handoverFile = path.join(dataDir, 'handovers.json');
const knowledgeCache = path.join(dataDir, 'knowledge-embeddings.json');

const readJson = async (file, fallback) => {
  try {
    const content = await fs.readFile(file, 'utf8');
    return JSON.parse(content);
  } catch {
    return fallback;
  }
};

const writeJson = async (file, data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
};

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripePriceId = process.env.STRIPE_PRICE_ID;
const clientSuccessUrl = `${clientOrigin}?checkout=success`;
const clientCancelUrl = `${clientOrigin}?checkout=cancel`;

const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

const knowledgeEntries = JSON.parse(
  await fs.readFile(path.join(process.cwd(), 'src/data/knowledgeBase.json'), 'utf8')
);
console.log('Backend CWD:', process.cwd());
const distDir = path.join(process.cwd(), 'dist');
let distExists = false;
try {
  await fs.access(distDir);
  distExists = true;
} catch {
  console.warn('Frontend build not found. Run "npm run build" to generate dist/ for production serving.');
}

const normalizeText = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const runFallbackSearch = (query, locale, limit) => {
  const normalizedQuery = normalizeText(query);
  const keywords = normalizedQuery.split(/\s+/).filter(Boolean);

  return knowledgeEntries
    .filter(
      (entry) => entry.language === locale || (entry.language === 'pt' && locale?.startsWith('pt'))
    )
    .map((entry) => {
      const normalizedContent = normalizeText(`${entry.title} ${entry.content} ${entry.tags.join(' ')}`);
      const matches = keywords.reduce(
        (score, keyword) => (normalizedContent.includes(keyword) ? score + 1 : score),
        0
      );
      const tagBoost = entry.tags.some((tag) => normalizedQuery.includes(normalizeText(tag))) ? 1 : 0;

      return {
        id: entry.id,
        title: entry.title,
        content: entry.content,
        category: entry.category,
        score: matches + tagBoost
      };
    })
    .filter((snippet) => snippet.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

let knowledgeEmbeddings = null;

const ensureKnowledgeEmbeddings = async () => {
  if (!openai) {
    knowledgeEmbeddings = null;
    return;
  }

  if (knowledgeEmbeddings) return;

  const cached = await readJson(knowledgeCache, null);
  if (cached && cached.model === 'text-embedding-3-small' && cached.entries?.length === knowledgeEntries.length) {
    knowledgeEmbeddings = cached.entries;
    return;
  }

  const entries = [];
  for (const entry of knowledgeEntries) {
    const content = `${entry.title}\n${entry.content}`;
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content
    });
    entries.push({ id: entry.id, embedding: response.data[0].embedding, language: entry.language });
  }

  knowledgeEmbeddings = entries;
  await writeJson(knowledgeCache, { model: 'text-embedding-3-small', entries });
};

const cosineSimilarity = (a, b) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
};

app.post(
  '/billing/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe || !stripeWebhookSecret) {
      return res.status(400).json({ error: 'Webhook signature not configured' });
    }

    const signature = req.headers['stripe-signature'];
    try {
      const event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
      const events = await readJson(path.join(dataDir, 'stripe-events.json'), []);
      events.push({ id: event.id, type: event.type, created: event.created, data: event.data });
      await writeJson(path.join(dataDir, 'stripe-events.json'), events);
      res.json({ received: true });
    } catch (error) {
      console.error('Stripe webhook error', error);
      res.status(400).json({ error: 'Invalid signature' });
    }
  }
);

if (distExists) {
  console.log(`Serving static frontend from ${distDir}`);
  app.use('/', express.static(distDir, { fallthrough: true }));
} else {
  // Proxy tudo que não for API para o Vite dev (5173)
  const viteTarget = process.env.VITE_DEV_SERVER || 'http://localhost:5173';
  const isApi = (p) =>
    p.startsWith('/assistant') ||
    p.startsWith('/billing') ||
    p.startsWith('/leads') ||
    p.startsWith('/chatwood') ||
    p.startsWith('/health');

  app.use((req, res, next) => {
    if (isApi(req.path)) return next();
    return createProxyMiddleware({ target: viteTarget, changeOrigin: true, ws: true })(req, res, next);
  });
}

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/leads', async (req, res) => {
  const now = new Date().toISOString();
  const leadId = req.body.leadId || crypto.randomUUID();
  const leads = await readJson(leadsFile, []);
  const leadRecord = {
    id: leadId,
    status: 'synced',
    submittedAt: req.body.submittedAt || now,
    ...req.body
  };
  leads.push(leadRecord);
  await writeJson(leadsFile, leads);
  res.status(201).json({ id: leadId, status: 'synced' });
});

app.post('/billing/checkout', async (req, res) => {
  if (!stripe || !stripePriceId) {
    return res.json({
      status: 'simulated',
      customerId: req.body.email,
      checkoutUrl: null
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1
        }
      ],
      customer_email: req.body.email,
      metadata: {
        leadId: req.body.leadId || '',
        planId: req.body.planId || 'pro-founder-monthly'
      },
      success_url: clientSuccessUrl,
      cancel_url: clientCancelUrl
    });

    res.json({
      status: 'requires_redirect',
      checkoutUrl: session.url,
      customerId: session.customer,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Stripe checkout error', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.get('/assistant/memory/:sessionId', async (req, res) => {
  const memory = await readJson(memoryFile, {});
  res.json({ messages: memory[req.params.sessionId] ?? [] });
});

app.post('/assistant/memory/:sessionId', async (req, res) => {
  const memory = await readJson(memoryFile, {});
  const list = memory[req.params.sessionId] ?? [];
  list.push(req.body);
  memory[req.params.sessionId] = list.slice(-6);
  await writeJson(memoryFile, memory);
  res.status(204).end();
});

app.delete('/assistant/memory/:sessionId', async (req, res) => {
  const memory = await readJson(memoryFile, {});
  delete memory[req.params.sessionId];
  await writeJson(memoryFile, memory);
  res.status(204).end();
});

app.post('/assistant/knowledge/search', async (req, res) => {
  const { query, locale = 'pt', limit = 3 } = req.body ?? {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (openai) {
    try {
      await ensureKnowledgeEmbeddings();
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query
      });
      const queryEmbedding = embeddingResponse.data[0].embedding;

      const scored = knowledgeEmbeddings
        .map((entry) => ({
          id: entry.id,
          score: cosineSimilarity(queryEmbedding, entry.embedding),
          language: entry.language
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      const enriched = scored.map((item) => {
        const original = knowledgeEntries.find((entry) => entry.id === item.id);
        return {
          id: original.id,
          title: original.title,
          content: original.content,
          category: original.category,
          score: item.score
        };
      });

      return res.json({ results: enriched });
    } catch (error) {
      console.warn('Embedding search failed, falling back to keyword search', error);
    }
  }

  const fallback = runFallbackSearch(query, locale, limit);
  res.json({ results: fallback });
});

app.post('/assistant/metrics', async (req, res) => {
  const metrics = await readJson(metricsFile, []);
  metrics.push({ ...req.body, recordedAt: new Date().toISOString() });
  await writeJson(metricsFile, metrics);
  res.status(201).end();
});

app.post('/chatwood/handover', async (req, res) => {
  const handovers = await readJson(handoverFile, []);
  handovers.push({ ...req.body, receivedAt: new Date().toISOString() });
  await writeJson(handoverFile, handovers);
  res.status(202).json({ status: 'queued' });
});

// Client error intake to help diagnose blank screens in preview
app.post('/client-error', async (req, res) => {
  try {
    const file = path.join(dataDir, 'client-errors.json');
    const list = await readJson(file, []);
    list.push({ ...req.body, receivedAt: new Date().toISOString() });
    await writeJson(file, list);
    console.warn('[ClientError]', req.body && req.body.message, req.body && req.body.stack);
    res.status(204).end();
  } catch (err) {
    console.error('Failed saving client error', err);
    res.status(500).json({ error: 'failed to save' });
  }
});

if (distExists) {
  const indexPath = path.join(distDir, 'index.html');
  // SPA fallback after API routes (Express 5: avoid "*" routes)
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    const pathLower = req.path.toLowerCase();
    // ignore API routes
    if (
      pathLower.startsWith('/assistant') ||
      pathLower.startsWith('/billing') ||
      pathLower.startsWith('/leads') ||
      pathLower.startsWith('/chatwood') ||
      pathLower.startsWith('/health')
    ) {
      return next();
    }
    // let static assets fall-through
    if (pathLower.includes('.') && pathLower !== '/index.html') {
      return next();
    }
    console.log(`Serving SPA index for ${req.path}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Failed to serve index.html', err);
        next(err);
      }
    });
  });
}

console.log('Router defined?', Boolean(app._router));

app.listen(port, () => {
  console.log(`AaaS backend listening on http://localhost:${port}`);
  if (app._router && app._router.stack) {
    const routes = app._router.stack
      .filter((layer) => layer.route)
      .map((layer) => `${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
    console.log('Registered routes:', routes);
  }
});
