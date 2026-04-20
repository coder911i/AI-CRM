import { 
  Handshake, 
  ShieldAlert, 
  Clock, 
  ArrowRightLeft, 
  Activity, 
  FileText, 
  MoreHorizontal, 
  User, 
  Building2, 
  ChevronRight,
  TrendingUp,
  Search
} from 'lucide-react';

export default function AdminDeals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/deals').then(res => {
      setDeals(Array.isArray(res) ? res : []);
      setLoading(false);
    }).catch(() => {
      setDeals([]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Allocation Command</h2>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Authorized revenue supervision and allocation intervention</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH TRANSACTIONS..." 
                className="bg-white border border-slate-200 pl-10 pr-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase outline-none focus:ring-4 focus:ring-primary/5 transition-all w-64"
              />
           </div>
           <button className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary transition-all flex items-center gap-3 border border-slate-900">
              Audit Logs <FileText size={14} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Pipeline', value: deals.length, icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Oversight Alerts', value: deals.filter(d => d.fraudFlag).length, icon: ShieldAlert, color: 'text-rose-600' },
          { label: 'Allocation Swap', value: '24H', icon: ArrowRightLeft, color: 'text-emerald-600' },
          { label: 'Registry Uptime', value: '100%', icon: Activity, color: 'text-primary' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 group hover:shadow-xl transition-all">
             <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 ${kpi.color} group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                <kpi.icon size={20} />
             </div>
             <div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</div>
                <div className="text-lg font-black text-slate-900 tracking-tighter uppercase">{kpi.value}</div>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl overflow-hidden group">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Handshake size={14} className="text-slate-400" />
              Corporate Allocation Master Registry
           </h3>
           <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest italic">Live Ledger Synchronization</span>
           </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center gap-6">
             <div className="w-10 h-10 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregating Transactional Data...</span>
          </div>
        ) : deals.length === 0 ? (
          <div className="p-32 text-center flex flex-col items-center gap-6">
             <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                <Activity size={40} />
             </div>
             <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Registry Vacuum</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Zero active transactions discovered in current administrative cycle.</p>
             </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20 border-b border-slate-100">
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction Hash</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Identity</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Logistician / Broker</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol State</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Synchronization</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Oversight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {deals.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-all group/row">
                    <td className="px-8 py-5 text-[10px] font-black text-slate-900 font-mono tracking-tighter uppercase underline decoration-primary/20 decoration-2 underline-offset-4 cursor-help">
                       {d.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[8px] font-black text-white shrink-0">L</div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{d.lead.name}</span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase font-mono">{d.lead.phone}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <User size={12} className="text-slate-400" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{d.broker?.name || 'GENERIC_BUFFER'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border leading-none ${
                         d.fraudFlag 
                         ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' 
                         : d.status === 'CLOSED' 
                         ? 'bg-slate-50 text-slate-400 border-slate-100' 
                         : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      }`}>
                        {d.status} {d.fraudFlag ? '(FLAGGED)' : ''}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">
                          <Clock size={12} /> {new Date(d.updatedAt).toLocaleDateString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-[0.22em] hover:bg-rose-600 transition-all opacity-0 group-hover/row:opacity-100 flex items-center gap-2 ml-auto">
                        Protocol Intervene <ChevronRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
