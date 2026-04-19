'use client';
import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

const ROLES = [
  { value: 'TENANT_ADMIN', label: 'Tenant Admin', color: 'purple' },
  { value: 'SALES_MANAGER', label: 'Sales Manager', color: 'blue' },
  { value: 'SALES_AGENT', label: 'Sales Agent', color: 'green' },
  { value: 'ACCOUNTS', label: 'Accounts', color: 'orange' },
  { value: 'BROKER', label: 'Broker', color: 'coral' },
];

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('team');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', password: 'User@1234', role: 'SALES_AGENT' });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditFilter, setAuditFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && activeTab === 'team') {
      fetchUsers();
    } else if (user && activeTab === 'audit') {
      fetchAuditLogs();
    } else if (user) {
      setLoading(false);
    }
  }, [user, authLoading, activeTab, auditPage, auditFilter, auditActionFilter]);

  const fetchAuditLogs = async () => {
    try {
      let url = `/users/audit-logs?page=${auditPage}`;
      if (auditFilter) url += `&entity=${auditFilter}`;
      if (auditActionFilter) url += `&action=${auditActionFilter}`;
      const data = await api.get<any>(url);
      setAuditLogs(data.logs);
      setAuditTotal(data.total);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get<any[]>('/auth/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id: string) => {
    await api.patch(`/auth/users/${id}/toggle-status`, {});
    fetchUsers();
  };

  const handleInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) return alert('Name and Email are required');
    await api.post('/auth/create-staff', inviteForm);
    setShowInviteModal(false);
    fetchUsers();
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  const tabs = [
    { id: 'team', label: 'Team Management', icon: '👥', roles: ['TENANT_ADMIN', 'SALES_MANAGER'] },
    { id: 'profile', label: 'Company Profile', icon: '🏢' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'pipeline', label: 'Pipeline Stages', icon: '🔄' },
    { id: 'audit', label: 'Audit Log', icon: '📜', roles: ['TENANT_ADMIN'] },
  ].filter(t => !t.roles || t.roles.includes(user?.role || ''));

  return (
    <CRMLayout>
      <div className="page-header">
        <div><h2>Settings</h2><p className="subtitle">Manage your organization and team</p></div>
      </div>

      <div style={{ display: 'flex', gap: 32, marginTop: 20 }}>
        <aside style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === tab.id ? '' : 'transparent' }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ marginRight: 10 }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
          <button className="btn btn-secondary" style={{ marginTop: 20, color: 'var(--danger)', border: 'none' }} onClick={logout}>🚪 Logout</button>
        </aside>

        <main style={{ flex: 1 }}>
          {activeTab === 'team' && (
            <div className="card shadow-sm">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Team Directory</span>
                <button className="btn btn-primary btn-sm" onClick={() => setShowInviteModal(true)}>+ Invite Staff</button>
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td><span className="badge" style={{ background: ROLES.find(r => r.value === u.role)?.color }}>{u.role.replace(/_/g, ' ')}</span></td>
                        <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-cold'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                        <td>
                          {u.id !== user?.sub && (
                            <button className="btn btn-secondary btn-sm" onClick={() => toggleUserStatus(u.id)}>
                              {u.isActive ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card shadow-sm">
              <div className="card-header">Company Profile</div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Tenant Name</label>
                    <input className="form-input" defaultValue="Skyline Developers" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">RERA Number</label>
                    <input className="form-input" placeholder="UPRERAPRJXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Support Email</label>
                    <input className="form-input" defaultValue={user?.email} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Logo URL</label>
                    <input className="form-input" placeholder="https://..." />
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 20 }}>Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card shadow-sm">
              <div className="card-header">Notification Preferences</div>
              <div style={{ padding: '10px 20px' }}>
                {[
                  { id: 'n1', label: 'Email on new lead assigned', default: true },
                  { id: 'n2', label: 'WhatsApp alert on stage change', default: true },
                  { id: 'n3', label: 'Daily summary email', default: false },
                  { id: 'n4', label: 'Site visit reminders (24h/2h)', default: true },
                ].map(n => (
                  <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{n.label}</span>
                    <input type="checkbox" defaultChecked={n.default} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="card shadow-sm">
              <div className="card-header">Pipeline Config</div>
              <div style={{ padding: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Pipeline stages are currently fixed by the system to ensure reporting consistency.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {['NEW_LEAD', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'NEGOTIATION', 'BOOKING_DONE', 'LOST'].map(s => (
                    <span key={s} className="badge badge-info" style={{ padding: '8px 12px' }}>{s.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="card shadow-sm" style={{padding: 0}}>
              <div className="card-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>System Audit Logs</span>
                <div style={{display:'flex', gap: 12}}>
                  <select className="form-select" style={{width: 150, padding:'4px 8px'}} value={auditFilter} onChange={e => setAuditFilter(e.target.value)}>
                     <option value="">All Entities</option>
                     {['LEAD','BOOKING','PAYMENT','REFUND','USER','PROJECT'].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <select className="form-select" style={{width: 150, padding:'4px 8px'}} value={auditActionFilter} onChange={e => setAuditActionFilter(e.target.value)}>
                    <option value="">All Actions</option>
                    {['CREATE','UPDATE','DELETE','LOGIN','VERIFY'].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th></tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <React.Fragment key={log.id}>
                      <tr onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} style={{cursor:'pointer'}}>
                        <td style={{fontSize: 12}}>{new Date(log.createdAt).toLocaleString()}</td>
                        <td style={{fontSize: 13}}>{log.user?.name || 'System'}</td>
                        <td>
                          <span className={`badge ${log.action === 'CREATE' ? 'badge-success' : log.action === 'DELETE' ? 'badge-danger' : 'badge-info'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{fontSize: 12, color: 'var(--text-muted)'}}>{log.entity} <small style={{fontSize: 9}}>(#{log.entityId.slice(-6)})</small></td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr>
                          <td colSpan={4} style={{background: '#f8fafc', padding: 16}}>
                             <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                                <div>
                                   <div style={{fontSize: 10, fontWeight: 700, marginBottom: 4}}>OLD DATA</div>
                                   <pre style={{fontSize: 10, overflowX:'auto'}}>{JSON.stringify(log.oldData, null, 2) || 'None'}</pre>
                                </div>
                                <div>
                                   <div style={{fontSize: 10, fontWeight: 700, marginBottom: 4}}>NEW DATA</div>
                                   <pre style={{fontSize: 10, overflowX:'auto'}}>{JSON.stringify(log.newData, null, 2)}</pre>
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <div style={{padding: 16, display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border)'}}>
                 <span style={{fontSize: 12, color: 'var(--text-muted)'}}>Total {auditTotal} logs</span>
                 <div style={{display:'flex', gap: 8}}>
                    <button className="btn btn-secondary btn-sm" disabled={auditPage === 1} onClick={() => setAuditPage(auditPage - 1)}>Prev</button>
                    <button className="btn btn-secondary btn-sm" disabled={auditLogs.length < 50} onClick={() => setAuditPage(auditPage + 1)}>Next</button>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <h3>Invite Team Member</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
              <div className="form-group"><label>Full Name</label><input className="form-input" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} /></div>
              <div className="form-group"><label>Email Address</label><input className="form-input" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} /></div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-select" value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowInviteModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleInvite}>Invite</button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
