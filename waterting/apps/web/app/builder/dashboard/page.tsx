'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function BuilderDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/dashboard/builder') // Need to create this endpoint
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Builder Revenue Dashboard</h2>
          <p className="subtitle">Real-time performance across all projects</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary">Download Report</button>
          <button className="btn btn-primary">+ New Project</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">💰</div>
          <div className="kpi-content">
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">₹{stats?.totalRevenue?.toLocaleString() || '0'}</div>
            <div className="card-change up">↑ 12% vs last month</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green">🖋️</div>
          <div className="kpi-content">
            <div className="kpi-label">New Bookings</div>
            <div className="kpi-value">{stats?.newBookings || '0'}</div>
            <div className="card-change up">↑ 5% vs last month</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple">👥</div>
          <div className="kpi-content">
            <div className="kpi-label">Active Leads</div>
            <div className="kpi-value">{stats?.activeLeads || '0'}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow">📣</div>
          <div className="kpi-content">
            <div className="kpi-label">Ad ROI</div>
            <div className="kpi-value">4.2x</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Project Performance</h3>
          <div className="data-table">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Inventory</th>
                  <th>Leads</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats?.projects?.map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <div style={{ width: 100, height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
                        <div style={{ width: `${(p.sold / p.total) * 100}%`, height: '100%', background: 'var(--success)' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.sold}/{p.total} Units Sold</span>
                    </td>
                    <td>{p.leads}</td>
                    <td>{p.sales}</td>
                    <td style={{ fontWeight: 700 }}>₹{p.revenue?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Recent Leads</h3>
          <div className="card">
            {stats?.recentLeads?.map((l: any) => (
              <div key={l.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.project}</div>
                </div>
                <div className={`badge badge-${l.scoreLabel?.toLowerCase() || 'cold'}`}>{l.scoreLabel || 'Cold'}</div>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 16 }}>View All Leads</button>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Ad Campaigns</h3>
          <div className="card">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Facebook - Goa Projects</span>
                <span style={{ fontSize: 13, color: 'var(--success)' }}>Active</span>
              </div>
              <div style={{ height: 6, background: '#eee', borderRadius: 3 }}>
                <div style={{ width: '70%', height: '100%', background: '#1877F2', borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <span>₹45,000 spend</span>
                <span>124 leads</span>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Manage Ads</button>
          </div>
        </div>
      </div>
    </div>
  );
}
