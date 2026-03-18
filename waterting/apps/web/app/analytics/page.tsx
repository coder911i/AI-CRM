'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [funnel, setFunnel] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      Promise.all([
        api.get<any[]>('/analytics/funnel'),
        api.get<any[]>('/analytics/sources'),
        api.get<any[]>('/analytics/agents'),
      ]).then(([f, s, a]) => { setFunnel(f); setSources(s); setAgents(a); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const askAI = async () => {
    if (!question.trim()) return;
    try {
      const res = await api.post<{ answer: string }>('/analytics/ask', { question });
      setAiAnswer(res.answer);
    } catch (err: any) { setAiAnswer('Error: ' + err.message); }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  const maxFunnel = Math.max(...funnel.map(f => f.count), 1);

  return (
    <CRMLayout>
      <div className="page-header"><div><h2>Analytics</h2><p className="subtitle">Sales funnel, sources, and AI insights</p></div></div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24}}>
        <div className="card">
          <div className="card-header">Sales Funnel</div>
          {funnel.map(f => (
            <div key={f.stage} style={{marginBottom: 12}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}>
                <span>{f.stage?.replace(/_/g, ' ')}</span>
                <span style={{fontWeight: 600}}>{f.count}</span>
              </div>
              <div style={{height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden'}}>
                <div style={{width: `${(f.count / maxFunnel) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 4, transition: 'width 0.5s ease'}} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">Lead Sources</div>
          {sources.map(s => (
            <div key={s.source} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)'}}>
              <span className={`badge source-${s.source?.toLowerCase()}`}>{s.source?.replace(/_/g, ' ')}</span>
              <span style={{fontWeight: 600}}>{s.count}</span>
            </div>
          ))}
          {!sources.length && <p style={{color: 'var(--text-muted)', fontSize: 13}}>No data yet</p>}
        </div>
      </div>

      <div className="card" style={{marginBottom: 24}}>
        <div className="card-header">Agent Performance</div>
        <table className="data-table">
          <thead><tr><th>Agent</th><th>Leads</th><th>Visits</th></tr></thead>
          <tbody>
            {agents.map((a: any) => (
              <tr key={a.id}><td style={{fontWeight: 600}}>{a.name}</td><td>{a._count?.leads ?? 0}</td><td>{a._count?.siteVisits ?? 0}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">Ask AI</div>
        <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
          <input className="form-input" placeholder="e.g. Which source has best conversion?" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI()} />
          <button className="btn btn-primary" onClick={askAI}>Ask</button>
        </div>
        {aiAnswer && <div style={{padding: 16, background: '#F9FAFB', borderRadius: 8, fontSize: 14, lineHeight: 1.6}}>{aiAnswer}</div>}
      </div>
    </CRMLayout>
  );
}
