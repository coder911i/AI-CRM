'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function OwnerDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/owner/dashboard').then(setStats);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Owner Dashboard</h2>
          <p className="subtitle">Welcome back! Here's what's happening with your properties.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">🏠</div>
          <div className="kpi-content">
            <p className="kpi-label">Total Properties</p>
            <h3 className="kpi-value">{stats?.propertyCount || 0}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon yellow">🔥</div>
          <div className="kpi-content">
            <p className="kpi-label">Active Inquiries</p>
            <h3 className="kpi-value">{stats?.activeInquiries || 0}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green">📅</div>
          <div className="kpi-content">
            <p className="kpi-label">Visits This Week</p>
            <h3 className="kpi-value">{stats?.visitsThisWeek || 0}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple">💰</div>
          <div className="kpi-content">
            <p className="kpi-label">Deals in Progress</p>
            <h3 className="kpi-value">₹8.5Cr</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Activity overview coming soon</div>
        <div className="empty-state">
           <div className="icon">🚀</div>
           <h3>Track everything in one place</h3>
           <p>Your property performance and lead interactions will appear here.</p>
        </div>
      </div>
    </div>
  );
}
