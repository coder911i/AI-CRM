'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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
      <div className="page-header">
        <div>
          <h2>Leads</h2>
          <p className="subtitle">{leads.length} total leads</p>
        </div>
        <button id="add-lead-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Lead</button>
      </div>

      <div className="card" style={{padding: 0, overflow: 'hidden'}}>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Source</th><th>Stage</th><th>Score</th><th>Agent</th><th>Created</th></tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={{cursor: 'pointer'}} onClick={() => router.push(`/leads/${lead.id}`)}>
                <td style={{fontWeight: 600}}>{lead.name}</td>
                <td>{lead.phone}</td>
                <td><span className={`badge ${sourceClass(lead.source)}`}>{lead.source?.replace(/_/g, ' ')}</span></td>
                <td><span className="badge badge-info">{lead.stage?.replace(/_/g, ' ')}</span></td>
                <td>{lead.scoreLabel ? <span className={`badge ${scoreColor(lead.scoreLabel)}`}>{lead.scoreLabel} ({lead.score})</span> : '—'}</td>
                <td>{lead.assignedTo?.name || '—'}</td>
                <td style={{fontSize: 12, color: 'var(--text-muted)'}}>{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!leads.length && (
              <tr><td colSpan={7}><div className="empty-state"><div className="icon">👥</div><h3>No leads yet</h3></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Lead</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <form onSubmit={createLead}>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Source</label>
                <select className="form-select" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                  {['MANUAL','WEBSITE','FACEBOOK','GOOGLE','WHATSAPP','PORTAL_99ACRES','PORTAL_MAGICBRICKS','BROKER'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Adding...' : 'Add Lead'}</button>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
