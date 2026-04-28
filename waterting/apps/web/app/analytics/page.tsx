'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { 
  Users, 
  Trophy, 
  BarChart3, 
  IndianRupee, 
  Zap, 
  Sparkles, 
  Activity, 
  Download, 
  Calendar, 
  Target, 
  TrendingUp, 
  PieChart as PieIcon,
  ChevronRight,
  Filter,
  ShieldCheck,
  Briefcase,
  UserCheck
} from 'lucide-react';

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
      if (btn) btn.innerText = 'EXPORT PDF';
    }
  };

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      api.get<any>('/analytics/dashboard-report').then(setData).catch(console.error).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (authLoading || loading) return (
    <CRMLayout>
      <div className="p-6 space-y-8 bg-[var(--bg-primary)] min-h-full">
        <div className="h-16 w-full animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>)}
        </div>
        <div className="h-[400px] w-full animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
      </div>
    </CRMLayout>
  );

  const stats = data?.overview || {
    totalLeads: 0, converted: 0, conversionRate: 0, totalRevenue: 0, avgDealSize: 0, avgDaysToClose: 0
  };

  return (
    <CRMLayout>
      <div id="analytics-report" className="min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="sticky top-0 z-40 bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--border)] px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-[24px] font-bold text-[var(--text-primary)] uppercase tracking-wide italic">Strategic Briefing</h1>
              </div>
              <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mt-1">{user?.tenant?.name || 'Authorized'} Portfolio Performance Audit</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-bold uppercase outline-none px-4 py-2">
                <option value="30">Cycle: Last 30 Days</option>
                <option value="90">Cycle: Last 90 Days</option>
              </select>
              <button 
                id="export-pdf-btn"
                onClick={exportPDF}
                className="bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-6 py-2 text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] flex items-center gap-2"
              >
                Export Dossier <Download size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: 'Asset Entrants', val: stats.totalLeads, icon: Users, color: 'text-[var(--accent)]' },
              { label: 'Realized Conversions', val: stats.converted, icon: Trophy, color: 'text-[var(--success)]' },
              { label: 'Efficiency Quotient', val: `${stats.conversionRate}%`, icon: BarChart3, color: 'text-[var(--warning)]' },
              { label: 'Actualized Revenue', val: `₹${(stats.totalRevenue / 10000000).toFixed(2)}Cr`, icon: IndianRupee, color: 'text-[var(--text-primary)]', mono: true },
              { label: 'AI Forecasting', val: `₹${(stats.forecastedRevenue / 10000000).toFixed(2)}Cr`, icon: Zap, color: 'text-[var(--accent)]', sub: 'Next 30 Cycles', mono: true },
            ].map((s, i) => (
              <div key={i} className="bg-[var(--bg-surface)] p-6 border border-[var(--border)] hover:border-[var(--accent)] transition-all relative">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase flex items-center gap-2">
                     <s.icon size={12} className={s.color} /> {s.label}
                  </label>
                  <h3 className={`text-[20px] font-bold text-[var(--text-primary)] tracking-tight uppercase ${s.mono ? 'font-mono' : ''}`}>{s.val}</h3>
                  {s.sub && <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase italic">{s.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {data?.forecast && (
            <div className="bg-[var(--bg-elevated)] border-2 border-[var(--border)] overflow-hidden relative">
               <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
                  <div className="p-8 lg:w-1/3 space-y-4">
                    <div className="flex items-center gap-3">
                       <Sparkles className="text-[var(--accent)]" size={24} />
                       <div>
                          <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider">AI PROJECTION</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-1.5 h-1.5 bg-[var(--success)] animate-pulse" />
                             <span className="text-[9px] font-bold text-[var(--success)] uppercase tracking-wider italic">{data.forecast.confidence} Confidence Level</span>
                          </div>
                       </div>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] font-bold italic uppercase tracking-tight leading-relaxed">System discovery indicates {data.forecast.hotLeadsCount} high-probability assets currently traversing the secondary funnel stages.</p>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-x divide-[var(--border)]">
                     {[
                       { label: 'PROJECTED REVENUE', val: `₹${(data.forecast.projectedRevenue / 10000000).toFixed(2)} Cr`, icon: IndianRupee },
                       { label: 'ESTIMATED VELOCITY', val: `${data.forecast.expectedConversionRate}%`, icon: TrendingUp },
                       { label: 'PIPELINE INTEGRITY', val: 'NOMINAL', icon: ShieldCheck },
                     ].map((item, i) => (
                       <div key={i} className="p-8 space-y-3">
                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                             <item.icon size={12} className="text-[var(--accent)]" /> {item.label}
                          </span>
                          <div className="text-[20px] font-bold text-[var(--text-primary)] font-mono tracking-tight uppercase">{item.val}</div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                 <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                    <Activity size={14} className="text-[var(--accent)]" />
                    Revenue Collection Timeline
                 </h3>
                 <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider italic">Authorized Real-Time Feed</span>
              </div>
              <div className="p-6 h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.revenueTimeline || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} dy={10} />
                    <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 100000}L`} />
                    <Tooltip 
                       contentStyle={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                       itemStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}
                    />
                    <Line type="stepAfter" dataKey="amount" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3, fill: 'var(--bg-surface)', stroke: 'var(--accent)', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                 <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                    <Target size={14} className="text-[var(--accent)]" />
                    Conversion Funnel
                 </h3>
              </div>
              <div className="p-6 h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.funnel || []} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="stage" type="category" width={90} fontSize={9} fontWeight={700} tickFormatter={(val) => String(val).toUpperCase()} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'var(--bg-elevated)' }} contentStyle={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: '10px', fontWeight: '700' }} />
                    <Bar dataKey="count" fill="var(--accent)" barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
              <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} className="text-[var(--accent)]" /> Interaction Density Heatmap
              </h3>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider italic">Global Activity Synchronization</span>
            </div>
            <div className="p-8 overflow-x-auto no-scrollbar">
               <div className="flex gap-2">
                  {Array.from({ length: 52 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      {Array.from({ length: 7 }).map((_, j) => {
                        const opacity = Math.random() > 0.7 ? (Math.random() * 0.8 + 0.2) : 0.05;
                        return (
                          <div 
                            key={j} 
                            className="w-3.5 h-3.5 transition-all hover:scale-125 cursor-pointer border border-[var(--border)]"
                            style={{ 
                              background: opacity > 0.1 ? 'var(--accent)' : 'var(--bg-elevated)',
                              opacity 
                            }} 
                           />
                        );
                      })}
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-6 items-center border-t border-[var(--border)] pt-4">
                  <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider italic leading-none">Inert State</span>
                  <div className="flex gap-2 items-center">
                     {[0.1, 0.4, 0.7, 1].map(o => <div key={o} className="w-2.5 h-2.5 bg-[var(--accent)] border border-[var(--border)]" style={{ opacity: o }} />)}
                     <span className="text-[9px] font-bold text-[var(--text-primary)] uppercase tracking-wider ml-1 italic leading-none">Maximum Intensity</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <Briefcase size={14} className="text-[var(--accent)]" /> Lead Source ROI Briefing
                </h3>
              </div>
              <div className="p-4 flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Source</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase text-right">Inbound</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Efficiency</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {(data?.sourceROI || []).map((s: any) => (
                      <tr key={s.source} className="hover:bg-[var(--bg-elevated)] transition-all">
                        <td className="px-4 py-3 text-[11px] font-bold text-[var(--text-primary)] uppercase">{s.source}</td>
                        <td className="px-4 py-3 text-[11px] font-bold text-[var(--text-primary)] font-mono text-right">{s.totalLeads}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                             <div className="flex-1 h-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden">
                                <div className="h-full bg-[var(--success)]" style={{ width: `${s.conversionRate}%` }} />
                             </div>
                             <span className="text-[10px] font-bold text-[var(--success)] font-mono">{s.conversionRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-bold text-[var(--text-primary)] font-mono text-right italic">₹{(s.totalRevenue / 100000).toFixed(1)}L</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <UserCheck size={14} className="text-[var(--accent)]" /> Operational Efficiency (Top Agents)
                </h3>
              </div>
              <div className="p-4 flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Logistician</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase text-center">Visits</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase text-right">Coefficient</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {(data?.agentPerformance || []).map((a: any) => (
                      <tr key={a.id} className="hover:bg-[var(--bg-elevated)] transition-all">
                        <td className="px-4 py-3 flex items-center gap-3">
                           <div className="w-7 h-7 bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[9px] font-bold text-[var(--text-primary)]">{a.name.charAt(0)}</div>
                           <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase">{a.name}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-bold text-[var(--text-primary)] font-mono text-center">{a.siteVisits}</td>
                        <td className="px-4 py-3 text-right">
                           <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]">{a.conversionRate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
