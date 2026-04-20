'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function AdminDeals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/deals').then(res => {
      setDeals(res || []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Allocation Master Panel</h2>
          <p className="subtitle">Supervise and intervene in every deal across the platform.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">All Active Allocations</div>
        {loading ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : deals.length === 0 ? (
          <div className="empty-state">No active deals found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Lead</th>
                <th>Broker</th>
                <th>Property</th>
                <th>Status</th>
                <th>Last Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d: any) => (
                <tr key={d.id}>
                  <td>{d.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div>{d.lead.name}</div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>{d.lead.phone}</div>
                  </td>
                  <td>{d.broker?.name || 'Unassigned'}</td>
                  <td>{d.propertyId || 'N/A'}</td>
                  <td>
                    <span className={`badge ${d.fraudFlag ? 'badge-danger' : d.status === 'CLOSED' ? 'badge-cold' : 'badge-very-hot'}`}>
                      {d.status} {d.fraudFlag ? '(FLAGGED)' : ''}
                    </span>
                  </td>
                  <td>{new Date(d.updatedAt).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm">Intervene</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
