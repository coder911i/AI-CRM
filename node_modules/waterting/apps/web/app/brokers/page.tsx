'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function BrokersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', commissionPct: 2.0 });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { api.get<any[]>('/brokers').then(setBrokers).catch(console.error).finally(() => setLoading(false)); }
  }, [user, authLoading]);

  const createBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/brokers', form);
      setShowCreate(false);
      api.get<any[]>('/brokers').then(setBrokers);
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="page-header">
        <div><h2>Brokers</h2><p className="subtitle">{brokers.length} brokers</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Broker</button>
      </div>
      <div className="card" style={{padding: 0, overflow: 'hidden'}}>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Commission %</th><th>Leads</th><th>Referral Code</th><th>Status</th></tr></thead>
          <tbody>
            {brokers.map(b => (
              <tr key={b.id} style={{cursor: 'pointer'}} onClick={() => router.push(`/brokers/${b.id}`)}>
                <td style={{fontWeight: 600}}>{b.name}</td>
                <td>{b.phone}</td>
                <td>{b.commissionPct}%</td>
                <td>{b._count?.leads ?? 0}</td>
                <td><code style={{fontSize: 12, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4}}>{b.referralCode}</code></td>
                <td><span className={`badge ${b.isActive ? 'badge-success' : 'badge-danger'}`}>{b.isActive ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
            {!brokers.length && <tr><td colSpan={6}><div className="empty-state"><div className="icon">🤝</div><h3>No brokers yet</h3></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Broker</h3><button className="modal-close" onClick={() => setShowCreate(false)}>×</button></div>
            <form onSubmit={createBroker}>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Commission %</label><input type="number" step="0.5" className="form-input" value={form.commissionPct} onChange={e => setForm({...form, commissionPct: parseFloat(e.target.value)})} /></div>
              <button type="submit" className="btn btn-primary">Add Broker</button>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
