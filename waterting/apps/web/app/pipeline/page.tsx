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
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { api.get<any[]>('/leads').then(setLeads).catch(console.error).finally(() => setLoading(false)); }
  }, [user, authLoading]);

  const handleDragStart = (leadId: string) => setDraggedLead(leadId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (stage: string) => {
    if (!draggedLead) return;
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === draggedLead ? { ...l, stage } : l));
    setDraggedLead(null);
    try {
      await api.patch(`/leads/${draggedLead}/stage`, { stage });
    } catch (err) {
      // Revert on failure
      api.get<any[]>('/leads').then(setLeads);
    }
  };

  const whatsapp = (lead: any) => `https://wa.me/${lead.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, I'm following up about your inquiry. Are you still interested?`)}`;

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="page-header">
        <div><h2>Pipeline</h2><p className="subtitle">Drag leads between stages</p></div>
      </div>
      <div className="kanban-board">
        {stages.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.key);
          return (
            <div key={stage.key} className="kanban-column" onDragOver={handleDragOver} onDrop={() => handleDrop(stage.key)}>
              <div className="kanban-column-header">
                <span className="kanban-column-title" style={{borderBottom: `2px solid ${stage.color}`, paddingBottom: 4}}>
                  {stage.label}
                </span>
                <span className="kanban-column-count">{stageLeads.length}</span>
              </div>
              {stageLeads.map(lead => (
                <div key={lead.id} className={`kanban-card ${draggedLead === lead.id ? 'dragging' : ''}`}
                  draggable onDragStart={() => handleDragStart(lead.id)}
                  style={{borderLeftColor: stage.color}}
                  onClick={() => router.push(`/leads/${lead.id}`)}>
                  <div className="kanban-card-name">{lead.name}</div>
                  <div className="kanban-card-phone">{lead.phone}</div>
                  <div className="kanban-card-meta">
                    {lead.scoreLabel && <span className={`badge ${lead.scoreLabel === 'COLD' ? 'badge-cold' : lead.scoreLabel === 'WARM' ? 'badge-warm' : lead.scoreLabel === 'HOT' ? 'badge-hot' : 'badge-very-hot'}`}>{lead.scoreLabel}</span>}
                    <span className={`badge source-${lead.source?.toLowerCase()}`}>{lead.source}</span>
                  </div>
                  <div className="kanban-card-actions">
                    <a href={whatsapp(lead)} target="_blank" rel="noopener" title="WhatsApp">💬</a>
                    <a href={`tel:${lead.phone}`} title="Call">📞</a>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </CRMLayout>
  );
}
