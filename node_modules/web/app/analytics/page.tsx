'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [funnel, setFunnel] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      Promise.all([
        api.get<any[]>('/analytics/funnel'),
        api.get<any[]>('/analytics/sources'),
        api.get<any[]>('/analytics/agents'),
      ]).then(([f, s, a]) => { 
        setFunnel(f); 
        setSources(s.map(x => ({ ...x, name: x.source }))); 
        setAgents(a); 
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const askAI = async () => {
    if (!question.trim()) return;
    setAsking(true);
    try {
      const res = await api.post<any>('/analytics/ask', { question });
      setAiResponse(res);
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setAsking(false); }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="page-header"><div><h2>Analytics</h2><p className="subtitle">Data-driven insights and AI strategy</p></div></div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24}}>
        <div className="card">
          <div className="card-header" style={{marginBottom: 20}}>Sales Funnel Tracking</div>
          <div style={{height: 300}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" width={120} fontSize={12} tickFormatter={(v) => v.replace(/_/g, ' ')} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{marginBottom: 20}}>Leads by Source</div>
          <div style={{height: 300}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sources} dataKey="count" nameKey="source" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {sources.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom: 24}}>
        <div className="card-header">Ask AI Assistant</div>
        <div style={{display: 'flex', gap: 8, marginBottom: 20}}>
          <input className="form-input" placeholder="e.g. Which source has best conversion?" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI()} />
          <button className="btn btn-primary" onClick={askAI} disabled={asking}>{asking ? 'Thinking...' : 'Analyze'}</button>
        </div>
        
        {aiResponse && (
          <div style={{display:'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, padding: 20, background: '#F8FAFC', borderRadius: 12, border: '1px solid var(--border)'}}>
            <div>
              <div style={{fontSize: 12, color:'var(--primary)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase'}}>AI Insights</div>
              <p style={{fontSize: 15, lineHeight: 1.6, color: 'var(--text)'}}>{aiResponse.answer}</p>
              <p style={{marginTop: 12, fontSize: 11, color:'var(--text-muted)'}}>Analyzed at {new Date(aiResponse.timestamp).toLocaleTimeString()}</p>
            </div>
            
            <div style={{height: 250, background: 'white', borderRadius: 8, padding: 12, border: '1px solid #E2E8F0'}}>
               <ResponsiveContainer width="100%" height="100%">
                  {aiResponse.chartType?.toUpperCase() === 'BAR' ? (
                    <BarChart data={aiResponse.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="stage" fontSize={10} tickFormatter={(v) => v.slice(0, 4)} />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : aiResponse.chartType?.toUpperCase() === 'PIE' ? (
                    <PieChart>
                      <Pie data={aiResponse.chartData} dataKey="count" nameKey="source" outerRadius={60}>
                         {aiResponse.chartData.map((e:any, index:number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <LineChart data={aiResponse.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="stage" fontSize={10} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} />
                    </LineChart>
                  )}
               </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">Agent Conversion & Performance</div>
        <table className="data-table">
          <thead><tr><th>Agent</th><th>Assigned Leads</th><th>Visits Attempted</th><th>Conversion</th></tr></thead>
          <tbody>
            {agents.map((a: any) => (
              <tr key={a.id}>
                <td style={{fontWeight: 600}}>{a.name}</td>
                <td>{a._count?.leads ?? 0}</td>
                <td>{a._count?.siteVisits ?? 0}</td>
                <td>{a._count?.leads > 0 ? ((a._count?.siteVisits / a._count?.leads) * 100).toFixed(1) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CRMLayout>
  );
}
