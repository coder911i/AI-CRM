import { 
  Users2, 
  Calendar, 
  Handshake, 
  Trophy, 
  Zap, 
  ArrowUpRight, 
  Target, 
  Activity, 
  ChevronRight, 
  ShieldCheck, 
  BarChart3,
  IndianRupee
} from 'lucide-react';

export default function BrokerDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/broker-portal/dashboard').then(setStats);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Partner Yield Briefing</h2>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Authorized partner performance and revenue synchronization</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              Operational Logs <Activity size={14} />
           </button>
           <button className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary transition-all flex items-center gap-2 border border-slate-900">
              New Acquisition <Zap size={16} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Assigned Leads Today', value: stats?.assignedLeadsToday || '0', icon: Users2, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'ACTIVE_ALLOCATION' },
          { label: 'Upcoming Logistics', value: stats?.upcomingVisits || '0', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'SCHEDULED' },
          { label: 'Revenue Pipeline', value: `₹${stats?.commissionPipeline?.toLocaleString() || '0'}`, icon: Handshake, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'PENDING_CYCLE', mono: true },
          { label: 'Partner Standing', value: stats?.rating || '0.0', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'VERIFIED' },
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
              <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                <Target size={10} className={kpi.color} /> {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl overflow-hidden group">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
             <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Target size={14} className="text-slate-400" />
                Strategic Lead Allocation Registry
             </h3>
             <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary hover:text-white px-4 py-2 rounded-xl border border-primary/20 transition-all">
                Full Allocation Master
             </button>
          </div>
          
          <div className="p-12 text-center">
             <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100 mx-auto">
                   <Target size={40} />
                </div>
                <div className="space-y-2">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Allocation Synchronization</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic leading-relaxed">
                      Assigned leads from the CRM intelligence engine will appear here. Establish communication protocol immediately upon receipt.
                   </p>
                </div>
                <button className="text-[10px] font-black text-white bg-slate-900 px-8 py-3.5 rounded-xl uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/10">
                   Await Synchronization Protocol
                </button>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-10 border border-white/5 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Partner Compliance Certified</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Authorized for high-value asset brokerage operations</p>
                 </div>
              </div>
              <button className="bg-white text-slate-900 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-2xl">
                 Download Credentials
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
