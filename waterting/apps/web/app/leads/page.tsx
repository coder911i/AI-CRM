import { Plus, Users, Search, Filter, MoreHorizontal, X, UserPlus, Phone, Mail, Globe } from 'lucide-react';

const scoreColor = (label: string) => {
  switch (label) { case 'COLD': return 'badge-cold'; case 'WARM': return 'badge-warm'; case 'HOT': return 'badge-hot'; case 'VERY_HOT': return 'badge-very-hot'; default: return ''; }
};

const sourceClass = (source: string) => `source-${source?.toLowerCase().replace(/_/g, '-')}`;

export default function LeadsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'MANUAL', notes: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) loadLeads();
  }, [user, authLoading]);

  const loadLeads = () => {
    api.get<any[]>('/leads').then(setLeads).catch(console.error).finally(() => setLoading(false));
  };

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/leads', form);
      setShowCreate(false);
      setForm({ name: '', phone: '', email: '', source: 'MANUAL', notes: '' });
      loadLeads();
    } catch (err: any) { alert(err.message); }
    finally { setCreating(false); }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Users size={24} className="text-primary" />
               Global Prospect Ledger
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Foundational database: {leads.length} entities tracked</p>
          </div>
          <div className="flex gap-3">
             <button className="btn btn-secondary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4">
                <Filter size={14} /> Filter
             </button>
             <button id="add-lead-btn" className="btn btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4" onClick={() => setShowCreate(true)}>
                <UserPlus size={14} /> Initialize Lead
             </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <table className="data-table">
            <thead>
              <tr className="bg-slate-50/50">
                <th>Entity Identity</th>
                <th>Phase</th>
                <th>Intelligence Score</th>
                <th>Custodian</th>
                <th>Origin</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 cursor-pointer group transition-colors" onClick={() => router.push(`/leads/${lead.id}`)}>
                  <td>
                    <div className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm">{lead.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>
                       {lead.email && <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 border-l border-slate-200 pl-2"><Mail size={10} /> {lead.email.split('@')[0]}...</span>}
                    </div>
                  </td>
                  <td>
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-blue-50 text-primary border border-blue-100">
                        {lead.stage?.replace(/_/g, ' ')}
                      </span>
                  </td>
                  <td>
                    {lead.scoreLabel ? (
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${scoreColor(lead.scoreLabel)}`}>
                          {lead.scoreLabel}
                        </span>
                        <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-slate-900" style={{ width: `${lead.score}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="text-xs font-medium text-slate-600">{lead.assignedTo?.name || 'Unassigned'}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${sourceClass(lead.source)}`}>
                      {lead.source?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td>
                     <button className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400">
                        <MoreHorizontal size={16} />
                     </button>
                  </td>
                </tr>
              ))}
              {!leads.length && (
                <tr>
                  <td colSpan={7}>
                    <div className="py-24 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4 text-slate-300">
                         <Users size={32} />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Database Clear</h3>
                      <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">No prospects have been logged in the system yet. All intake ledger entries will appear here.</p>
                      <button className="mt-6 btn btn-secondary text-xs uppercase font-bold" onClick={() => setShowCreate(true)}>Create Initial Entry</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <UserPlus size={18} className="text-primary" />
                 Initialize Entity Intake
              </h3>
              <button className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setShowCreate(false)}>
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={createLead} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group scroll-m-20">
                  <label className="form-label">Full Identity</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Michael Chen" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Classification Source</label>
                  <select className="form-select" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                    {['MANUAL','WEBSITE','FACEBOOK','GOOGLE','WHATSAPP','PORTAL_99ACRES','PORTAL_MAGICBRICKS','BROKER'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Primary Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 ..." required />
                </div>
                <div className="form-group">
                  <label className="form-label">Correspondence Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="entity@domain.com" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Internal Context / Notes</label>
                <textarea className="form-textarea" rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Provide initial situation report..." />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" className="btn btn-secondary flex-1 font-bold uppercase text-[11px]" onClick={() => setShowCreate(false)}>Abondon</button>
                <button type="submit" className="btn btn-primary flex-1 font-bold uppercase text-[11px]" disabled={creating}>
                   {creating ? 'Processing...' : 'Authorize Inclusion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
