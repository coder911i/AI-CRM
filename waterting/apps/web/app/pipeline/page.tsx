'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const stages = [
  { key: 'NEW_LEAD', label: 'New Lead', color: '#6B7280' },
  { key: 'CONTACTED', label: 'Contacted', color: '#3B82F6' },
  { key: 'INTERESTED', label: 'Interested', color: '#F59E0B' },
  { key: 'VISIT_SCHEDULED', label: 'Visit Scheduled', color: '#8B5CF6' },
  { key: 'VISIT_DONE', label: 'Visit Done', color: '#10B981' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: '#EF4444' },
  { key: 'BOOKING_DONE', label: 'Booking Done', color: '#059669' },
  { key: 'LOST', label: 'Lost', color: '#9CA3AF' },
];

export default function PipelinePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

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

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { 
      Promise.all([
        api.get<any[]>('/leads'),
        api.get<any[]>('/auth/staff').catch(() => []), // Graceful fallback
      ]).then(([l, a]) => {
        setLeads(Array.isArray(l) ? l : []);
        setAgents(Array.isArray(a) ? a : []);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const handleDragStart = (leadId: string) => setDraggedLead(leadId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (stage: string) => {
    if (!draggedLead) return;
    setLeads(prev => prev.map(l => l.id === draggedLead ? { ...l, stage } : l));
    const leadId = draggedLead;
    setDraggedLead(null);
    try {
      await api.patch(`/leads/${leadId}/stage`, { stage });
    } catch (err) {
      api.get<any[]>('/leads').then(setLeads);
    }
  };

  const executeBulkAction = async () => {
    try {
      await api.post('/leads/bulk', {
        action: showBulkModal,
        leadIds: selectedLeads,
        payload: bulkPayload
      });
      setShowBulkModal(null);
      setSelectedLeads([]);
      api.get<any[]>('/leads').then(setLeads);
    } catch (err) {
      alert('Bulk action failed');
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesAgent = !filters.agentId || l.assignedToId === filters.agentId;
    const matchesSource = !filters.source || l.source === filters.source;
    const matchesSearch = !filters.search || l.name.toLowerCase().includes(filters.search.toLowerCase()) || l.phone.includes(filters.search);
    return matchesAgent && matchesSource && matchesSearch;
  });

  const toggleLeadSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (authLoading || loading) {
    return (
      <CRMLayout>
        <div className="p-8 space-y-6">
          <div className="h-12 w-64 animate-pulse bg-[#22262F] rounded-lg"></div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-72 h-[600px] animate-pulse bg-[#22262F] rounded-lg shrink-0"></div>
            ))}
          </div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="bg-[#0F1117] p-6 min-h-full">
      <div className="page-header">
        <div><h2 className="text-2xl font-bold text-[#F1F3F5] mb-1">Pipeline</h2><p className="text-[#8B909A] text-sm">{filteredLeads.length} leads in funnel</p></div>
        <div style={{display:'flex', gap: 12}}>
          {selectedLeads.length > 0 && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkModal('reassign')}>Reassign ({selectedLeads.length})</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkModal('stage')}>Update Stage</button>
            </>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/leads')}>+ New Lead</button>
        </div>
      </div>

      <div className="card" style={{marginBottom: 20, display:'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: '12px 20px'}}>
        <div className="form-group" style={{marginBottom:0}}>
          <input 
            className="form-input" 
            placeholder="Search name or phone..." 
            value={filters.search} 
            onChange={e => setFilters({...filters, search: e.target.value})} 
          />
        </div>
        <div className="form-group" style={{marginBottom:0}}>
          <select className="form-select" value={filters.agentId} onChange={e => setFilters({...filters, agentId: e.target.value})}>
            <option value="">All Agents</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{marginBottom:0}}>
          <select className="form-select" value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})}>
            <option value="">All Sources</option>
            {['FACEBOOK', 'GOOGLE', 'WHATSAPP', '99ACRES', 'MAGICBRICKS', 'MANUAL'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="kanban-board overflow-x-auto min-w-max pb-4">
        {stages.map(stage => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
          return (
            <div key={stage.key} className="bg-[#1A1D23] border border-[#2E3340] rounded-xl w-72 min-w-[288px] p-3 flex-shrink-0" onDragOver={handleDragOver} onDrop={() => handleDrop(stage.key)}>
              <div className="kanban-column-header flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8B909A] px-1" style={{borderBottom: `2px solid ${stage.color}`, paddingBottom: 4}}>
                  {stage.label}
                </span>
                <span className="bg-[#22262F] text-[#5A5F6B] text-xs rounded-full px-2 py-0.5">{stageLeads.length}</span>
              </div>
              <div style={{minHeight: 200}}>
                {stageLeads.map(lead => (
                  <div key={lead.id} className={`bg-[#22262F] border border-[#2E3340] rounded-lg p-4 mb-2 hover:border-[#4F6EF7] transition-colors duration-150 cursor-grab active:cursor-grabbing ${draggedLead === lead.id ? 'opacity-50' : ''} ${selectedLeads.includes(lead.id) ? 'ring-2 ring-[#4F6EF7]' : ''}`}
                    draggable onDragStart={() => handleDragStart(lead.id)}
                    style={{borderLeftColor: stage.color, borderLeftWidth: 3, position: 'relative'}}
                    onClick={() => router.push(`/leads/${lead.id}`)}>
                    
                    <div 
                      onClick={(e) => toggleLeadSelection(lead.id, e)}
                      style={{
                        position: 'absolute', top: 8, right: 8, width: 16, height: 16, 
                        borderRadius: 4, border: '1px solid var(--border)', 
                        background: selectedLeads.includes(lead.id) ? 'var(--primary)' : 'white',
                        cursor: 'pointer'
                      }}
                    />

                    <div className="text-sm font-medium text-[#F1F3F5] mb-1 pr-6">{lead.name}</div>
                    <div className="text-xs text-[#8B909A] mb-3">{lead.phone}</div>
                    <div className="kanban-card-meta">
                      {lead.scoreLabel && <span className={`badge ${lead.scoreLabel === 'COLD' ? 'badge-cold' : lead.scoreLabel === 'WARM' ? 'badge-warm' : lead.scoreLabel === 'HOT' ? 'badge-hot' : 'badge-very-hot'}`} style={{fontSize: 10}}>{lead.scoreLabel}</span>}
                      <span className={`badge source-${lead.source?.toLowerCase()}`} style={{fontSize: 10}}>{lead.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1A1D23] w-full max-w-sm rounded-3xl shadow-2xl border border-[#2E3340] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-[#2E3340] flex justify-between items-center bg-[#0F1117]">
              <h3 className="text-sm font-black text-[#F1F3F5] uppercase tracking-widest">Bulk {showBulkModal === 'reassign' ? 'Reassign' : 'Update Stage'}</h3>
              <button className="p-2 hover:bg-[#22262F] rounded-xl transition-colors text-[#8B909A]" onClick={() => setShowBulkModal(null)}>&times;</button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-[#8B909A] text-sm">Selected: {selectedLeads.length} leads</p>
            
            {showBulkModal === 'reassign' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest ml-1">New Agent</label>
                <select className="w-full px-4 py-3 bg-[#0F1117] border border-[#2E3340] text-[#F1F3F5] rounded-xl text-sm font-black focus:ring-2 focus:ring-[#4F6EF7]/10 transition-all uppercase appearance-none" onChange={e => setBulkPayload({ assignedToId: e.target.value })}>
                  <option value="">Select Agent</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest ml-1">New Stage</label>
                <select className="w-full px-4 py-3 bg-[#0F1117] border border-[#2E3340] text-[#F1F3F5] rounded-xl text-sm font-black focus:ring-2 focus:ring-[#4F6EF7]/10 transition-all uppercase appearance-none" onChange={e => setBulkPayload({ stage: e.target.value })}>
                  <option value="">Select Stage</option>
                  {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button className="btn btn-secondary flex-1" onClick={() => setShowBulkModal(null)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={executeBulkAction}>Execute</button>
            </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </CRMLayout>
  );
}
