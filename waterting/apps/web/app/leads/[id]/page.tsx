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
  const [showLogCall, setShowLogCall] = useState(false);
  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [callForm, setCallForm] = useState({ outcome: 'Answered & Interested', duration: 5, notes: '', followUpDate: '' });
  const [visitForm, setVisitForm] = useState({ scheduledAt: '', agentId: '', notes: '' });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) {
      api.get<any>(`/leads/${params.id}`).then(setLead).catch(() => router.push('/leads')).finally(() => setLoading(false));
    }
  }, [user, authLoading, params.id]);

  useEffect(() => {
    if (user) {
      api.get<any[]>(`/auth/users`).then(setStaff).catch(console.error);
    }
  }, [user]);

  const fetchLead = () => api.get<any>(`/leads/${params.id}`).then(setLead).catch(console.error);

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      await api.post(`/leads/${params.id}/activities`, { type: 'NOTE', title: 'Note', description: noteText });
      setNoteText('');
      fetchLead();
    } catch (err: any) { alert(err.message); }
  };

  const logCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/leads/${params.id}/activities`, {
        type: 'CALL',
        title: `Call: ${callForm.outcome}`,
        description: callForm.notes,
        metadata: { duration: callForm.duration, outcome: callForm.outcome, followUpDate: callForm.followUpDate }
      });
      setShowLogCall(false);
      fetchLead();
      alert('Call logged successfully');
    } catch (err: any) { alert(err.message); }
  };

  const scheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/site-visits`, {
        leadId: params.id,
        agentId: visitForm.agentId,
        scheduledAt: new Date(visitForm.scheduledAt).toISOString(),
        notes: visitForm.notes
      });
      setShowScheduleVisit(false);
      fetchLead();
      alert(`Visit scheduled for ${new Date(visitForm.scheduledAt).toLocaleDateString()}`);
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
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          <button className="btn btn-warning btn-sm" onClick={() => setShowLogCall(true)}>📞 Log Call</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowScheduleVisit(true)}>📍 Schedule Visit</button>
          <a href={whatsapp} target="_blank" className="btn btn-success btn-sm">💬 WhatsApp</a>
          <a href={`tel:${lead.phone}`} className="btn btn-secondary btn-sm">📞 Call Lead</a>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
        <div style={{display:'flex', flexDirection:'column', gap: 24}}>
          <div className="card">
            <div className="card-header">Lead Info</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14}}>
              <div>
                <span style={{color: 'var(--text-muted)', fontSize: 12}}>Stage</span><br/>
                <select 
                  className="form-select" 
                  style={{padding: '4px 8px', height: 'auto', fontSize: 13, marginTop: 4}}
                  value={lead.stage}
                  onChange={(e) => {
                    api.patch(`/leads/${lead.id}/stage`, { stage: e.target.value })
                      .then(() => api.get<any>(`/leads/${lead.id}`).then(setLead))
                      .catch(err => alert(err.message));
                  }}
                >
                  {['NEW_LEAD', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'NEGOTIATION', 'BOOKING_DONE', 'LOST'].map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Source</span><br/><span className={`badge source-${lead.source?.toLowerCase()}`}>{lead.source}</span></div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Score</span><br/>{lead.scoreLabel ? <span className={`badge badge-${lead.scoreLabel === 'COLD' ? 'cold' : lead.scoreLabel === 'WARM' ? 'warm' : lead.scoreLabel === 'HOT' ? 'hot' : 'very-hot'}`}>{lead.scoreLabel} ({lead.score})</span> : '—'}</div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Project</span><br/>{lead.project?.name || '—'}</div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Budget</span><br/>{lead.budgetMin ? `₹${lead.budgetMin.toLocaleString()} – ₹${lead.budgetMax?.toLocaleString()}` : '—'}</div>
              <div><span style={{color: 'var(--text-muted)', fontSize: 12}}>Timeline</span><br/>{lead.timeline || '—'}</div>
            </div>
          </div>

          <AIPanels leadId={lead.id} />

          {lead.notes && (
            <div className="card">
              <div className="card-header">Notes</div>
              <p style={{fontSize: 14}}>{lead.notes}</p>
            </div>
          )}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap: 24}}>
          <div className="card">
            <div className="card-header">Add Note</div>
            <textarea className="form-textarea" placeholder="Write a note..." value={noteText} onChange={e => setNoteText(e.target.value)} style={{minHeight: 80}} />
            <button className="btn btn-primary btn-sm" style={{marginTop: 8}} onClick={addNote}>Add Note</button>
          </div>

          <div className="card">
            <div className="card-header">Activity Timeline</div>
            <div style={{display:'flex', flexDirection:'column', gap: 0}}>
              {lead.activities?.length ? lead.activities.map((a: any) => {
                const icon = a.type === 'CALL' ? '📞' : a.type === 'EMAIL' ? '✉️' : a.type === 'WHATSAPP' ? '💬' : a.type === 'NOTE' ? '📝' : a.type === 'STAGE_CHANGE' ? '🔄' : a.type === 'VISIT_SCHEDULED' ? '📅' : a.type === 'VISIT_COMPLETED' ? '✅' : a.type === 'AI_ACTION' ? '✨' : a.type === 'DOCUMENT_SHARED' ? '📄' : '📌';
                return (
                  <div key={a.id} style={{padding: '16px 0', borderBottom: '1px solid var(--border)', display:'flex', gap: 16}}>
                    <div style={{width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems:'center', justifyContent:'center', fontSize: 18, flexShrink: 0}}>
                      {icon}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <strong style={{fontSize: 14}}>{a.title}</strong>
                        <span style={{fontSize: 11, color: 'var(--text-muted)'}} title={new Date(a.createdAt).toLocaleString()}>{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                      {a.description && <p style={{fontSize: 13, color: 'var(--text-muted)', marginTop: 4}}>{a.description}</p>}
                      {a.metadata && Object.keys(a.metadata).length > 0 && (
                        <div style={{marginTop: 8, display:'flex', gap: 12, flexWrap:'wrap'}}>
                          {a.metadata.duration && <span style={{fontSize: 11, padding: '2px 6px', background:'var(--bg)', borderRadius:4}}>⏱️ {a.metadata.duration}m</span>}
                          {a.metadata.outcome && <span style={{fontSize: 11, padding: '2px 6px', background:'var(--bg)', borderRadius:4}}>🎯 {a.metadata.outcome}</span>}
                          {a.metadata.followUpDate && <span style={{fontSize: 11, padding: '2px 6px', background:'var(--bg)', borderRadius:4}}>🔔 Follow-up: {new Date(a.metadata.followUpDate).toLocaleDateString()}</span>}
                        </div>
                      )}
                      <div style={{fontSize: 11, color: 'var(--text-muted)', marginTop: 8}}>by {a.user?.name || 'AI System'}</div>
                    </div>
                  </div>
                );
              }) : <p style={{color: 'var(--text-muted)', fontSize: 13, padding: '20px 0'}}>No activities yet</p>}
            </div>
          </div>
        </div>
      </div>

      {showLogCall && (
        <div className="modal-overlay" onClick={() => setShowLogCall(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 450}}>
            <div className="modal-header"><h3>Log Call</h3><button className="modal-close" onClick={() => setShowLogCall(false)}>×</button></div>
            <form onSubmit={logCall}>
              <div className="form-group">
                <label className="form-label">Outcome *</label>
                <select className="form-select" value={callForm.outcome} onChange={e => setCallForm({...callForm, outcome: e.target.value})}>
                  {['Answered & Interested', 'Answered & Not Interested', 'No Answer', 'Busy', 'Wrong Number', 'Callback Requested'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input type="number" className="form-input" value={callForm.duration} onChange={e => setCallForm({...callForm, duration: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={callForm.notes} onChange={e => setCallForm({...callForm, notes: e.target.value})} placeholder="What was discussed?" />
              </div>
              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input type="date" className="form-input" value={callForm.followUpDate} onChange={e => setCallForm({...callForm, followUpDate: e.target.value})} />
              </div>
              <div style={{display:'flex', gap: 12, marginTop: 24}}>
                <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setShowLogCall(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save Call Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleVisit && (
        <div className="modal-overlay" onClick={() => setShowScheduleVisit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 450}}>
            <div className="modal-header"><h3>Schedule Site Visit</h3><button className="modal-close" onClick={() => setShowScheduleVisit(false)}>×</button></div>
            <form onSubmit={scheduleVisit}>
              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input type="datetime-local" className="form-input" required value={visitForm.scheduledAt} onChange={e => setVisitForm({...visitForm, scheduledAt: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Agent *</label>
                <select className="form-select" required value={visitForm.agentId} onChange={e => setVisitForm({...visitForm, agentId: e.target.value})}>
                  <option value="">Select Agent</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role.replace(/_/g, ' ')})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Special Instructions</label>
                <textarea className="form-textarea" value={visitForm.notes} onChange={e => setVisitForm({...visitForm, notes: e.target.value})} placeholder="Any notes for the agent?" />
              </div>
              <div style={{display:'flex', gap: 12, marginTop: 24}}>
                <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setShowScheduleVisit(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Schedule Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}

function AIPanels({ leadId }: { leadId: string }) {
  const [brief, setBrief] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>(`/leads/${leadId}/ai-brief`),
      api.get<any>(`/leads/${leadId}/ai-summary`),
      api.get<any[]>(`/leads/${leadId}/recommendations`)
    ]).then(([b, s, r]) => {
      setBrief(b);
      setSummary(s.summary);
      setRecs(r);
    }).finally(() => setLoading(false));
  }, [leadId]);

  if (loading) return <div className="card"><div className="spinner" style={{width: 20, height: 20, margin:'0 auto'}} /></div>;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 24}}>
      <div className="card" style={{borderLeft: '4px solid var(--purple)', background: '#F5F3FF'}}>
        <div className="card-header" style={{color: 'var(--purple)', display:'flex', justifyContent:'space-between'}}>
          <span>✨ AI Pre-Call Brief</span>
        </div>
        <div style={{fontSize: 13, marginTop: 12}}>
          <p><strong>Context:</strong> {brief?.background}</p>
          <p style={{marginTop: 8}}><strong>Why this score:</strong> {brief?.scoreExplanation}</p>
          <div style={{marginTop: 12, padding: 12, background: 'white', borderRadius: 8, border: '1px solid #DDD'}}>
            <p style={{fontSize: 11, color:'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase'}}>Suggested Opener</p>
            <p style={{fontWeight: 600, fontStyle: 'italic'}}>"{brief?.suggestedOpener}"</p>
          </div>
        </div>
      </div>

      <div className="card" style={{borderLeft: '4px solid var(--primary)'}}>
        <div className="card-header" style={{color: 'var(--primary)'}}>🤖 Lead Summary</div>
        <div style={{fontSize: 13, marginTop: 12, whiteSpace: 'pre-wrap'}}>{summary}</div>
      </div>

      <div className="card">
        <div className="card-header">🏠 Property Recommendations</div>
        <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10}}>
          {recs.map(unit => (
            <div key={unit.id} style={{padding: 10, background: 'var(--bg)', borderRadius: 8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight: 600, fontSize: 13}}>{unit.unitNumber}</div>
                <div style={{fontSize: 11, color:'var(--text-muted)'}}>{unit.type.replace('_', ' ')} • ₹{(unit.totalPrice/100000).toFixed(0)}L</div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{padding: '4px 8px', fontSize: 11}}>Quote</button>
            </div>
          ))}
          {recs.length === 0 && <p style={{fontSize: 12, color:'var(--text-muted)'}}>No specific recommendations found.</p>}
        </div>
      </div>
    </div>
  );
}
