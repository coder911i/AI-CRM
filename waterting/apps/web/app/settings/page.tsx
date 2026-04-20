import { 
  Users2, 
  Building, 
  BellRing, 
  GitMerge, 
  History, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Eye, 
  X,
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ROLES = [
  { value: 'TENANT_ADMIN', label: 'TENANT ADMIN', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { value: 'SALES_MANAGER', label: 'SALES MANAGER', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { value: 'SALES_AGENT', label: 'SALES AGENT', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { value: 'ACCOUNTS', label: 'ACCOUNTS', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { value: 'BROKER', label: 'BROKER', color: 'bg-slate-50 text-slate-500 border-slate-100' },
];

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('team');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', password: 'User@1234', role: 'SALES_AGENT' });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditFilter, setAuditFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && activeTab === 'team') {
      fetchUsers();
    } else if (user && activeTab === 'audit') {
      fetchAuditLogs();
    } else if (user) {
      setLoading(false);
    }
  }, [user, authLoading, activeTab, auditPage, auditFilter, auditActionFilter]);

  const fetchAuditLogs = async () => {
    try {
      let url = `/users/audit-logs?page=${auditPage}`;
      if (auditFilter) url += `&entity=${auditFilter}`;
      if (auditActionFilter) url += `&action=${auditActionFilter}`;
      const data = await api.get<any>(url);
      setAuditLogs(data.logs);
      setAuditTotal(data.total);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get<any[]>('/auth/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id: string) => {
    await api.patch(`/auth/users/${id}/toggle-status`, {});
    fetchUsers();
  };

  const handleInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) return alert('Name and Email are required');
    await api.post('/auth/create-staff', inviteForm);
    setShowInviteModal(false);
    fetchUsers();
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  const tabs = [
    { id: 'team', label: 'Team Management', icon: Users2, roles: ['TENANT_ADMIN', 'SALES_MANAGER'] },
    { id: 'profile', label: 'Company Profile', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'pipeline', label: 'Pipeline Stages', icon: GitMerge },
    { id: 'audit', label: 'Audit Log', icon: History, roles: ['TENANT_ADMIN'] },
  ].filter(t => !t.roles || t.roles.includes(user?.role || ''));

  return (
    <CRMLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Command Center</h1>
              <p className="text-slate-400 text-sm font-medium mt-1 lowercase tracking-widest text-[10px] font-black uppercase">Authorized system and organizational overrides</p>
           </div>
        </div>

        <div className="flex gap-10">
          <aside className="w-64 flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} className={activeTab === tab.id ? 'text-primary' : 'text-slate-400'} />
                {tab.label}
              </button>
            ))}
            <div className="mt-10 pt-6 border-t border-slate-50">
               <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 transition-all" onClick={logout}>
                  <LogOut size={16} /> Deauthorize System
               </button>
            </div>
          </aside>

          <main className="flex-1 space-y-6">
            {activeTab === 'team' && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Users2 size={14} className="text-slate-400" />
                    Internal Directory
                  </h3>
                  <button className="btn btn-primary btn-xs flex items-center gap-2 text-[9px] px-4" onClick={() => setShowInviteModal(true)}>
                    <UserPlus size={12} /> INITIALIZE STAFF
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/10 border-b border-slate-50 font-mono">
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">State</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map(u => {
                        const role = ROLES.find(r => r.value === u.role);
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/30 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 shadow-sm uppercase">{u.name?.charAt(0)}</div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 tracking-tight uppercase">{u.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 lowercase">{u.email}</span>
                                 </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${role?.color}`}>
                                 {u.role.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                 {u.isActive ? 'OPERATIONAL' : 'SUSPENDED'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {u.id !== user?.sub && (
                                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors underline decoration-slate-200 underline-offset-4" onClick={() => toggleUserStatus(u.id)}>
                                  {u.isActive ? 'SUSPEND' : 'ACTIVATE'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-8 space-y-8">
                <div className="border-b border-slate-50 pb-6">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Building size={14} className="text-slate-400" />
                    Corporation Framework
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Identity</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all uppercase" defaultValue="Skyline Developers" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RERA Authorization</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all font-mono uppercase" placeholder="UPRERAPRJXXXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Command Signal Email</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all lowercase" defaultValue={user?.email} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Insignia Path</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all" placeholder="https://..." />
                  </div>
                </div>
                <div className="pt-4">
                   <button className="btn btn-primary px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20">Authorize Commits</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-8">
                <div className="border-b border-slate-50 pb-6 mb-4">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <BellRing size={14} className="text-slate-400" />
                    Information Broadcast Logic
                  </h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { id: 'n1', label: 'Authorization Signal on lead allocation', default: true },
                    { id: 'n2', label: 'Messaging Protocol on stage shift', default: true },
                    { id: 'n3', label: 'End-of-cycle diagnostic summary', default: false },
                    { id: 'n4', label: 'Operational site-visit proximity markers', default: true },
                  ].map(n => (
                    <div key={n.id} className="flex items-center justify-between py-5 group">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-tight group-hover:text-slate-900 transition-colors">{n.label}</span>
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" defaultChecked={n.default} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'pipeline' && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-8">
                <div className="border-b border-slate-50 pb-6 mb-8 flex justify-between items-center">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <GitMerge size={14} className="text-slate-400" />
                    Pipeline Evolution Logic
                  </h3>
                  <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter bg-rose-50 px-2 py-1 rounded border border-rose-100">Immutability Lock Enabled</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mb-8 leading-relaxed uppercase tracking-tighter">Current trajectory states are synchronized with internal reporting frameworks. Structural modifications are restricted.</p>
                <div className="flex flex-wrap gap-3">
                  {['NEW_LEAD', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'NEGOTIATION', 'BOOKING_DONE', 'LOST'].map(s => (
                    <span key={s} className="px-3 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg border border-slate-800">
                       {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <History size={14} className="text-slate-400" />
                      Global Execution Registry
                   </h3>
                   <div className="flex gap-4">
                      <select className="bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/10 transition-all outline-none" value={auditFilter} onChange={e => setAuditFilter(e.target.value)}>
                         <option value="">ALL ENTITIES</option>
                         {['LEAD','BOOKING','PAYMENT','REFUND','USER','PROJECT'].map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <select className="bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/10 transition-all outline-none" value={auditActionFilter} onChange={e => setAuditActionFilter(e.target.value)}>
                        <option value="">ALL ACTIONS</option>
                        {['CREATE','UPDATE','DELETE','LOGIN','VERIFY'].map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/10 border-b border-slate-50">
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Timestamp</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity Signature</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol Action</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {auditLogs.map(log => (
                        <React.Fragment key={log.id}>
                          <tr className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500 font-mono italic">
                               {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-[9px] font-black text-white border border-slate-800 shadow-sm uppercase">{log.user?.name?.charAt(0) || 'S'}</div>
                                  <div className="flex flex-col">
                                     <span className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">{log.user?.name || 'SYSTEM_SYNC'}</span>
                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{log.entity} <code className="text-slate-300">#{log.entityId.slice(-6)}</code></span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                 log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                 log.action === 'DELETE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                 'bg-slate-50 text-slate-600 border-slate-100'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <ChevronRight size={14} className={`text-slate-300 transition-transform ${expandedLog === log.id ? 'rotate-90 text-primary' : ''}`} />
                            </td>
                          </tr>
                          {expandedLog === log.id && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={4} className="px-8 py-8 border-l-4 border-primary">
                                 <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                          <AlertCircle size={10} /> Antecedent State
                                       </div>
                                       <pre className="bg-white p-6 rounded-xl border border-slate-100 text-[9px] font-mono font-bold text-slate-500 overflow-x-auto shadow-inner h-48">{JSON.stringify(log.oldData, null, 2) || 'NONE_RECORDED'}</pre>
                                    </div>
                                    <div className="space-y-3">
                                       <div className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                          <CheckCircle2 size={10} /> Mutation Execution
                                       </div>
                                       <pre className="bg-white p-6 rounded-xl border border-slate-100 text-[9px] font-mono font-bold text-slate-900 overflow-x-auto shadow-inner h-48">{JSON.stringify(log.newData, null, 2)}</pre>
                                    </div>
                                 </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-8 py-5 flex justify-between items-center bg-slate-50/50 border-t border-slate-50">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{auditTotal} SYSTEM EVOCATIONS REGISTERED</span>
                   <div className="flex gap-2">
                      <button className="btn btn-secondary px-4 py-2 text-[9px] font-black uppercase tracking-widest" disabled={auditPage === 1} onClick={() => setAuditPage(auditPage - 1)}>ANTECEDENT</button>
                      <span className="px-4 py-2 text-[10px] font-black text-slate-900 border border-slate-100 bg-white rounded-lg">{auditPage}</span>
                      <button className="btn btn-secondary px-4 py-2 text-[9px] font-black uppercase tracking-widest" disabled={auditLogs.length < 50} onClick={() => setAuditPage(auditPage + 1)}>SUBSEQUENT</button>
                   </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Protocol Initiation</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Staff Authorization Sequence</p>
               </div>
               <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400" onClick={() => setShowInviteModal(false)}>
                  <X size={20} />
               </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Identifier</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/10 transition-all uppercase" placeholder="LEGAL STAFF NAME" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Transmission Hash</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all lowercase" placeholder="EMAIL@PROTOCOL.IO" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} />
               </div>
               <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorization Tier</label>
                   <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/10 transition-all uppercase appearance-none" value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}>
                     {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                   </select>
               </div>
               <div className="pt-4">
                  <button className="w-full btn btn-primary py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all font-mono" onClick={handleInvite}>
                     EXECUTE AUTHORIZATION
                  </button>
                  <p className="text-[9px] text-slate-300 font-bold text-center mt-6 uppercase tracking-tighter italic">Credentials will be transmitted via encrypted channel.</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
