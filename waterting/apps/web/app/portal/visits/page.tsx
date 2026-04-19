'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function VisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/portal/visits')
      .then(setVisits)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const upcomingVisits = visits.filter(v => new Date(v.scheduledAt) > new Date());
  const pastVisits = visits.filter(v => new Date(v.scheduledAt) <= new Date());

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Site Visits</h2>
          <p className="subtitle">Track and schedule your property tours</p>
        </div>
        <button className="btn btn-primary">Schedule New Visit</button>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Upcoming Visits</h3>
        {upcomingVisits.map((v: any) => (
          <div key={v.id} className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--primary-light)', borderRadius: 12, minWidth: 80 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    {new Date(v.scheduledAt).toLocaleString('en', { month: 'short' })}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>
                    {new Date(v.scheduledAt).getDate()}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: 700 }}>{v.lead?.project?.name || 'Property Tour'}</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{new Date(v.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{v.agent?.name || 'Sales Representative'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Assigned Agent</div>
                  </div>
                  <div className="user-avatar" style={{ width: 40, height: 40 }}>{v.agent?.name?.charAt(0)}</div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '4px 12px' }}>Reschedule</button>
                  <button className="btn btn-danger btn-sm" style={{ padding: '4px 12px', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {upcomingVisits.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No upcoming visits scheduled.
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Past Visits</h3>
        <div className="data-table">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Project</th>
                <th>Date</th>
                <th>Outcome</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {pastVisits.map((v: any) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.lead?.project?.name}</td>
                  <td>{new Date(v.scheduledAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${v.outcome === 'INTERESTED' ? 'badge-success' : 'badge-info'}`}>
                      {v.outcome || 'Completed'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pastVisits.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              No past visits found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
