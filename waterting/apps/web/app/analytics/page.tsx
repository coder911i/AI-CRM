'use client';
import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      api.get<any>('/analytics/dashboard-report').then(setData).catch(console.error).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  const stats = data?.overview || {
    totalLeads: 0,
    converted: 0,
    conversionRate: 0,
    totalRevenue: 0,
    avgDealSize: 0,
    avgDaysToClose: 0
  };

  return (
    <CRMLayout>
      <div className="page-header">
        <div><h2>Analytics & ROI</h2><p className="subtitle">Performance tracking and lead conversion insights</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="form-select" style={{ width: 150 }} defaultValue="30">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <button className="btn btn-secondary btn-sm">⬇ Export PDF</button>
        </div>
      </div>

      {/* Section 1: Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Leads', val: stats.totalLeads, icon: '👥', color: '#6366f1' },
          { label: 'Conversions', val: stats.converted, icon: '🏆', color: '#10b981' },
          { label: 'Conv. Rate', val: `${stats.conversionRate}%`, icon: '📈', color: '#f59e0b' },
          { label: 'Total Revenue', val: `₹${(stats.totalRevenue / 10000000).toFixed(2)}Cr`, icon: '💰', color: '#ef4444' },
          { label: 'Avg Deal', val: `₹${(stats.avgDealSize / 100000).toFixed(1)}L`, icon: '💎', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="card shadow-sm" style={{ padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Section 2: Revenue Timeline */}
        <div className="card shadow-sm">
          <div className="card-header">Revenue Collection Timeline</div>
          <div style={{ height: 300, padding: '20px 10px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={v => `₹${v / 100000}L`} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 4: Stage Funnel */}
        <div className="card shadow-sm">
          <div className="card-header">Conversion Funnel</div>
          <div style={{ height: 300, padding: '20px 10px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.funnel || []} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" width={120} fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Section 8: Lead Source ROI */}
        <div className="card shadow-sm">
          <div className="card-header">Lead Source ROI Report</div>
          <div style={{ padding: 20 }}>
            <table className="data-table">
              <thead>
                <tr><th>Source</th><th>Leads</th><th>Conv. %</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {(data?.sourceROI || []).map((s: any) => (
                  <tr key={s.source}>
                    <td style={{ fontWeight: 600 }}>{s.source}</td>
                    <td>{s.totalLeads}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${s.conversionRate}%`, height: '100%', background: '#10b981' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{s.conversionRate}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{(s.totalRevenue / 100000).toFixed(1)}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Agent Performance */}
        <div className="card shadow-sm">
          <div className="card-header">Top Performing Agents</div>
          <div style={{ padding: 20 }}>
            <table className="data-table">
              <thead>
                <tr><th>Agent</th><th>Leads</th><th>Visits</th><th>Books</th><th>%</th></tr>
              </thead>
              <tbody>
                {(data?.agentPerformance || []).map((a: any) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td>{a.assignedLeads}</td>
                    <td>{a.siteVisits}</td>
                    <td>{a.bookings}</td>
                    <td><span className="badge badge-success">{a.conversionRate}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
