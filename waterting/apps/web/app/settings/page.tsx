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
  const [activeTab, setActiveTab] = useState('profile');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  
  useEffect(() => {
    if (user && (user.role === 'TENANT_ADMIN' || user.role === 'SALES_MANAGER')) {
      api.get<any[]>('/users').then(setUsers).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const tabs = [
    { id: 'profile', label: 'Profile & Org', icon: '👤' },
    { id: 'team', label: 'Team Directory', icon: '👥', roles: ['TENANT_ADMIN', 'SALES_MANAGER'] },
    { id: 'integrations', label: 'Integrations', icon: '🔌' },
    { id: 'ai', label: 'AI Settings', icon: '🧠' },
  ].filter(t => !t.roles || (user && t.roles.includes(user.role)));

  return (
    <CRMLayout>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="subtitle">System configuration and team management</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32, marginTop: 12 }}>
        <aside style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                background: activeTab === tab.id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 14,
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />
          <button 
            className="btn btn-secondary btn-sm" 
            style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}
            onClick={logout}
          >
            🚪 Sign Out
          </button>
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 'profile' && (
            <div className="card shadow-sm">
              <div className="card-header">Organization Details</div>
              <div style={{ padding: '24px 0' }}>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Email Address</label>
                  <input className="form-input" readOnly value={user?.email || ''} />
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Role</label>
                  <input className="form-input" readOnly value={user?.role?.replace(/_/g, ' ') || ''} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tenant ID</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" readOnly value={user?.tenantId || ''} />
                    <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(user?.tenantId || ''); alert('Copied!'); }}>Copy</button>
                  </div>
                </div>
              </div>
              
              <div className="card-header" style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>System Connectivity</div>
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span>Real-time Sync</span>
                  <span style={{ color: isConnected ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                    {isConnected ? '● Connected' : '○ Disconnected'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 13 }}>
                  <span>Main API</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>● Operational</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="card shadow-sm">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Team Directory
                <button className="btn btn-primary btn-sm">+ Invite Member</button>
              </div>
              <div style={{ marginTop: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px 8px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Name</th>
                      <th style={{ padding: '12px 8px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Role</th>
                      <th style={{ padding: '12px 8px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className="badge badge-info" style={{ fontSize: 10 }}>{u.role?.replace(/_/g, ' ')}</span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className="badge badge-success" style={{ fontSize: 10 }}>Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!users.length && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No team members found</div>}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card shadow-sm">
                <div className="card-header">Marketing & Lead Hooks</div>
                <div style={{ padding: '24px 0' }}>
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Facebook Leads Webhook</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="form-input" readOnly value={`https://api.waterting.com/webhooks/facebook/${user?.tenantId}`} />
                      <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(`https://api.waterting.com/webhooks/facebook/${user?.tenantId}`); alert('Copied!'); }}>Copy</button>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Endpoint for Meta App Dashboard (Page Leads sync).</p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="form-group">
                      <label className="form-label">99acres Webhook</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input className="form-input" style={{ fontSize: 11 }} readOnly value={`https://api.waterting.com/webhooks/99acres/${user?.tenantId}`} />
                        <button className="btn btn-secondary btn-sm" style={{ padding: '0 8px' }} onClick={() => { navigator.clipboard.writeText(`https://api.waterting.com/webhooks/99acres/${user?.tenantId}`); alert('Copied!'); }}>📋</button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">MagicBricks Webhook</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input className="form-input" style={{ fontSize: 11 }} readOnly value={`https://api.waterting.com/webhooks/magicbricks/${user?.tenantId}`} />
                        <button className="btn btn-secondary btn-sm" style={{ padding: '0 8px' }} onClick={() => { navigator.clipboard.writeText(`https://api.waterting.com/webhooks/magicbricks/${user?.tenantId}`); alert('Copied!'); }}>📋</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-header">Communication Channels</div>
                <div style={{ padding: '24px 0' }}>
                  <div style={{ padding: '16px 20px', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ fontSize: 32 }}>💬</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>WhatsApp Business API</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Auto-replies and template messaging active</div>
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ padding: '6px 12px' }}>Connected</span>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <label className="form-label">Click-to-Chat Template</label>
                    <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <code style={{ fontSize: 13, color: 'var(--primary)' }}>wa.me/91XXXXXXXXXX?text=Hi, I am interested in {"{project_name}"}...</code>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Generated automatically for every lead pre-call brief.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="card shadow-sm">
              <div className="card-header">AI Intelligence Configuration</div>
              <div style={{ padding: '24px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Gemini 1.5 Pro (Google)</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Used for lead scoring, sentiment analysis, and strategy generation.</div>
                      </div>
                      <span className="badge badge-info">PRIMARY</span>
                    </div>
                  </div>
                  <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, opacity: 0.7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>GPT-4o (OpenAI)</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Fallback provider for document extraction and reporting.</div>
                      </div>
                      <span className="badge badge-secondary">READY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </CRMLayout>
  );
}
