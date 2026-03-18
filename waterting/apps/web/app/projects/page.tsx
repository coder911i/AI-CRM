'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', type: 'RESIDENTIAL', reraNumber: '' });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { api.get<any[]>('/projects').then(setProjects).catch(console.error).finally(() => setLoading(false)); }
  }, [user, authLoading]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      setShowCreate(false);
      api.get<any[]>('/projects').then(setProjects);
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="page-header">
        <div><h2>Projects</h2><p className="subtitle">{projects.length} projects</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Project</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16}}>
        {projects.map(p => (
          <div key={p.id} className="card" style={{cursor: 'pointer'}} onClick={() => router.push(`/projects/${p.id}`)}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h3 style={{fontSize: 18, fontWeight: 700}}>{p.name}</h3>
                <p style={{fontSize: 13, color: 'var(--text-muted)', marginTop: 4}}>📍 {p.location}</p>
              </div>
              <span className="badge badge-info">{p.type}</span>
            </div>
            <div style={{display: 'flex', gap: 16, marginTop: 16}}>
              <div><span style={{fontSize: 12, color: 'var(--text-muted)'}}>RERA</span><br/><span style={{fontWeight: 600, fontSize: 13}}>{p.reraNumber || 'N/A'}</span></div>
              <div><span style={{fontSize: 12, color: 'var(--text-muted)'}}>Towers</span><br/><span style={{fontWeight: 600, fontSize: 13}}>{p.towers?.length || 0}</span></div>
              <div><span style={{fontSize: 12, color: 'var(--text-muted)'}}>Status</span><br/><span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></div>
            </div>
          </div>
        ))}
        {!projects.length && <div className="empty-state"><div className="icon">🏗️</div><h3>No projects yet</h3></div>}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Project</h3><button className="modal-close" onClick={() => setShowCreate(false)}>×</button></div>
            <form onSubmit={createProject}>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Location *</label><input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  {['RESIDENTIAL','COMMERCIAL','MIXED','VILLA','TOWNSHIP'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">RERA Number</label><input className="form-input" value={form.reraNumber} onChange={e => setForm({...form, reraNumber: e.target.value})} /></div>
              <button type="submit" className="btn btn-primary">Create Project</button>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
