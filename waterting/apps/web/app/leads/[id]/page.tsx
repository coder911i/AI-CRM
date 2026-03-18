'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter, useParams } from 'next/navigation';

export default function LeadDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) {
      api.get<any>(`/leads/${params.id}`).then(setLead).catch(() => router.push('/leads')).finally(() => setLoading(false));
    }
  }, [user, authLoading, params.id]);

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      await api.post(`/leads/${params.id}/activities`, { type: 'NOTE', title: 'Note', description: noteText });
      setNoteText('');
      api.get<any>(`/leads/${params.id}`).then(setLead);
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!lead) return null;

  const whatsapp = `https://wa.me/${lead.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, I'm following up about your inquiry${lead.project?.name ? ` for ${lead.project.name}` : ''}. Are you still interested?`)}`;

  return (
    <CRMLayout>
      <div className="page-header">
        <div>
          <h2>{lead.name}</h2>
          <p className="subtitle">{lead.phone} · {lead.email || 'No email'}</p>
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <a href={whatsapp} target="_blank" className="btn btn-success btn-sm">💬 WhatsApp</a>
          <a href={`tel:${lead.phone}`} className="btn btn-secondary btn-sm">📞 Call</a>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
        <div>
          <div className="card" style={{marginBottom: 16}}>
            <div className="card-header">Lead Info</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14}}>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Stage</span><br/><span className="badge badge-info">{lead.stage?.replace(/_/g, ' ')}</span></div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Source</span><br/><span className={`badge source-${lead.source?.toLowerCase()}`}>{lead.source}</span></div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Score</span><br/>{lead.scoreLabel ? <span className={`badge badge-${lead.scoreLabel === 'COLD' ? 'cold' : lead.scoreLabel === 'WARM' ? 'warm' : lead.scoreLabel === 'HOT' ? 'hot' : 'very-hot'}`}>{lead.scoreLabel} ({lead.score})</span> : '—'}</div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Project</span><br/>{lead.project?.name || '—'}</div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Budget</span><br/>{lead.budgetMin ? `₹${lead.budgetMin.toLocaleString()} – ₹${lead.budgetMax?.toLocaleString()}` : '—'}</div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Timeline</span><br/>{lead.timeline || '—'}</div>
            </div>
          </div>

          {lead.notes && (
            <div className="card" style={{marginBottom: 16}}>
              <div className="card-header">Notes</div>
              <p style={{fontSize: 14}}>{lead.notes}</p>
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{marginBottom: 16}}>
            <div className="card-header">Add Note</div>
            <textarea className="form-textarea" placeholder="Write a note..." value={noteText} onChange={e => setNoteText(e.target.value)} style={{minHeight: 80}} />
            <button className="btn btn-primary btn-sm" style={{marginTop: 8}} onClick={addNote}>Add Note</button>
          </div>

          <div className="card">
            <div className="card-header">Activity Timeline</div>
            {lead.activities?.length ? lead.activities.map((a: any) => (
              <div key={a.id} style={{padding: '10px 0', borderBottom: '1px solid var(--border)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13}}>
                  <strong>{a.title}</strong>
                  <span style={{fontSize: 11, color: 'var(--text-muted)'}}>{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                {a.description && <p style={{fontSize: 12, color: 'var(--text-muted)', marginTop: 4}}>{a.description}</p>}
              </div>
            )) : <p style={{color: 'var(--text-muted)', fontSize: 13}}>No activities yet</p>}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
