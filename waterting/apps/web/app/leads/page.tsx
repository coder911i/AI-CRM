'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  X, 
  UserPlus, 
  Phone, 
  Mail, 
  CheckSquare, 
  Square,
  MessageSquare,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCcw,
  Zap
} from 'lucide-react';

const getBadgeStyle = (label: string) => {
  const base = "px-3 py-1 text-[9px] font-black border-2 inline-flex items-center uppercase tracking-widest italic transition-all";
  if (label === 'COLD') return `${base} bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]`;
  if (label === 'WARM') return `${base} bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]`;
  if (label === 'HOT' || label === 'VERY_HOT') return `${base} bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)] shadow-[2px_2px_0px_0px_var(--danger)]`;
  if (label === 'BOOKING_DONE' || label === 'WON') return `${base} bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)] shadow-[2px_2px_0px_0px_var(--success)]`;
  if (label === 'LOST') return `${base} bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border)] opacity-50`;
  return `${base} bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]`;
};

function LeadsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'MANUAL', notes: '' });
  const [creating, setCreating] = useState(false);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Filter & Search State
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    stage: searchParams.get('filter') === 'stale' ? 'STALE' : '',
    source: '',
    intensity: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLeads = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: query,
        stage: filters.stage,
        source: filters.source,
        intensity: filters.intensity
      });
      const response = await api.get<any>(`/leads?${params.toString()}`);
      // Assuming response structure { data: [], totalPages: 1 }
      if (Array.isArray(response)) {
        setLeads(response);
        setTotalPages(1);
      } else {
        setLeads(response.data || []);
        setTotalPages(response.totalPages || 1);
      }
      if (isRefresh) toast.success('Matrix synchronization verified');
    } catch (err: any) {
      toast.error('Failed to interface with entity database');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, query, filters]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      const timer = setTimeout(() => loadLeads(), 300);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, loadLeads]);

  const handleBulkAction = async (action: 'sms' | 'whatsapp' | 'export') => {
    if (selectedIds.length === 0) return toast.error('Zero entities selected for protocol execution');
    setBulkProcessing(true);
    try {
      if (action === 'export') {
        const blob = await api.get<Blob>(`/leads/export?ids=${selectedIds.join(',')}`, { responseType: 'blob' } as any);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prospect_ledger_${new Date().getTime()}.csv`;
        a.click();
        toast.success('Ledger exported to local storage');
      } else {
        await api.post(`/leads/bulk-${action}`, { ids: selectedIds });
        toast.success(`Bulk communication protocol [${action.toUpperCase()}] initialized for ${selectedIds.length} entities`);
      }
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(`Execution failure: ${err.message}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Legal identity label required');
    if (!form.phone.trim()) return toast.error('Communication protocol required');

    setCreating(true);
    try {
      await api.post('/leads', form);
      toast.success('Entity successfully committed to matrix');
      setShowCreate(false);
      setForm({ name: '', phone: '', email: '', source: 'MANUAL', notes: '' });
      loadLeads();
    } catch (err: any) {
      toast.error(`Ingestion protocol failed: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) setSelectedIds([]);
    else setSelectedIds(leads.map(l => l.id));
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] min-h-full p-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-4 border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.25em] mb-3">
               <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
               Global_Entity_Database
            </div>
            <h1 className="text-[26px] font-black text-[var(--text-primary)] uppercase tracking-tight italic flex items-center gap-4">
               Prospect_Distribution_Matrix
            </h1>
            <p className="text-[var(--text-secondary)] text-[11px] font-bold uppercase mt-2 italic">Monitoring {leads.length} identified acquisition targets in current synchronization</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={() => loadLeads(true)}
                disabled={refreshing}
                className="px-6 py-4 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] text-[11px] font-black uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2 italic"
             >
                {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} REFRESH_SYNC
             </button>
             <button id="add-lead-btn" className="px-8 py-4 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[var(--accent)] transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_var(--accent-light)] italic" onClick={() => setShowCreate(true)}>
                <UserPlus size={18} /> INITIALIZE_INTAKE
             </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 bg-[var(--bg-surface)] border-2 border-[var(--border)] p-6 shadow-[6px_6px_0px_0px_var(--border)]">
           <div className="flex-1 min-w-[300px] relative group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
              <input 
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] pl-12 pr-6 py-3 text-[12px] font-black text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none uppercase italic transition-all" 
                 placeholder="QUERY_MATRIX (NAME / PHONE / ID)..." 
              />
           </div>
           
           <div className="flex items-center gap-4">
              <select 
                 value={filters.stage}
                 onChange={(e) => setFilters({...filters, stage: e.target.value})}
                 className="bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[11px] font-black uppercase italic outline-none focus:border-[var(--accent)] appearance-none cursor-pointer"
              >
                 <option value="">PHASE_STATE: ALL</option>
                 <option value="NEW_LEAD">NEW_INTAKE</option>
                 <option value="CONTACTED">ACTIVE_COMMS</option>
                 <option value="INTERESTED">HIGH_PROBABILITY</option>
                 <option value="VISIT_SCHEDULED">SITE_LOGISTICS</option>
                 <option value="STALE">STALE_THRESHOLD</option>
              </select>

              <select 
                 value={filters.source}
                 onChange={(e) => setFilters({...filters, source: e.target.value})}
                 className="bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[11px] font-black uppercase italic outline-none focus:border-[var(--accent)] appearance-none cursor-pointer"
              >
                 <option value="">ORIGIN: ALL</option>
                 <option value="WHATSAPP">WHATSAPP</option>
                 <option value="BROKER">PARTNER_NETWORK</option>
                 <option value="WEBSITE">DIRECT_DOMAIN</option>
              </select>
           </div>
        </div>

        <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[12px_12px_0px_0px_var(--border)] overflow-hidden">
          {selectedIds.length > 0 && (
            <div className="bg-[var(--accent-light)] border-b-2 border-[var(--accent)] px-8 py-4 flex items-center justify-between animate-in slide-in-from-top-2">
               <div className="flex items-center gap-4 text-[var(--accent)]">
                  <Zap size={18} className="animate-pulse" />
                  <span className="text-[11px] font-black uppercase italic tracking-widest">{selectedIds.length} ENTITIES AUTHORIZED FOR BATCH PROTOCOLS</span>
               </div>
               <div className="flex gap-4">
                  <button 
                     disabled={bulkProcessing}
                     onClick={() => handleBulkAction('sms')}
                     className="px-4 py-2 bg-[var(--bg-surface)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-black uppercase hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-2 italic"
                  >
                     {bulkProcessing ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={14} />} EXECUTE_SMS
                  </button>
                  <button 
                     disabled={bulkProcessing}
                     onClick={() => handleBulkAction('whatsapp')}
                     className="px-4 py-2 bg-[var(--bg-surface)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-black uppercase hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-2 italic"
                  >
                     {bulkProcessing ? <Loader2 size={12} className="animate-spin" /> : <Share2 size={14} />} EXECUTE_WHATSAPP
                  </button>
                  <button 
                     disabled={bulkProcessing}
                     onClick={() => handleBulkAction('export')}
                     className="px-4 py-2 bg-[var(--bg-surface)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-black uppercase hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-2 italic"
                  >
                     {bulkProcessing ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />} EXPORT_LEDGER
                  </button>
                  <button onClick={() => setSelectedIds([])} className="ml-4 text-[var(--text-muted)] hover:text-[var(--danger)]"><X size={18} /></button>
               </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-elevated)] text-[10px] font-black uppercase text-[var(--text-secondary)] border-b-2 border-[var(--border)] tracking-[0.2em]">
                  <th className="px-6 py-5 w-12 border-r-2 border-[var(--border)] text-center">
                     <button onClick={toggleSelectAll} className="text-[var(--accent)]">
                        {selectedIds.length === leads.length && leads.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                     </button>
                  </th>
                  <th className="px-8 py-5 border-r-2 border-[var(--border)]">Target_Identity</th>
                  <th className="px-8 py-5 border-r-2 border-[var(--border)]">Phase_State</th>
                  <th className="px-8 py-5 border-r-2 border-[var(--border)] text-center">Intensity_Index</th>
                  <th className="px-8 py-5 border-r-2 border-[var(--border)]">Custodian</th>
                  <th className="px-8 py-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border)]">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                       <td colSpan={6} className="px-8 py-10 bg-[var(--bg-surface)] border-b border-[var(--border)]"></td>
                    </tr>
                  ))
                ) : leads.map((lead) => (
                  <tr 
                     key={lead.id} 
                     className={`hover:bg-[var(--bg-elevated)] transition-colors duration-75 cursor-pointer group ${selectedIds.includes(lead.id) ? 'bg-[var(--accent-light)]' : ''}`} 
                     onClick={() => router.push(`/leads/${lead.id}`)}
                  >
                    <td className="px-6 py-6 border-r-2 border-[var(--border)] text-center" onClick={(e) => toggleSelect(e, lead.id)}>
                       <button className="text-[var(--accent)]">
                          {selectedIds.includes(lead.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                       </button>
                    </td>
                    <td className="px-8 py-6 border-r-2 border-[var(--border)]">
                      <div className="text-[16px] font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase italic leading-none">{lead.name}</div>
                      <div className="flex items-center gap-4 mt-3">
                         <span className="text-[10px] text-[var(--text-muted)] font-black flex items-center gap-1.5 font-mono italic tracking-tighter"><Phone size={12} className="text-[var(--accent)]" /> {lead.phone}</span>
                         {lead.email && <span className="text-[10px] text-[var(--text-muted)] font-black flex items-center gap-1.5 border-l-2 border-[var(--border)] pl-4 font-mono uppercase italic tracking-tighter"><Mail size={12} className="text-[var(--accent)]" /> {lead.email.toUpperCase()}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r-2 border-[var(--border)]">
                       {getBadgeStyle(lead.stage)}
                    </td>
                    <td className="px-8 py-6 border-r-2 border-[var(--border)] min-w-[200px]">
                      {lead.scoreLabel ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-tighter italic">{lead.scoreLabel.toUpperCase()}</span>
                            <span className="text-[14px] font-black text-[var(--accent)] font-mono italic">{lead.score}.0%</span>
                          </div>
                          <div className="h-2.5 w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] overflow-hidden">
                             <div className="h-full bg-[var(--accent)] shadow-[2px_0px_4px_rgba(0,0,0,0.2)]" style={{ width: `${lead.score}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                           <span className="text-[var(--text-muted)] text-[11px] font-black uppercase italic border-2 border-dashed border-[var(--border)] px-4 py-1.5 opacity-40">UNSCORED_LOG</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-[13px] font-black text-[var(--text-primary)] border-r-2 border-[var(--border)] uppercase italic">{lead.assignedTo?.name || 'VOID_PROXY'}</td>
                    <td className="px-8 py-6 text-[11px] font-black text-[var(--text-secondary)] font-mono uppercase italic">
                      {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
                    </td>
                  </tr>
                ))}
                {!leads.length && !loading && (
                  <tr>
                    <td colSpan={6} className="py-48 text-center bg-[var(--bg-surface)]">
                      <div className="space-y-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-[var(--bg-elevated)] border-4 border-dashed border-[var(--border)] text-[var(--text-muted)]">
                           <Users size={48} />
                        </div>
                        <div>
                           <h3 className="text-[20px] font-black text-[var(--text-primary)] uppercase tracking-[0.25em]">MATRIX_VOID_DETECTED</h3>
                           <p className="text-[var(--text-secondary)] text-[12px] font-black uppercase mt-3 italic opacity-60">No prospect identities found in current synchronization cycle</p>
                        </div>
                        <button className="px-12 py-5 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[13px] font-black uppercase tracking-widest mt-10 hover:bg-[var(--accent)] hover:text-white transition-all italic shadow-[6px_6px_0px_0px_var(--accent-light)]" onClick={() => setShowCreate(true)}>INITIALIZE_FIRST_ENTRY</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-[var(--bg-elevated)] px-8 py-5 border-t-4 border-[var(--border)] flex items-center justify-between">
             <div className="text-[11px] font-black text-[var(--text-secondary)] uppercase italic tracking-widest">
                Showing_Segment: <span className="text-[var(--text-primary)]">{leads.length} Entities</span> • Total_Registry_Depth: <span className="text-[var(--text-primary)]">PAGE {page} OF {totalPages}</span>
             </div>
             <div className="flex gap-4">
                <button 
                   disabled={page === 1 || loading}
                   onClick={() => setPage(page - 1)}
                   className="px-5 py-2.5 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 hover:border-[var(--accent)] transition-all"
                >
                   <ChevronLeft size={20} />
                </button>
                <button 
                   disabled={page === totalPages || loading}
                   onClick={() => setPage(page + 1)}
                   className="px-5 py-2.5 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 hover:border-[var(--accent)] transition-all"
                >
                   <ChevronRight size={20} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCreate(false)}>
          <div className="bg-[var(--bg-surface)] w-full max-w-2xl border-4 border-[var(--border)] shadow-[15px_15px_0px_0px_var(--border)] overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="px-10 py-8 border-b-4 border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
               <div>
                  <h3 className="text-[16px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Entity_Intake_Matrix</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] font-black uppercase tracking-tighter mt-2 opacity-70">Authorized Prospect Credentialing [PROTOCOL_V.4]</p>
               </div>
               <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" onClick={() => setShowCreate(false)}>
                  <X size={32} />
               </button>
            </div>
            <form onSubmit={createLead} className="p-10 space-y-10">
               <div className="bg-[var(--accent-light)] border-l-4 border-[var(--accent)] p-5 text-[12px] text-[var(--accent)] font-black uppercase italic leading-relaxed">
                  Initializing new acquisition target identity. All attributes must be verified against primary distribution vectors for integrity.
               </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Legal_Identity_Label</label>
                  <input className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-6 py-4 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase italic placeholder:text-[var(--text-muted)] transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="FULL_NAME_STRING" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Origin_Vector_Class</label>
                  <div className="relative">
                    <select className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-6 py-4 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase italic appearance-none cursor-pointer transition-all" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                      {['MANUAL','WEBSITE','FACEBOOK','GOOGLE','WHATSAPP','PORTAL_99ACRES','PORTAL_MAGICBRICKS','BROKER'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                       <Filter size={20} className="text-[var(--accent)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Comms_Sync_Frequency (Phone)</label>
                  <div className="relative group">
                    <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--accent)] transition-transform group-focus-within:scale-110" />
                    <input className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] pl-16 pr-6 py-4 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono italic transition-all" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 ..." required />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Digital_Credential_Anchor (Email)</label>
                  <div className="relative group">
                    <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--accent)] transition-transform group-focus-within:scale-110" />
                    <input type="email" className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] pl-16 pr-6 py-4 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono uppercase italic placeholder:text-[var(--text-muted)] transition-all" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ENTITY@DOMAIN.COM" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Strategic_Intelligence_Context</label>
                <textarea className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-6 py-4 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none uppercase italic placeholder:text-[var(--text-muted)] transition-all" rows={4} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="INPUT_SITUATION_REPORT_DATA..." />
              </div>

              <div className="flex gap-8 pt-12 border-t-2 border-[var(--border)] border-dashed">
                <button type="button" className="px-10 py-5 text-[13px] font-black text-[var(--text-muted)] hover:text-[var(--danger)] uppercase italic tracking-widest transition-all" onClick={() => setShowCreate(false)}>ABORT_INTAKE</button>
                <button type="submit" className="flex-1 py-6 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[14px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-[var(--accent)] transition-all italic shadow-[10px_10px_0px_0px_var(--accent-light)]" disabled={creating}>
                   {creating ? <div className="flex items-center justify-center gap-4"><Loader2 className="animate-spin" /> SYNCHRONIZING_PROTOCOL...</div> : 'AUTHORIZE_ENTITY_INCLUSION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}

export default function LeadsPage() {
  return (
    <React.Suspense fallback={<CRMLayout><div className="p-8">Loading Matrix...</div></CRMLayout>}>
      <LeadsPageContent />
    </React.Suspense>
  );
}
