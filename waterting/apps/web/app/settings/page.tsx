'use client';

import CRMLayout from '@/components/CRMLayout';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

import { useSocket } from '@/lib/socket';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const { isConnected } = useSocket();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    if (user && (user.role === 'TENANT_ADMIN' || user.role === 'SALES_MANAGER')) {
      api.get<any[]>('/users').then(setUsers).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="page-header"><div><h2>Settings</h2><p className="subtitle">System configuration and team management</p></div></div>

      <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24}}>
        <div style={{display:'flex', flexDirection:'column', gap: 24}}>
          <div className="card">
            <div className="card-header">External Integrations</div>
            <div className="form-group" style={{marginTop: 16}}>
              <label className="form-label">Facebook Leads Webhook</label>
              <div style={{display:'flex', gap: 8}}>
                <input className="form-input" readOnly value={`https://api.waterting.com/webhooks/facebook/${user?.tenantId}`} />
                <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(`https://api.waterting.com/webhooks/facebook/${user?.tenantId}`); alert('Copied!'); }}>Copy</button>
              </div>
              <p style={{fontSize: 11, color:'var(--text-muted)', marginTop: 4}}>Paste this in your Meta App Dashboard to sync leads instantly.</p>
            </div>

            <div className="form-group" style={{marginTop: 16}}>
              <label className="form-label">WhatsApp Cloud API</label>
              <div style={{display:'flex', gap: 8, alignItems:'center'}}>
                <span className="badge badge-success">Connected</span>
                <span style={{fontSize: 12, color:'var(--text-muted)'}}>Auto-reply active</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">AI Intelligence Configuration</div>
            <div style={{marginTop: 16}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '12px 0', borderBottom: '1px solid var(--border)'}}>
                <div><div style={{fontWeight: 600, fontSize: 13}}>Gemini 1.5 Pro</div><div style={{fontSize: 11, color:'var(--text-muted)'}}>Lead Scoring & Strategy</div></div>
                <span className="badge badge-info">Active</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '12px 0'}}>
                <div><div style={{fontWeight: 600, fontSize: 13}}>GPT-4o Integration</div><div style={{fontSize: 11, color:'var(--text-muted)'}}>Analytics & Document Generation</div></div>
                <span className="badge badge-secondary">Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap: 24}}>
          <div className="card">
            <div className="card-header">System Health</div>
            <div style={{marginTop: 16}}>
              <div style={{display:'flex', justifyContent:'space-between', padding: '8px 0', fontSize: 13}}>
                <span>Real-time Sync</span>
                <span style={{color: isConnected ? 'var(--success)' : 'var(--danger)', fontWeight: 700}}>
                  {isConnected ? '● Connected' : '○ Disconnected'}
                </span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', padding: '8px 0', fontSize: 13}}>
                <span>API Status</span>
                <span style={{color: 'var(--success)', fontWeight: 700}}>● Operational</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Profile & Organization</div>
            <div style={{fontSize: 14, marginTop: 16}}>
              <p><strong>Email:</strong> {user?.email}</p>
              <p style={{marginTop: 8}}><strong>Role:</strong> {user?.role?.replace(/_/g, ' ')}</p>
              <p style={{marginTop: 8}}><strong>Organization ID:</strong> <code style={{fontSize: 11}}>{user?.tenantId}</code></p>
            </div>
            <button className="btn btn-danger btn-sm" style={{marginTop: 20}} onClick={logout}>Sign Out</button>
          </div>

          {(user?.role === 'TENANT_ADMIN' || user?.role === 'SALES_MANAGER') && (
            <div className="card">
              <div className="card-header">Team Directory</div>
              <div style={{marginTop: 16}}>
                {users.map(u => (
                  <div key={u.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13}}>
                    <div><strong>{u.name}</strong><div style={{fontSize: 11, color: 'var(--text-muted)'}}>{u.email}</div></div>
                    <span className="badge badge-info" style={{fontSize: 10}}>{u.role?.replace(/_/g, ' ')}</span>
                  </div>
                ))}
                {!users.length && <p style={{color: 'var(--text-muted)', fontSize: 13}}>No team members</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </CRMLayout>
  );
}
