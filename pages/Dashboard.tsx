import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { ContentService, GeneratedPost } from '@/src/services/contentService';
import { PersonaPref } from '@/src/services/assistant/personaPref';

interface Metrics {
  totalMessages: number;
  avgResponseTime: number;
  handovers: number;
  messages24h: number;
  leadsCount: number;
}

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [limits, setLimits] = useState<{ allowedPerMonth: number; used: number; remaining: number } | null>(null);
  const [topic, setTopic] = useState('');
  const [persona, setPersona] = useState<string>(PersonaPref.get());
  const [calendar, setCalendar] = useState<Array<{ date: string; slot: string; reason: string }>>([]);
  const [loading, setLoading] = useState(false);

  const locale = useMemo(() => (i18n.language.startsWith('en') ? 'en' : i18n.language.startsWith('es') ? 'es' : 'pt'), [i18n.language]);

  const loadAll = async () => {
    try {
      const [metricsRes, postsRes, limitsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/dashboard/metrics`).then((r) => r.json()),
        ContentService.listPosts(),
        ContentService.getLimits()
      ]);
      setMetrics(metricsRes);
      setPosts(postsRes);
      setLimits(limitsRes);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const { post, remaining } = await ContentService.generatePost({ topic, persona, locale });
      setPosts((p) => [post, ...p]);
      setLimits((l) => (l ? { ...l, remaining } : l));
      setTopic('');
    } catch (e) {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    setLoading(true);
    try {
      const { post } = await ContentService.approvePost(id);
      setPosts((p) => p.map((x) => (x.id === id ? post : x)));
    } catch (e) {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const loadCalendar = async () => {
    const res = await ContentService.getCalendar(locale);
    setCalendar(res.suggestions);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-200">
      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <a href="/" className="text-sm text-slate-400 hover:text-white underline">Voltar</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700">
            <div className="text-sm text-slate-400">Mensagens</div>
            <div className="text-2xl font-semibold">{metrics?.totalMessages ?? 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700">
            <div className="text-sm text-slate-400">Tempo médio (ms)</div>
            <div className="text-2xl font-semibold">{Math.round(metrics?.avgResponseTime ?? 0)}</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700">
            <div className="text-sm text-slate-400">Handovers</div>
            <div className="text-2xl font-semibold">{metrics?.handovers ?? 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700">
            <div className="text-sm text-slate-400">Leads</div>
            <div className="text-2xl font-semibold">{metrics?.leadsCount ?? 0}</div>
          </div>
        </div>

        <div className="rounded-lg bg-slate-800/60 border border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Gerar posts (limite mensal: {limits?.remaining ?? 0} restantes)</div>
            <div className="flex gap-2">
              <select
                value={persona}
                onChange={(e) => {
                  setPersona(e.target.value);
                  // @ts-ignore
                  PersonaPref.set(e.target.value);
                }}
                className="bg-slate-900 border border-slate-700 rounded p-2 text-sm"
              >
                <option value="visionario">Visionário</option>
                <option value="tecnico">Técnico</option>
                <option value="coach">Coach</option>
              </select>
              <Button onClick={loadCalendar} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded">Calendário</Button>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Tema do post (opcional)"
              className="flex-grow bg-slate-900 border border-slate-700 rounded p-2 text-sm"
            />
            <Button disabled={loading || (limits?.remaining ?? 0) <= 0} onClick={generate} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
              {loading ? 'Gerando...' : 'Gerar post'}
            </Button>
          </div>
          {calendar.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-700 rounded p-3">
              <div className="text-sm font-semibold mb-2">Sugestões de calendário</div>
              <div className="space-y-1 text-sm">
                {calendar.map((s) => (
                  <div key={s.date} className="flex justify-between">
                    <span>{s.slot}</span>
                    <span className="text-slate-400">{s.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-slate-800/60 border border-slate-700 p-4">
          <div className="text-lg font-semibold mb-3">Posts gerados</div>
          {posts.length === 0 && <div className="text-sm text-slate-400">Nenhum post gerado.</div>}
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.id} className="border border-slate-700 rounded p-3 bg-slate-900/60">
                <div className="text-xs text-slate-400 mb-1">{new Date(p.createdAt).toLocaleString()}</div>
                <pre className="whitespace-pre-wrap text-sm text-slate-200">{p.content}</pre>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs ${p.approved ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {p.approved ? 'Aprovado' : 'Pendente'}
                  </span>
                  {!p.approved && (
                    <Button onClick={() => approve(p.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded">
                      Aprovar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

