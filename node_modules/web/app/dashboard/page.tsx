'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  activeLeads: number;
  totalBookings: number;
  totalRevenue: number;
  todaySiteVisits: number;
  recentLeads: any[];
  stageDistribution: { stage: string; count: number }[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      api.get<DashboardStats>('/dashboard/stats')
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  const formatCurrency = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
  const stageLabels: Record<string, string> = {
    NEW_LEAD: 'New', CONTACTED: 'Contacted', INTERESTED: 'Interested',
    VISIT_SCHEDULED: 'Visit Sched.', VISIT_DONE: 'Visit Done',
    NEGOTIATION: 'Negotiation', BOOKING_DONE: 'Booked', LOST: 'Lost',
  };

  return (
    <CRMLayout>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="subtitle">Welcome back! Here&apos;s your sales overview.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">👥</div>
          <div className="kpi-content">
            <div className="kpi-label">Total Leads</div>
            <div className="kpi-value">{stats?.totalLeads ?? 0}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green">✨</div>
          <div className="kpi-content">
            <div className="kpi-label">New Leads</div>
            <div className="kpi-value">{stats?.newLeads ?? 0}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow">📋</div>
          <div className="kpi-content">
            <div className="kpi-label">Active Leads</div>
            <div className="kpi-value">{stats?.activeLeads ?? 0}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple">📊</div>
          <div className="kpi-content">
            <div className="kpi-label">Bookings</div>
            <div className="kpi-value">{stats?.totalBookings ?? 0}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green">💰</div>
          <div className="kpi-content">
            <div className="kpi-label">Revenue</div>
            <div className="kpi-value">{formatCurrency(stats?.totalRevenue ?? 0)}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red">📍</div>
          <div className="kpi-content">
            <div className="kpi-label">Today&apos;s Visits</div>
            <div className="kpi-value">{stats?.todaySiteVisits ?? 0}</div>
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24}}>
        <div className="card">
          <div className="card-header">Recent Leads</div>
          {stats?.recentLeads?.length ? (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Source</th><th>Stage</th><th>Agent</th></tr>
              </thead>
              <tbody>
                {stats.recentLeads.map((lead: any) => (
                  <tr key={lead.id} style={{cursor: 'pointer'}} onClick={() => router.push(`/leads/${lead.id}`)}>
                    <td style={{fontWeight: 600}}>{lead.name}</td>
                    <td><span className={`badge source-${lead.source?.toLowerCase()}`}>{lead.source}</span></td>
                    <td><span className="badge badge-info">{stageLabels[lead.stage] || lead.stage}</span></td>
                    <td>{lead.assignedTo?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="icon">👥</div>
              <h3>No leads yet</h3>
              <p>Create your first lead to get started</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">Pipeline Distribution</div>
          {stats?.stageDistribution?.map((s) => (
            <div key={s.stage} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)'}}>
              <span style={{fontSize: 13}}>{stageLabels[s.stage] || s.stage}</span>
              <span style={{fontWeight: 600}}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </CRMLayout>
  );
}
