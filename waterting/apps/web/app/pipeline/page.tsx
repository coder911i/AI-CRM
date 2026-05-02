'use client';

import React, { useEffect, useState, useCallback } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Loader2, 
  RefreshCcw, 
  CheckSquare, 
  Square,
  Users,
  ChevronRight,
  Zap,
  MoreVertical,
  UserPlus,
  ArrowRight
} from 'lucide-react';

const stages = [
  { key: 'NEW_LEAD', label: 'NEW_INTAKE', color: 'var(--accent)' },
  { key: 'CONTACTED', label: 'ACTIVE_COMMS', color: 'var(--warning)' },
  { key: 'INTERESTED', label: 'HIGH_PROBABILITY', color: 'var(--success)' },
  { key: 'VISIT_SCHEDULED', label: 'SITE_LOGISTICS', color: 'var(--accent)' },
  { key: 'VISIT_DONE', label: 'VISIT_VERIFIED', color: 'var(--success)' },
  { key: 'NEGOTIATION', label: 'TERMS_PENDING', color: 'var(--warning)' },
  { key: 'BOOKING_DONE', label: 'UNIT_RESERVED', color: 'var(--success)' },
  { key: 'LOST', label: 'PHASE_TERMINATED', color: 'var(--text-muted)' },
];

export default function PipelinePage() {
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  
  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState({
    agentId: '',
    source: '',
    search: '',
  });

  // Bulk Selection State
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState<'reassign' | 'stage' | null>(null);
  const [bulkPayload, setBulkPayload] = useState<any>({});
  const [executingBulk, setExecutingBulk] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [l, a] = await Promise.all([
        api.get<any[]>('/leads'),
        api.get<any[]>('/auth/users'),
      ]);
      setLeads(Array.isArray(l) ? l : []);
      setAgents(Array.isArray(a) ? a : []);
      if (isRefresh) toast.success('Pipeline matrix synchronized');
    } catch (err) {
      toast.error('Failed to interface with pipeline core');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) loadData();
  }, [user, authLoading, loadData, router]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('lead:scored', () => loadData(true));
    socket.on('lead:updated', () => loadData(true));
    socket.on('lead:new', () => loadData(true));

    return () => {
      socket.off('lead:scored');
      socket.off('lead:updated');
      socket.off('lead:new');
    };
  }, [socket, loadData]);

  const handleDragStart = (leadId: string) => setDraggedLead(leadId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleDrop = async (stage: string) => {
    if (!draggedLead) return;
    const leadId = draggedLead;
    setDraggedLead(null);
    setUpdatingLeadId(leadId);

    try {
      await api.patch(`/leads/${leadId}/stage`, { stage });
      toast.success(`Entity migrated to ${stage.replace('_', ' ')}`);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage } : l));
    } catch (err: any) {
      toast.error(`Migration failure: ${err.message}`);
      loadData();
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const executeBulkAction = async () => {
    if (!bulkPayload.assignedToId && showBulkModal === 'reassign') return toast.error('Selection required');
    if (!bulkPayload.stage && showBulkModal === 'stage') return toast.error('Selection required');

    setExecutingBulk(true);
    try {
      await api.post('/leads/bulk', {
        action: showBulkModal === 'reassign' ? 'REASSIGN' : 'STAGE_CHANGE',
        leadIds: selectedLeads,
        payload: bulkPayload
      });
      toast.success(`Batch protocol executed for ${selectedLeads.length} entities`);
      setShowBulkModal(null);
      setSelectedLeads([]);
      setBulkPayload({});
      loadData();
    } catch (err: any) {
      toast.error(`Execution error: ${err.message}`);
    } finally {
      setExecutingBulk(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesAgent = !filters.agentId || l.assignedToId === filters.agentId;
    const matchesSource = !filters.source || l.source === filters.source;
    const matchesSearch = !filters.search || 
      l.name.toLowerCase().includes(filters.search.toLowerCase()) || 
      l.phone.includes(filters.search);
    return matchesAgent && matchesSource && matchesSearch;
  });

  const toggleLeadSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (authLoading || loading) {
    return (
      <CRMLayout>
        <div className="p-10 space-y-8 bg-[var(--bg-primary)] min-h-screen">
          <div className="h-12 w-64 animate-pulse bg-[var(--bg-elevated)] border-2 border-[var(--border)]"></div>
          <div className="flex gap-8 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-80 h-[700px] animate-pulse bg-[var(--bg-elevated)] border-2 border-[var(--border)] shrink-0 shadow-[8px_8px_0px_0px_var(--border)]"></div>
            ))}
          </div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-10 min-h-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-4 border-[var(--border)]">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.25em] mb-3">
               <div className="w-2 h-2 bg-[var(--accent)]" />
               Operational_Distribution_Matrix
            </div>
            <h1 className="text-[26px] font-black text-[var(--text-primary)] uppercase tracking-tight italic">Tactical_Pipeline_Core</h1>
            <p className="text-[var(--text-secondary)] text-[11px] font-bold uppercase mt-2 italic tracking-widest">{filteredLeads.length} Active identities detected in current segment</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="px-6 py-4 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] text-[11px] font-black uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2 italic"
             >
                {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} REFRESH_MATRIX
             </button>
             <button className="px-8 py-4 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[var(--accent)] transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_var(--accent-light)] italic" onClick={() => router.push('/leads')}>
                <UserPlus size={18} /> INITIALIZE_ENTRY
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[var(--bg-surface)] border-2 border-[var(--border)] p-6 shadow-[6px_6px_0px_0px_var(--border)]">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">SEARCH_IDENTIFIER</label>
            <div className="relative group">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
               <input 
                 className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] pl-12 pr-4 py-3 text-[12px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase placeholder:text-[var(--text-muted)] italic transition-all" 
                 placeholder="QUERY NAME OR PHONE..." 
                 value={filters.search} 
                 onChange={e => setFilters({...filters, search: e.target.value})} 
               />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">CUSTODIAN_FOCUS</label>
            <select className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[12px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none cursor-pointer italic" value={filters.agentId} onChange={e => setFilters({...filters, agentId: e.target.value})}>
              <option value="">ALL_FUNCTIONAL_UNITS</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">ORIGIN_VECTOR</label>
            <select className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[12px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none cursor-pointer italic" value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})}>
              <option value="">ALL_VECTORS</option>
              {['FACEBOOK', 'GOOGLE', 'WHATSAPP', '99ACRES', 'MAGICBRICKS', 'MANUAL', 'BROKER'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar h-[calc(100vh-340px)]">
          {stages.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
            return (
              <div key={stage.key} className="bg-[var(--bg-surface)] border-2 border-[var(--border)] w-80 min-w-[320px] flex flex-col shadow-[8px_8px_0px_0px_var(--border)] group/column" onDragOver={handleDragOver} onDrop={() => handleDrop(stage.key)}>
                <div className="flex justify-between items-center px-6 py-4 border-b-4 border-[var(--border)] bg-[var(--bg-elevated)] sticky top-0 z-10">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-3 italic">
                    <div className="w-2.5 h-2.5" style={{ backgroundColor: stage.color }} />
                    {stage.label}
                  </span>
                  <span className="bg-[var(--accent-light)] text-[var(--accent)] text-[10px] font-black border-2 border-[var(--accent)] px-3 py-1 italic">{stageLeads.length}</span>
                </div>
                <div className="flex-1 p-5 space-y-5 overflow-y-auto no-scrollbar bg-[var(--bg-primary)]/30">
                  {stageLeads.map(lead => (
                    <div 
                      key={lead.id} 
                      className={`bg-[var(--bg-surface)] border-2 p-5 cursor-grab active:cursor-grabbing transition-all group relative animate-in fade-in slide-in-from-bottom-2 duration-300 ${draggedLead === lead.id ? 'opacity-30' : ''} ${selectedLeads.includes(lead.id) ? 'border-[var(--accent)] shadow-[6px_6px_0px_0px_var(--accent-light)]' : 'border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[6px_6px_0px_0px_var(--border)]'}`}
                      draggable 
                      onDragStart={() => handleDragStart(lead.id)}
                      onClick={() => router.push(`/leads/${lead.id}`)}
                    >
                      {updatingLeadId === lead.id && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                           <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                        </div>
                      )}
                      
                      <div 
                        onClick={(e) => toggleLeadSelection(lead.id, e)}
                        className={`absolute top-4 right-4 w-5 h-5 border-2 transition-all flex items-center justify-center ${selectedLeads.includes(lead.id) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white border-[var(--border)] hover:border-[var(--accent)]'}`}
                      >
                         {selectedLeads.includes(lead.id) && <CheckSquare size={14} className="text-white" />}
                      </div>

                      <div className="text-[15px] font-black text-[var(--text-primary)] mb-2 pr-8 uppercase tracking-tight italic group-hover:text-[var(--accent)] transition-colors leading-none">{lead.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mb-6 font-mono font-black italic tracking-tighter flex items-center gap-2"><Phone size={12} className="text-[var(--accent)]" /> {lead.phone}</div>
                      
                      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 border-dashed mt-2">
                        <div className="flex gap-2">
                          {lead.scoreLabel && <span className="bg-[var(--bg-elevated)] border border-[var(--border)] px-2 py-0.5 text-[9px] font-black text-[var(--text-secondary)] uppercase italic tracking-tighter">{lead.scoreLabel}</span>}
                          <span className="bg-[var(--accent-light)] border border-[var(--accent)] px-2 py-0.5 text-[9px] font-black text-[var(--accent)] uppercase italic tracking-tighter">{lead.source}</span>
                        </div>
                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase italic">INTAKE_S.01</div>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="py-20 text-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50">
                       <Zap size={24} className="mx-auto mb-4 opacity-20" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] italic opacity-40">COLUMN_INERT_VOID</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bulk Action Controls */}
        {selectedLeads.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[var(--accent)] border-2 border-[var(--accent)] px-10 py-5 shadow-[12px_12px_0px_0px_var(--accent-light)] flex items-center gap-10 animate-in slide-in-from-bottom-10 duration-500">
             <div className="flex items-center gap-4 text-white">
                <Zap size={24} className="animate-pulse" />
                <div className="flex flex-col">
                   <span className="text-[14px] font-black uppercase tracking-widest italic">{selectedLeads.length} ENTITIES TARGETED</span>
                   <span className="text-[10px] font-black uppercase opacity-70">BATCH_PROTOCOL_AUTHORIZATION_PENDING</span>
                </div>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={() => setShowBulkModal('reassign')}
                  className="px-6 py-3 bg-white text-[var(--accent)] text-[11px] font-black uppercase border-2 border-transparent hover:bg-[var(--bg-surface)] transition-all italic flex items-center gap-2"
                >
                   <Users size={16} /> CUSTODIAN_REASSIGNMENT
                </button>
                <button 
                  onClick={() => setShowBulkModal('stage')}
                  className="px-6 py-3 bg-white text-[var(--accent)] text-[11px] font-black uppercase border-2 border-transparent hover:bg-[var(--bg-surface)] transition-all italic flex items-center gap-2"
                >
                   <ArrowRight size={16} /> PHASE_MIGRATION
                </button>
                <button onClick={() => setSelectedLeads([])} className="text-white hover:text-red-200 ml-4"><X size={24} /></button>
             </div>
          </div>
        )}

        {showBulkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[var(--bg-surface)] w-full max-w-md border-4 border-[var(--border)] shadow-[20px_20px_0px_0px_var(--border)] overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b-4 border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
                <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest italic flex items-center gap-3">
                   <Zap size={20} className="text-[var(--accent)]" />
                   BATCH_{showBulkModal === 'reassign' ? 'REASSIGNMENT' : 'MIGRATION'}_PROTOCOL
                </h3>
                <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" onClick={() => setShowBulkModal(null)}><X size={32} /></button>
              </div>
              <div className="p-10 space-y-10">
                <div className="p-5 bg-[var(--accent-light)] border-l-4 border-[var(--accent)]">
                   <p className="text-[var(--accent)] text-[12px] font-black uppercase italic leading-relaxed tracking-tight">TARGET VOLUME: {selectedLeads.length} IDENTITIES AUTHORIZED FOR BATCH OVERRIDE</p>
                </div>
              
              {showBulkModal === 'reassign' ? (
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">NEW_CUSTODIAN_PROXY</label>
                  <select className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-6 py-4 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none cursor-pointer italic" onChange={e => setBulkPayload({ assignedToId: e.target.value })}>
                    <option value="">SELECT_OPERATIONAL_AGENT</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()}</option>)}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">NEW_PROCESS_PHASE</label>
                  <select className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-6 py-4 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none cursor-pointer italic" onChange={e => setBulkPayload({ stage: e.target.value })}>
                    <option value="">SELECT_TARGETING_STAGE</option>
                    {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-6 pt-8 border-t-2 border-[var(--border)] border-dashed">
                <button className="px-10 py-4 text-[13px] font-black text-[var(--text-muted)] hover:text-[var(--danger)] uppercase italic tracking-widest transition-all" onClick={() => setShowBulkModal(null)}>ABORT_PROTOCOL</button>
                <button 
                  disabled={executingBulk}
                  className="flex-1 py-5 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[14px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-[var(--accent)] transition-all italic shadow-[8px_8px_0px_0px_var(--accent-light)] flex items-center justify-center gap-4" 
                  onClick={executeBulkAction}
                >
                   {executingBulk ? <Loader2 size={18} className="animate-spin" /> : 'AUTHORIZE_BATCH'}
                </button>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
