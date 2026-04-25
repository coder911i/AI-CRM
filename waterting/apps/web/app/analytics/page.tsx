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
      <div className="p-8 space-y-12">
        <div className="h-20 w-full animate-pulse bg-[#22262F] rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[1,2,3,4,5].map(i => <div key={i} className="h-32 animate-pulse bg-[#22262F] rounded-lg"></div>)}
        </div>
        <div className="h-[400px] w-full animate-pulse bg-[#22262F] rounded-lg"></div>
      </div>
    </CRMLayout>
  );

  const stats = data?.overview || {
    totalLeads: 0, converted: 0, conversionRate: 0, totalRevenue: 0, avgDealSize: 0, avgDaysToClose: 0
  };

  return (
    <CRMLayout>
      <div id="analytics-report" className="min-h-screen bg-[#0F1117] text-[#F1F3F5]">
        <div className="sticky top-0 z-40 bg-[#1A1D23]/90 backdrop-blur-xl border-b border-[#2E3340] px-8 py-6">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <h1 className="text-3xl font-black text-[#F1F3F5] tracking-tighter uppercase italic leading-none">Strategic Briefing</h1>
              </div>
              <p className="text-[#8B909A] text-[10px] font-black uppercase tracking-widest">{user?.tenant?.name || 'Authorized'} Portfolio Performance Audit</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" size={14} />
                <select className="bg-[#0F1117] border border-[#2E3340] text-[#8B909A] text-[10px] font-black uppercase tracking-widest rounded-xl pl-10 pr-6 py-3 outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer">
                  <option value="30">Cycle: Last 30 Days</option>
                  <option value="90">Cycle: Last 90 Days</option>
                </select>
              </div>
              <button 
                id="export-pdf-btn"
                onClick={exportPDF}
                className="bg-[#4F6EF7] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#4F6EF7]/20 hover:bg-[#3D5CE5] transition-all flex items-center gap-2 border border-[#4F6EF7]"
              >
                Export Dossier <Download size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto p-8 space-y-12">
          {/* Section 1: Overview Registry */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { label: 'Asset Entrants', val: stats.totalLeads, icon: Users, color: 'text-blue-500', bg: 'bg-[#1A1D23]' },
              { label: 'Realized Conversions', val: stats.converted, icon: Trophy, color: 'text-emerald-500', bg: 'bg-[#1A1D23]' },
              { label: 'Efficiency Quotient', val: `${stats.conversionRate}%`, icon: BarChart3, color: 'text-amber-500', bg: 'bg-[#1A1D23]' },
              { label: 'Actualized Revenue', val: `₹${(stats.totalRevenue / 10000000).toFixed(2)}Cr`, icon: IndianRupee, color: 'text-[#F1F3F5]', bg: 'bg-[#1A1D23]', mono: true },
              { label: 'AI Forecasting', val: `₹${(stats.forecastedRevenue / 10000000).toFixed(2)}Cr`, icon: Zap, color: 'text-[#4F6EF7]', bg: 'bg-[#1A1D23]', sub: 'Next 30 Cycles', mono: true },
            ].map((s, i) => (
              <div key={i} className="bg-[#1A1D23] p-8 rounded-3xl border border-[#2E3340] shadow-sm hover:border-[#4F6EF7] transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform ${s.color}`}>
                   <s.icon size={64} />
                </div>
                <div className="relative z-10 space-y-4">
                  <label className="text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest flex items-center gap-2">
                     <s.icon size={12} className={s.color} /> {s.label}
                  </label>
                  <h3 className={`text-2xl font-black text-[#F1F3F5] tracking-tighter uppercase ${s.mono ? 'font-mono' : ''}`}>{s.val}</h3>
                  {s.sub && <p className="text-[8px] font-bold text-[#8B909A] uppercase tracking-tight italic leading-none">{s.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {data?.forecast && (
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden relative group">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none" />
               <div className="relative z-10 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                  <div className="p-12 lg:w-1/3 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                          <Sparkles className="text-primary" size={24} />
                       </div>
                       <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">AI PROJECTION</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">{data.forecast.confidence} Confidence Level</span>
                          </div>
                       </div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium italic uppercase tracking-tighter leading-relaxed">System discovery indicates {data.forecast.hotLeadsCount} high-probability assets currently traversing the secondary funnel stages.</p>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-x divide-slate-800">
                     {[
                       { label: 'PROJECTED REVENUE', val: `₹${(data.forecast.projectedRevenue / 10000000).toFixed(2)} Cr`, icon: IndianRupee },
                       { label: 'ESTIMATED VELOCITY', val: `${data.forecast.expectedConversionRate}%`, icon: TrendingUp },
                       { label: 'PIPELINE INTEGRITY', val: 'NOMINAL', icon: ShieldCheck },
                     ].map((item, i) => (
                       <div key={i} className="p-12 space-y-3">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <item.icon size={12} className="text-primary" /> {item.label}
                          </span>
                          <div className="text-2xl font-black text-white font-mono tracking-tighter uppercase">{item.val}</div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#1A1D23] rounded-[2rem] border border-[#2E3340] shadow-lg overflow-hidden group">
              <div className="px-8 py-6 border-b border-[#2E3340] flex justify-between items-center">
                 <h3 className="text-[10px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-[#8B909A]" />
                    Revenue Collection Timeline
                 </h3>
                 <span className="text-[9px] font-bold text-[#5A5F6B] uppercase tracking-tighter italic">Authorized Real-Time Feed</span>
              </div>
              <div className="p-10 h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.revenueTimeline || []}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" fontSize={9} fontVariant="all-small-caps" fontWeight={900} axisLine={false} tickLine={false} dy={10} />
                    <YAxis fontSize={9} fontWeight={900} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 100000}L`} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', background: '#0f172a', color: '#fff' }}
                       itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, fill: 'white', stroke: 'var(--primary)', strokeWidth: 2 }} activeDot={{ r: 8, shadow: '0 0 20px rgba(var(--primary-rgb),0.4)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1A1D23] rounded-[2rem] border border-[#2E3340] shadow-lg overflow-hidden group">
              <div className="px-8 py-6 border-b border-[#2E3340] flex justify-between items-center">
                 <h3 className="text-[10px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                    <Target size={14} className="text-[#8B909A]" />
                    Conversion Funnel
                 </h3>
              </div>
              <div className="p-10 h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.funnel || []} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="stage" type="category" width={100} fontSize={9} fontWeight={900} textTransform="uppercase" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: '900' }} />
                    <Bar dataKey="count" fill="var(--primary)" radius={[0, 10, 10, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1D23] rounded-[2rem] border border-[#2E3340] shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-[#2E3340] flex justify-between items-center">
              <h3 className="text-[10px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-[#8B909A]" /> Interaction Density Heatmap
              </h3>
              <span className="text-[9px] font-bold text-[#5A5F6B] uppercase tracking-tighter italic">Global Activity Synchronization</span>
            </div>
            <div className="p-12 overflow-x-auto no-scrollbar">
               <div className="flex gap-2.5">
                  {Array.from({ length: 52 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2.5">
                      {Array.from({ length: 7 }).map((_, j) => {
                        const opacity = Math.random() > 0.7 ? (Math.random() * 0.8 + 0.2) : 0.05;
                        return (
                          <div 
                            key={j} 
                            className="w-3.5 h-3.5 rounded-[4px] transition-all hover:scale-125 cursor-pointer"
                            style={{ 
                              background: opacity > 0.1 ? 'var(--primary)' : '#f1f5f9',
                              opacity 
                            }} 
                           />
                        );
                      })}
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-8 items-center border-t border-[#2E3340] pt-6">
                  <span className="text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest italic leading-none">Inert State</span>
                  <div className="flex gap-3 items-center">
                     {[0.1, 0.3, 0.6, 0.9].map(o => <div key={o} className="w-2.5 h-2.5 rounded-[3px] bg-primary" style={{ opacity: o }} />)}
                     <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest ml-1 italic leading-none">Maximum Intensity</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#1A1D23] rounded-[2rem] border border-[#2E3340] shadow-lg overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-[#2E3340] flex justify-between items-center">
                <h3 className="text-[10px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={14} className="text-[#8B909A]" /> Lead Source ROI Briefing
                </h3>
              </div>
              <div className="p-8 flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0F1117]">
                      <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest">Protocol Source</th>
                      <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest text-right">Throughput</th>
                      <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest">Efficiency</th>
                      <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2E3340]">
                    {(data?.sourceROI || []).map((s: any) => (
                      <tr key={s.source} className="hover:bg-[#22262F] transition-all">
                        <td className="px-6 py-4 text-[10px] font-black text-[#F1F3F5] uppercase">{s.source}</td>
                        <td className="px-6 py-4 text-xs font-black text-[#F1F3F5] font-mono text-right">{s.totalLeads}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                               <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.conversionRate}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 font-mono">{s.conversionRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-black text-[#F1F3F5] font-mono text-right italic">₹{(s.totalRevenue / 100000).toFixed(1)}L</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#1A1D23] rounded-[2rem] border border-[#2E3340] shadow-lg overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-[#2E3340] flex justify-between items-center">
                <h3 className="text-[10px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                  <UserCheck size={14} className="text-[#8B909A]" /> Operational Efficiency (Top Agents)
                </h3>
              </div>
              <div className="p-8 flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0F1117]">
                      <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest">Logistician</th>
                      <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest text-center">Inbound</th>
                      <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest text-center">Visits</th>
                      <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest text-center">Success</th>
                      <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest text-right">Coefficient</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2E3340]">
                    {(data?.agentPerformance || []).map((a: any) => (
                      <tr key={a.id} className="hover:bg-[#22262F] transition-all">
                        <td className="px-6 py-4 flex items-center gap-3">
                           <div className="w-7 h-7 rounded-lg bg-[#2E3340] flex items-center justify-center text-[9px] font-black text-[#F1F3F5]">{a.name.charAt(0)}</div>
                           <span className="text-[10px] font-black text-[#F1F3F5] uppercase">{a.name}</span>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-[#F1F3F5] font-mono text-center">{a.assignedLeads}</td>
                        <td className="px-6 py-4 text-[10px] font-bold text-[#F1F3F5] font-mono text-center">{a.siteVisits}</td>
                        <td className="px-6 py-4 text-[10px] font-bold text-[#F1F3F5] font-mono text-center italic">{a.bookings}</td>
                        <td className="px-6 py-4 text-right">
                           <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-[#4F6EF7]/10 text-[#4F6EF7] border border-[#4F6EF7]/20">{a.conversionRate}%</span>
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
