import React, { useEffect, useMemo, useState } from 'react';
import Button from './ui/Button';
import { ContentService, GeneratedPost } from '@/src/services/contentService';
import { PersonaPref } from '@/src/services/assistant/personaPref';
import { useTranslation } from 'react-i18next';

interface Metrics {
  totalMessages: number;
  avgResponseTime: number;
  handovers: number;
  messages24h: number;
  leadsCount: number;
}

const DashboardWidget: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [limits, setLimits] = useState<{ allowedPerMonth: number; used: number; remaining: number } | null>(null);
  const [topic, setTopic] = useState('');
  const [persona, setPersona] = useState<string>(PersonaPref.get());
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
    if (open) {
      loadAll();
    }
  }, [open]);

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

  const [calendar, setCalendar] = useState<{ date: string; slot: string; reason: string }[]>([]);
  const loadCalendar = async () => {
    const res = await ContentService.getCalendar(locale);
    setCalendar(res.suggestions);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!open && (
        <Button onClick={() => setOpen(true)} className="bg-emerald-600 text-white rounded-full px-4 py-2 shadow">
          Dashboard
        </Button>
      )}
      {open && (
        <div className="w-[420px] max-h-[70vh] overflow-y-auto bg-white rounded-lg shadow-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Dashboard</h3>
            <button onClick={() => setOpen(false)} className="font-semibold" aria-label="Close">
              x
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 rounded bg-gray-100">Msgs: {metrics?.totalMessages ?? 0}</div>
            <div className="p-2 rounded bg-gray-100">Avg ms: {Math.round(metrics?.avgResponseTime ?? 0)}</div>
            <div className="p-2 rounded bg-gray-100">Handovers: {metrics?.handovers ?? 0}</div>
            <div className="p-2 rounded bg-gray-100">Leads: {metrics?.leadsCount ?? 0}</div>
          </div>
          <div className="border-t pt-2">
            <div className="text-sm mb-2">Limite mensal: {limits?.remaining ?? 0} restantes de {limits?.allowedPerMonth ?? 3}</div>
            <div className="flex gap-2 mb-2">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Tema do post (opcional)"
                className="flex-grow border rounded p-2"
              />
              <select
                value={persona}
                onChange={(e) => {
                  setPersona(e.target.value);
                  // persist as global preference for the assistant prompt
                  // @ts-ignore
                  PersonaPref.set(e.target.value);
                }}
                className="border rounded p-2"
              >
                <option value="visionario">Persona: Visionário</option>
                <option value="tecnico">Persona: Técnico</option>
                <option value="coach">Persona: Coach</option>
              </select>
            </div>
            <Button disabled={loading || (limits?.remaining ?? 0) <= 0} onClick={generate} className="bg-blue-600 text-white px-3 py-2 rounded">
              {loading ? 'Gerando...' : 'Gerar post'}
            </Button>
          </div>
          <div className="border-t pt-2 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Posts</h4>
              <Button onClick={loadCalendar} className="bg-gray-200 text-gray-900 px-2 py-1 rounded">Calendário</Button>
            </div>
            {calendar.length > 0 && (
              <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                {calendar.map((s) => (
                  <div key={s.date} className="flex justify-between gap-2">
                    <span>{s.slot}</span>
                    <span className="text-gray-500">{s.reason}</span>
                  </div>
                ))}
              </div>
            )}
            {posts.length === 0 && <div className="text-sm text-gray-500">Nenhum post gerado ainda.</div>}
            {posts.map((p) => (
              <div key={p.id} className="border rounded p-2 text-sm">
                <div className="text-xs text-gray-500 mb-1">{new Date(p.createdAt).toLocaleString()}</div>
                <pre className="whitespace-pre-wrap">{p.content}</pre>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs ${p.approved ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {p.approved ? 'Aprovado' : 'Pendente'}
                  </span>
                  {!p.approved && (
                    <Button onClick={() => approve(p.id)} className="bg-emerald-600 text-white px-2 py-1 rounded">Aprovar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWidget;
