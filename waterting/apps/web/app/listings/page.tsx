import { 
  Building2, 
  ExternalLink, 
  RefreshCcw, 
  Trash2, 
  Plus, 
  LayoutGrid, 
  Layers, 
  Globe, 
  IndianRupee, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  ChevronRight,
  Filter,
  Search,
  X
} from 'lucide-react';

const PLATFORMS = ['99ACRES', 'MAGICBRICKS', 'HOUSING', 'WEBSITE'];

export default function ListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', platform: 'WEBSITE', projectId: '' });
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      Promise.all([
        api.get<any[]>('/listings'),
        api.get<any[]>('/projects'),
      ]).then(([l, p]) => {
        setListings(Array.isArray(l) ? l : []);
        setProjects(Array.isArray(p) ? p : []);
      }).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const handleCreate = async () => {
    if (!form.title || !form.price || !form.platform) return;
    await api.post('/listings', { ...form, price: parseFloat(form.price) });
    setShowForm(false);
    setForm({ title: '', description: '', price: '', platform: 'WEBSITE', projectId: '' });
    api.get<any[]>('/listings').then(setListings);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/listings/${id}`);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  if (authLoading || loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-sm z-50">
       <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregating Market Presence...</span>
       </div>
    </div>
  );

  return (
    <CRMLayout>
      <div className="max-w-[1400px] mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Market Ledger</h2>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Authorized multichannel asset distribution registry</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="FILTER ENTRIES..." 
                  className="bg-white border border-slate-200 pl-10 pr-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase outline-none focus:ring-4 focus:ring-primary/5 transition-all w-64 shadow-sm"
                />
             </div>
             <button className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary transition-all flex items-center gap-2 border border-slate-900" onClick={() => setShowForm(true)}>
                Initialize Listing <Plus size={16} />
             </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-[2rem] border-2 border-primary shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   <LayoutGrid size={14} className="text-primary" /> Listing Initialization Protocol
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-rose-600 transition-colors">
                   <X size={16} />
                </button>
             </div>
             <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Designation *</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                    value={form.title} 
                    onChange={e => setForm({ ...form, title: e.target.value })} 
                    placeholder="3BHK PREMIUM ACQUISITION" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valuation (₹) *</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-xl text-xs font-bold font-mono tracking-tight outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                    type="number" 
                    value={form.price} 
                    onChange={e => setForm({ ...form, price: e.target.value })} 
                    placeholder="7500000" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Channel *</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none" 
                      value={form.platform} 
                      onChange={e => setForm({ ...form, platform: e.target.value })}
                    >
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <Layers className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Structural Linkage</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none" 
                      value={form.projectId} 
                      onChange={e => setForm({ ...form, projectId: e.target.value })}
                    >
                      <option value="">INDEPENDENT_ASSET</option>
                      {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <Building2 className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                  </div>
                </div>
                <div className="space-y-4 md:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Briefing Context</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-xl text-xs font-medium tracking-tight outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none" 
                    rows={3} 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-50">
                   <button className="px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors" onClick={() => setShowForm(false)}>Abort Phase</button>
                   <button className="px-10 py-3.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all border border-primary" onClick={handleCreate}>Finalize Initialization</button>
                </div>
             </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
             <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-slate-400" /> Active Channel Distribution Registry
             </h3>
             <div className="flex items-center gap-4">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{listings.length} Entries Operational</span>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20 border-b border-slate-100">
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Designation</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Strategic Value</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Portal Channel</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Structural Link</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">State / Synchronization</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Oversight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {listings.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-all group/row">
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-1 group-hover/row:text-primary transition-colors">{l.title}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase font-mono italic">#{l.id.slice(-6).toUpperCase()}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-[11px] font-black text-slate-900 font-mono italic tracking-tighter">₹{(l.price / 100000).toFixed(1)}L</span>
                    </td>
                    <td className="px-8 py-5">
                       <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white border border-slate-200 shadow-sm text-slate-600">
                          {l.platform}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <Building2 size={12} className="text-slate-300" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {l.project?.name ?? 'UNLINKED_ASSET'}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                             l.status === 'ACTIVE' 
                             ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
                             : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                            {l.status}
                          </span>
                          {l.syncStatus?.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase font-mono italic whitespace-nowrap">
                               <Clock size={10} /> {new Date(l.syncStatus[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-2.5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-primary transition-all flex items-center gap-2 group/sync" 
                          onClick={async () => {
                            try {
                              await api.post(`/listings/${l.id}/sync`, { portals: [l.platform] });
                              api.get<any[]>('/listings').then(setListings);
                            } catch (e) { console.error('Sync failure'); }
                          }}
                        >
                          Administrative Sync <RefreshCcw size={12} className="group-hover/sync:rotate-180 transition-transform duration-500" />
                        </button>
                        <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all shadow-sm" onClick={() => handleDelete(l.id)}>
                           <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && (
                  <tr>
                     <td colSpan={6} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-6">
                           <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                              <Search size={40} />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Registry Vacuum</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Zero multichannel assets discovered in current administrative cycle.</p>
                           </div>
                        </div>
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
