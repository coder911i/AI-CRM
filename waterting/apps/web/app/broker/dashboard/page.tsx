'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function BrokerDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/broker-portal/dashboard').then(setStats);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Broker Dashboard</h2>
          <p className="subtitle">Track your performance and manage your assigned leads.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">👥</div>
          <div className="kpi-content">
            <p className="kpi-label">Assigned Leads Today</p>
            <h3 className="kpi-value">{stats?.assignedLeadsToday || 0}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow">📅</div>
          <div className="kpi-content">
            <p className="kpi-label">Upcoming Visits</p>
            <h3 className="kpi-value">{stats?.upcomingVisits || 0}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green">💰</div>
          <div className="kpi-content">
            <p className="kpi-label">Commission Pipeline</p>
            <h3 className="kpi-value">₹{stats?.commissionPipeline?.toLocaleString() || 0}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple">⭐</div>
          <div className="kpi-content">
            <p className="kpi-label">My Rating</p>
            <h3 className="kpi-value">{stats?.rating || 0}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Priority Leads</div>
        <div className="empty-state">
           <p>Assigned leads from the allocation engine will appear here. Be quick to respond!</p>
        </div>
      </div>
    </div>
  );
}
