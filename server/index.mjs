import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
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
const postsFile = path.join(dataDir, 'posts.json');

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
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

const knowledgeEntries = JSON.parse(
  await fs.readFile(path.join(process.cwd(), 'src/data/knowledgeBase.json'), 'utf8')
);
console.log('Backend CWD:', process.cwd());
const distDir = path.join(process.cwd(), 'dist');
let distExists = false;
const forceDevProxy = process.env.FORCE_DEV_PROXY === '1';
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

if (distExists && !forceDevProxy) {
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

// Basic dashboard metrics aggregation
app.get('/dashboard/metrics', async (_req, res) => {
  const metrics = await readJson(metricsFile, []);
  const leads = await readJson(leadsFile, []);

  const totalMessages = metrics.length;
  const avgResponseTime = totalMessages
    ? metrics.reduce((sum, m) => sum + (m.responseTime || 0), 0) / totalMessages
    : 0;
  const handovers = metrics.filter((m) => m.handoverTriggered).length;
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const messages24h = metrics.filter((m) => (m.recordedAt || m.timestamp || '') > last24h).length;

  res.json({
    totalMessages,
    avgResponseTime,
    handovers,
    messages24h,
    leadsCount: leads.length
  });
});

// Content generation MVP (limit 3/month)
const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

app.get('/content/posts', async (_req, res) => {
  const posts = await readJson(postsFile, []);
  res.json({ posts });
});

app.get('/content/limits', async (_req, res) => {
  const posts = await readJson(postsFile, []);
  const mk = monthKey();
  const used = posts.filter((p) => p.monthKey === mk).length;
  res.json({ allowedPerMonth: 3, used, remaining: Math.max(0, 3 - used) });
});

app.post('/content/generate', async (req, res) => {
  const { topic = '', persona = 'default', locale = 'pt' } = req.body || {};
  const posts = await readJson(postsFile, []);
  const mk = monthKey();
  const used = posts.filter((p) => p.monthKey === mk).length;
  if (used >= 3) {
    return res.status(429).json({ error: 'Monthly limit reached', allowedPerMonth: 3, used });
  }

  const prompt = `Persona: ${persona}\nIdioma: ${locale}\nGere um post curto e autêntico para LinkedIn sobre: ${topic || 'sua jornada como founder solo'}\nEm 5-7 linhas, com CTA leve. Sem emojis.`;

  try {
    let text = '';
    if (anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 280,
        temperature: 0.7,
        system: 'Gerador de posts do Solo in Public. Seja direto, sem emojis, útil.',
        messages: [{ role: 'user', content: prompt }]
      });
      const block = response.content.find((b) => b.type === 'text');
      text = (block && 'text' in block ? block.text : '').trim();
    } else if (openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Gerador de posts do Solo in Public. Seja direto, sem emojis, útil.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 280
      });
      text = (response.choices[0]?.message?.content || '').trim();
    } else {
      const snippets = runFallbackSearch(topic || 'solo in public', locale, 2)
        .map((s) => `• ${s.title}: ${s.content}`)
        .join('\n');
      text = `Modo demonstração — sem chaves de modelo. Ideias de post baseadas no conhecimento:\n${snippets}`;
    }

    const record = {
      id: crypto.randomUUID(),
      content: text || 'Post gerado com sucesso.',
      persona,
      locale,
      createdAt: new Date().toISOString(),
      approved: false,
      monthKey: mk
    };
    posts.push(record);
    await writeJson(postsFile, posts);
    res.status(201).json({ post: record, remaining: Math.max(0, 3 - (used + 1)) });
  } catch (err) {
    console.error('content/generate error', err);
    res.status(500).json({ error: 'Failed to generate post' });
  }
});

app.post('/content/approve', async (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  const posts = await readJson(postsFile, []);
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  posts[idx].approved = true;
  posts[idx].approvedAt = new Date().toISOString();
  await writeJson(postsFile, posts);
  res.json({ post: posts[idx] });
});

// Simple calendar suggestion (next 2 weeks)
app.get('/content/calendar', async (req, res) => {
  const locale = req.query.locale || 'pt';
  const start = new Date();
  const suggestions = [];
  for (let i = 0; i < 14; i += 2) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    d.setHours(9 + (i % 3) * 3, 0, 0, 0);
    suggestions.push({
      date: d.toISOString(),
      slot: d.toLocaleString(typeof locale === 'string' ? locale : 'pt-BR'),
      reason: 'Horário sugerido com base em boas práticas de alcance no LinkedIn.'
    });
  }
  res.json({ suggestions });
});
// Assistant text generation (server-side, avoids exposing keys in frontend)
app.post('/assistant/generate', async (req, res) => {
  const { prompt, modelPreference = 'auto', max_tokens = 300 } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Choose model according to availability and preference
    const wantsOpenAI = modelPreference === 'gpt-4o';
    const wantsAnthropic = modelPreference === 'claude-3.5-haiku';

    if (wantsOpenAI && openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Você é um assistente de IA para o Solo in Public. Responda de forma objetiva e útil.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: Math.min(400, Math.max(50, max_tokens))
      });
      const text = response.choices[0]?.message?.content || '';
      return res.json({ text, model: 'gpt-4o' });
    }

    if (wantsAnthropic && anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: Math.min(400, Math.max(50, max_tokens)),
        temperature: 0.7,
        system: 'Você é um assistente de IA para o Solo in Public. Responda de forma objetiva e útil.',
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      const textBlock = response.content.find((b) => b.type === 'text');
      const text = textBlock && 'text' in textBlock ? textBlock.text : '';
      return res.json({ text, model: 'claude-3.5-haiku' });
    }

    // Auto: prefer Anthropic, then OpenAI
    if (anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: Math.min(400, Math.max(50, max_tokens)),
        temperature: 0.7,
        system: 'Você é um assistente de IA para o Solo in Public. Responda de forma objetiva e útil.',
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      const textBlock = response.content.find((b) => b.type === 'text');
      const text = textBlock && 'text' in textBlock ? textBlock.text : '';
      return res.json({ text, model: 'claude-3.5-haiku' });
    }

    if (openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Você é um assistente de IA para o Solo in Public. Responda de forma objetiva e útil.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: Math.min(400, Math.max(50, max_tokens))
      });
      const text = response.choices[0]?.message?.content || '';
      return res.json({ text, model: 'gpt-4o' });
    }

    // No keys configured: simulate a helpful response using knowledge fallback
    const locale = (req.body && req.body.locale) || 'pt';
    const fallback = runFallbackSearch(prompt, locale, 3);
    const bullets = fallback
      .map((s) => `• (${s.category}) ${s.title}: ${s.content}`)
      .join('\n');
    const text = (
      (bullets && `Modo demonstração — sem chaves de modelo configuradas. Com base no nosso conhecimento:
${bullets}

Se quiser respostas reais, configure OPENAI_API_KEY ou ANTHROPIC_API_KEY no backend.`) ||
      'Modo demonstração — sem chaves de modelo configuradas. Compartilhe mais detalhes ou configure as chaves do modelo para respostas completas.'
    );
    return res.json({ text, model: 'default' });
  } catch (error) {
    console.error('Assistant generation error:', error);
    return res.status(500).json({ text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.', model: 'error' });
  }
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
