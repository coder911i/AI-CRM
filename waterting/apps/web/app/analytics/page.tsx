/* eslint-disable */
'use client';
import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const exportPDF = async () => {
    const element = document.getElementById('analytics-report');
    if (!element) return;
    
    const btn = document.getElementById('export-pdf-btn');
    if (btn) btn.innerText = 'PREPARING...';

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CRM-Report-${new Date().toLocaleDateString()}.pdf`);
    } catch (e) {
      console.error('PDF Export failed', e);
    } finally {
      if (btn) btn.innerText = 'Export PDF';
    }
  };

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      api.get<any>('/analytics/dashboard-report').then(setData).catch(console.error).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (authLoading || loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#020617]">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-500/20 rounded-full animate-spin"></div>
    </div>
  );

  const stats = data?.overview || {
    totalLeads: 0, converted: 0, conversionRate: 0, totalRevenue: 0, avgDealSize: 0, avgDaysToClose: 0
  };

  return (
    <CRMLayout>
      <div id="analytics-report" className="p-1 sm:p-4 md:p-6 lg:p-8 space-y-8 bg-white font-sans min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Analytics Studio</h1>
            <p className="text-slate-500">{user?.tenant?.name || 'Skyline Developers'} Performance Review</p>
          </motion.div>
          <div className="flex items-center gap-3">
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold">
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
            <motion.button 
              id="export-pdf-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportPDF}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all border-b-4 border-slate-950 active:border-b-0 uppercase tracking-widest text-xs"
            >
              Export PDF
            </motion.button>
          </div>
        </div>

      {/* Section 1: Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Leads', val: stats.totalLeads, icon: '👥', color: '#6366f1' },
          { label: 'Conversions', val: stats.converted, icon: '🏆', color: '#10b981' },
          { label: 'Conv. Rate', val: `${stats.conversionRate}%`, icon: '📈', color: '#f59e0b' },
          { label: 'Actual Revenue', val: `₹${(stats.totalRevenue / 10000000).toFixed(2)}Cr`, icon: '💰', color: '#ef4444' },
          { label: 'AI Forecasted', val: `₹${(stats.forecastedRevenue / 10000000).toFixed(2)}Cr`, icon: '🤖', color: '#6366f1', sub: 'Next 30 Days' },
        ].map(s => (
          <div key={s.label} className="card shadow-sm" style={{ padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.val}</div>
            {s.sub && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {data?.forecast && (
        <div className="card shadow-lg" style={{ marginBottom: 24, borderLeft: '4px solid #6366f1', background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', padding: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>✨ AI Revenue Forecast</h3>
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Projected performance based on {data.forecast.hotLeadsCount} HOT leads in pipeline</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <span className={`badge ${data.forecast.confidence === 'HIGH' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 12px' }}>
                    {data.forecast.confidence} CONFIDENCE
                 </span>
              </div>
           </div>
           <div style={{ padding: '0 20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                 <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Projected Revenue</div>
                 <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1' }}>₹{(data.forecast.projectedRevenue / 10000000).toFixed(2)} Cr</div>
              </div>
              <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                 <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Expected Conv. Rate</div>
                 <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{data.forecast.expectedConversionRate}%</div>
              </div>
              <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                 <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Key Predictor</div>
                 <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>Pipeline Velocity</div>
              </div>
           </div>
        </div>
      )}

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
      </div>
    </CRMLayout>
  );
}
