'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function SiteVisitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { api.get<any[]>('/site-visits').then(setVisits).catch(console.error).finally(() => setLoading(false)); }
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  const outcomeClass = (o: string) => {
    switch(o) { case 'INTERESTED': case 'BOOKED': return 'badge-success'; case 'NOT_INTERESTED': return 'badge-danger'; case 'NO_SHOW': return 'badge-cold'; default: return 'badge-warning'; }
  };

  return (
    <CRMLayout>
      <div className="page-header"><div><h2>Site Visits</h2><p className="subtitle">{visits.length} visits scheduled</p></div></div>
      <div className="card" style={{padding: 0, overflow: 'hidden'}}>
        <table className="data-table">
          <thead><tr><th>Lead</th><th>Scheduled</th><th>Agent</th><th>Outcome</th></tr></thead>
          <tbody>
            {visits.map(v => (
              <tr key={v.id}>
                <td style={{fontWeight: 600}}>{v.lead?.name || '—'}</td>
                <td>{new Date(v.scheduledAt).toLocaleString()}</td>
                <td>{v.agent?.name || '—'}</td>
                <td>{v.outcome ? <span className={`badge ${outcomeClass(v.outcome)}`}>{v.outcome?.replace(/_/g, ' ')}</span> : <span className="badge badge-info">Pending</span>}</td>
              </tr>
            ))}
            {!visits.length && <tr><td colSpan={4}><div className="empty-state"><div className="icon">📍</div><h3>No visits scheduled</h3></div></td></tr>}
          </tbody>
        </table>
      </div>
    </CRMLayout>
  );
}
