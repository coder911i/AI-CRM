import { Users2, Plus, Search, Filter, Download, ChevronRight, Phone, Mail, Fingerprint, Percent, Activity, X } from 'lucide-react';

export default function BrokersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', commissionPct: 2.0 });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { api.get<any[]>('/brokers').then(setBrokers).catch(console.error).finally(() => setLoading(false)); }
  }, [user, authLoading]);

  const createBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/brokers', form);
      setShowCreate(false);
      api.get<any[]>('/brokers').then(setBrokers);
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                 <Users2 size={28} className="text-primary" />
                 Channel Partners
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Registry of {brokers.length} authorized brokerage entities</p>
           </div>
           <div className="flex gap-2">
              <button className="btn btn-secondary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 border-slate-200 shadow-sm">
                 <Download size={14} /> Export Network
              </button>
              <button className="btn btn-primary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20" onClick={() => setShowCreate(true)}>
                 <Plus size={14} /> Initialize Partner
              </button>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Activity size={14} className="text-slate-400" />
                 Active Network Registry
              </h3>
              <div className="flex items-center gap-4">
                 <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">BETA: PARTNER SYNC ENABLED</span>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/10 border-b border-slate-50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner Identity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inception Contact</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield %</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attributed Assets</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referral ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {brokers.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => router.push(`/brokers/${b.id}`)}>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-black text-white border border-slate-800 shadow-xl">
                               {b.name ? b.name[0] : 'P'}
                            </div>
                            <span className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight uppercase">{b.name}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-700 tracking-tighter flex items-center gap-1.5 lowercase">
                               <Mail size={12} className="text-slate-300" /> {b.email || 'PROTOCOL_VOID'}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 tracking-widest flex items-center gap-1.5 uppercase">
                               <Phone size={10} /> {b.phone}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-1 text-sm font-black text-slate-900 font-mono">
                            <Percent size={12} className="text-slate-300" />
                            {b.commissionPct}
                         </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-xs font-bold text-slate-500">
                         {b._count?.leads ?? 0}
                      </td>
                      <td className="px-6 py-5">
                         <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                            <Fingerprint size={12} className="text-slate-300" />
                            <code className="text-[10px] font-black text-slate-600 font-mono">{b.referralCode}</code>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${
                            b.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                         }`}>
                            {b.isActive ? 'OPERATIONAL' : 'DEACTIVATED'}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="inline-flex p-2 rounded-lg bg-slate-50 text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                            <ChevronRight size={16} />
                         </div>
                      </td>
                    </tr>
                  ))}
                  
                  {!brokers.length && (
                    <tr>
                      <td colSpan={7} className="py-32 text-center bg-white">
                        <div className="space-y-4">
                           <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4 text-slate-200 shadow-inner border border-slate-100">
                              <Users2 size={32} />
                           </div>
                           <div>
                              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Partner Grid Void</h4>
                              <p className="text-[11px] text-slate-400 font-medium italic mt-1 max-w-[250px] mx-auto uppercase tracking-tighter">No authorized brokerage entities discovered in current network scan.</p>
                           </div>
                           <button className="btn btn-secondary text-[10px] font-black uppercase tracking-widest mt-6" onClick={() => setShowCreate(true)}>Initialize Primary Partner</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Partner Onboarding</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Authorized Agent Credentialing</p>
               </div>
               <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400" onClick={() => setShowCreate(false)}>
                  <X size={20} />
               </button>
            </div>
            
            <form onSubmit={createBroker} className="p-8 space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Descriptor *</label>
                 <div className="relative">
                    <Users2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300" placeholder="LEGAL BUSINESS NAME" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Signal *</label>
                    <div className="relative">
                       <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all font-mono" placeholder="+91 ..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yield Factor %</label>
                    <div className="relative">
                       <Percent size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input type="number" step="0.5" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/10 transition-all font-mono" value={form.commissionPct} onChange={e => setForm({...form, commissionPct: parseFloat(e.target.value)})} />
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Channel</label>
                 <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="email" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300" placeholder="PARTNER@PROTOCOL.COM" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                 </div>
              </div>

              <div className="pt-4">
                 <button type="submit" className="w-full btn btn-primary py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all">
                    Finalize Partner Authorization
                 </button>
                 <p className="text-[9px] text-slate-300 font-bold text-center mt-4 uppercase tracking-tighter">System generated referral code will be attributed immediately.</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
