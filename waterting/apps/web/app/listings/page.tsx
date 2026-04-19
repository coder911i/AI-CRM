'use client';
import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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
    if (!form.title || !form.price || !form.platform) return alert('Fill all required fields');
    await api.post('/listings', { ...form, price: parseFloat(form.price) });
    setShowForm(false);
    setForm({ title: '', description: '', price: '', platform: 'WEBSITE', projectId: '' });
    api.get<any[]>('/listings').then(setListings);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/listings/${id}`);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="page-header">
        <div><h2>Listings</h2><p className="subtitle">{listings.length} active listings</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ New Listing</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Create Listing</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="3BHK Premium Apartment" />
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="7500000" />
            </div>
            <div className="form-group">
              <label className="form-label">Platform *</label>
              <select className="form-select" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Project</label>
              <select className="form-select" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                <option value="">None</option>
                {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create Listing</button>
          </div>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Title', 'Price', 'Platform', 'Project', 'Status', 'Created', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listings.map((l: any) => (
              <tr key={l.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500 }}>{l.title}</td>
                <td style={{ padding: '10px 12px', fontSize: 13 }}>₹{(l.price / 100000).toFixed(1)}L</td>
                <td style={{ padding: '10px 12px' }}><span className="badge">{l.platform}</span></td>
                <td style={{ padding: '10px 12px', fontSize: 13 }}>{l.project?.name ?? '—'}</td>
                <td style={{ padding: '10px 12px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span className={`badge ${l.status === 'ACTIVE' ? 'badge-success' : 'badge-cold'}`}>{l.status}</span>
                      {l.syncStatus?.length > 0 && <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Synced: {new Date(l.syncStatus[0].timestamp).toLocaleTimeString()}</span>}
                   </div>
                </td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ fontSize: 11, background: '#F5F3FF', color: 'var(--purple)', border: '1px solid var(--purple)' }} 
                      onClick={async () => {
                        try {
                          await api.post(`/listings/${l.id}/sync`, { portals: [l.platform] });
                          alert('Sync triggered successfully');
                          api.get<any[]>('/listings').then(setListings);
                        } catch (e) { alert('Sync failed'); }
                      }}
                    >
                      🔄 Sync
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => handleDelete(l.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No listings yet. Create your first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </CRMLayout>
  );
}
