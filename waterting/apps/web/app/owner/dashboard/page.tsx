import { 
  Building2, 
  TrendingUp, 
  CalendarCheck, 
  IndianRupee, 
  Activity, 
  Target, 
  ChevronRight, 
  ArrowUpRight, 
  Clock,
  Briefcase
} from 'lucide-react';

export default function OwnerDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/owner/dashboard').then(setStats);
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Portfolio Intelligence</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Authorized investment state synchronization</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Live Market Feed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Structural Assets', value: stats?.propertyCount || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Market Velocity', value: stats?.activeInquiries || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Logistic Visits', value: stats?.visitsThisWeek || 0, icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Realized Value', value: '₹8.5Cr', icon: IndianRupee, color: 'text-slate-900', bg: 'bg-slate-100', mono: true },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform ${kpi.color}`}>
               <kpi.icon size={64} />
            </div>
            <div className="relative z-10 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <kpi.icon size={12} className={kpi.color} /> {kpi.label}
              </label>
              <h3 className={`text-3xl font-black text-slate-900 tracking-tighter uppercase ${kpi.mono ? 'font-mono' : ''}`}>{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden group">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
             <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-slate-400" />
                Asset Movement Briefing
             </h3>
             <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-offset-4">Full Registry <ChevronRight size={12} className="inline ml-1" /></button>
          </div>
          <div className="p-12 text-center flex flex-col items-center gap-6">
             <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                <Target size={40} className="text-slate-200" />
             </div>
             <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Analytics Synchronization Pending</h4>
                <p className="text-[11px] text-slate-400 font-medium italic uppercase tracking-tighter max-w-[280px] mx-auto leading-relaxed">System is currently aggregating localized market data to generate structural performance projections.</p>
             </div>
             <div className="flex gap-4 pt-4">
                <div className="flex flex-col items-center px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Latency</span>
                   <span className="text-sm font-black text-slate-900 font-mono">1.2s</span>
                </div>
                <div className="flex flex-col items-center px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Integrity</span>
                   <span className="text-sm font-black text-emerald-600 font-mono">100%</span>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden group flex flex-col justify-between min-h-[400px]">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
           <div className="relative z-10">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-8">
                 <Briefcase size={14} className="text-primary" /> Sector Allocation
              </label>
              <div className="space-y-6">
                 {[
                   { label: 'Residential Suites', pct: 64, color: 'bg-primary' },
                   { label: 'Commercial Units', pct: 22, color: 'bg-white' },
                   { label: 'Underwriting Assets', pct: 14, color: 'bg-slate-700' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black text-white uppercase tracking-tight">{item.label}</span>
                         <span className="text-[10px] font-black text-slate-500 font-mono">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-800">
                         <div className={`h-full ${item.color} transition-all duration-1000 delay-100 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]`} style={{ width: `${item.pct}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <button className="relative z-10 w-full mt-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-2 group">
              Download Sector Analysis <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
}
