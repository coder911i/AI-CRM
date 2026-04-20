'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { 
  IndianRupee, 
  FileSignature, 
  Users2, 
  Megaphone, 
  Building2, 
  TrendingUp, 
  Activity, 
  Download, 
  Plus, 
  ChevronRight, 
  Target, 
  BarChart3, 
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Facebook
} from 'lucide-react';

export default function BuilderDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/dashboard/builder')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
       <div className="w-12 h-12 border-2 border-slate-200 border-t-primary rounded-full animate-spin shadow-[0_0_12px_rgba(var(--primary-rgb),0.2)]" />
       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Project State...</span>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Developer Command</h2>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Authorized project performance and revenue synchronization</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              Audit Data <Download size={14} />
           </button>
           <button className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary transition-all flex items-center gap-2 border border-slate-900">
              Initialize Project <Plus size={16} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Realized Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || '0'}`, icon: IndianRupee, color: 'text-slate-900', bg: 'bg-slate-100', trend: '↑ 12%', mono: true },
          { label: 'Booking Protocol', value: stats?.newBookings || '0', icon: FileSignature, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '↑ 5%' },
          { label: 'Strategic Leads', value: stats?.activeLeads || '0', icon: Users2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Marketing ROI', value: '4.2x', icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform ${kpi.color}`}>
               <kpi.icon size={64} />
            </div>
            <div className="relative z-10 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <kpi.icon size={12} className={kpi.color} /> {kpi.label}
              </label>
              <h3 className={`text-2xl font-black text-slate-900 tracking-tighter uppercase ${kpi.mono ? 'font-mono' : ''}`}>{kpi.value}</h3>
              {kpi.trend && (
                <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">
                  <TrendingUp size={10} /> {kpi.trend} vs PREV_CYCLE
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200/60 shadow-lg overflow-hidden group">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
             <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={14} className="text-slate-400" />
                Asset Portfolio Performance Hierarchy
             </h3>
             <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg border border-primary/20 transition-all transition-colors">
                Full Operational Audit
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20">
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Structural Identity</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventory State</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Revenue Realized</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats?.projects?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all group/row">
                    <td className="px-8 py-5">
                       <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover/row:text-primary transition-colors">{p.name}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="space-y-2 max-w-[160px]">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                             <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(p.sold / p.total) * 100}%` }} />
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                             <span>{p.sold} / {p.total} UNITS</span>
                             <span className="text-slate-900 font-mono italic">{Math.round((p.sold / p.total) * 100)}%</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="text-[11px] font-black text-slate-900 font-mono italic tracking-tighter">₹{p.revenue?.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-lg p-8 space-y-8">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-slate-400" /> Lead Synchronization
                 </h4>
                 <ArrowUpRight size={14} className="text-slate-300" />
              </div>
              <div className="space-y-4">
                 {stats?.recentLeads?.map((l: any) => (
                   <div key={l.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary/20 hover:shadow-xl transition-all cursor-pointer group/lead">
                     <div className="space-y-1">
                       <div className="text-[10px] font-black text-slate-900 uppercase group-hover/lead:text-primary transition-colors leading-none">{l.name}</div>
                       <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter italic leading-none">{l.project}</div>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-primary/20 bg-primary/5 text-primary`}>
                        {l.scoreLabel || 'COLD'}
                     </span>
                   </div>
                 ))}
                 <button className="w-full py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary hover:bg-primary/5 rounded-xl border border-dashed border-slate-200 transition-all">
                    Full Lead Dossier Registry
                 </button>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl space-y-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                       <Facebook size={18} fill="currentColor" />
                    </div>
                    <div>
                       <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Active Outreach</h5>
                       <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tight italic leading-none mt-1">Operational</p>
                    </div>
                 </div>
                 <div className="px-2 py-0.5 bg-emerald-500/10 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">4.2x ROI</div>
              </div>

              <div className="relative z-10 space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Financial Allocation</span>
                    <span className="text-[9px] font-black text-white font-mono uppercase tracking-tighter italic">₹45,000 SPENT</span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" style={{ width: '70%' }} />
                 </div>
                 <div className="flex justify-center pt-4">
                    <button className="text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-slate-900 px-8 py-3 rounded-xl border border-white/10 transition-all w-full">
                       Protocol Outreach Master
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
