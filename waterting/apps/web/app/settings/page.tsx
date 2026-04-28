'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import { 
  Users2, 
  Building, 
  BellRing, 
  GitMerge, 
  History, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Eye, 
  X,
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ROLES = [
  { value: 'TENANT_ADMIN', label: 'TENANT ADMIN', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { value: 'SALES_MANAGER', label: 'SALES MANAGER', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { value: 'SALES_AGENT', label: 'SALES AGENT', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { value: 'ACCOUNTS', label: 'ACCOUNTS', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { value: 'BROKER', label: 'BROKER', color: 'bg-slate-50 text-slate-500 border-slate-100' },
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
    { id: 'team', label: 'Team Management', icon: Users2, roles: ['TENANT_ADMIN', 'SALES_MANAGER'] },
    { id: 'profile', label: 'Company Profile', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'pipeline', label: 'Pipeline Stages', icon: GitMerge },
    { id: 'audit', label: 'Audit Log', icon: History, roles: ['TENANT_ADMIN'] },
  ].filter(t => !t.roles || t.roles.includes(user?.role || ''));

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-6 min-h-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
           <div>
              <h1 className="text-[20px] font-bold text-[var(--text-primary)] uppercase tracking-wide">Command Center</h1>
              <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mt-1">Authorized system and organizational overrides</p>
           </div>
        </div>

        <div className="flex gap-8">
          <aside className="w-64 flex flex-col gap-1 border-r border-[var(--border)] pr-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border ${
                  activeTab === tab.id 
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]' 
                  : 'text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-elevated)]'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
               <button className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-[var(--danger)] uppercase tracking-wider hover:bg-[var(--bg-elevated)] transition-all border border-transparent" onClick={logout}>
                  <LogOut size={16} /> Deauthorize
               </button>
            </div>
          </aside>

          <main className="flex-1 space-y-6">
            {activeTab === 'team' && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                  <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                    <Users2 size={14} className="text-[var(--accent)]" />
                    Internal Directory
                  </h3>
                  <button className="px-4 py-1.5 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)]" onClick={() => setShowInviteModal(true)}>
                    <UserPlus size={12} /> INITIALIZE STAFF
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                        <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Entity</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Class</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">State</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {users.map(u => {
                        return (
                          <tr key={u.id} className="hover:bg-[var(--bg-elevated)] transition-all">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)] uppercase">{u.name?.charAt(0)}</div>
                                 <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase">{u.name}</span>
                                    <span className="text-[10px] text-[var(--text-secondary)] lowercase">{u.email}</span>
                                 </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase border border-[var(--border)] px-2 py-0.5">
                                 {u.role.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${u.isActive ? 'bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)]' : 'bg-[var(--danger-bg)] border-[var(--danger)] text-[var(--danger)]'}`}>
                                 {u.isActive ? 'OPERATIONAL' : 'SUSPENDED'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {u.id !== user?.sub && (
                                <button className="text-[10px] font-bold text-[var(--accent)] uppercase hover:underline" onClick={() => toggleUserStatus(u.id)}>
                                  {u.isActive ? 'SUSPEND' : 'ACTIVATE'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden p-6 space-y-6">
                <div className="border-b border-[var(--border)] pb-4">
                  <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                    <Building size={14} className="text-[var(--accent)]" />
                    Corporation Framework
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Legal Identity</label>
                    <input className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] text-[12px] font-bold text-[var(--text-primary)] focus:border-[var(--accent)] outline-none uppercase" defaultValue="Skyline Developers" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">RERA Authorization</label>
                    <input className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] text-[12px] font-bold text-[var(--text-primary)] focus:border-[var(--accent)] outline-none uppercase font-mono" placeholder="UPRERAPRJXXXX" />
                  </div>
                </div>
                <div className="pt-4">
                   <button className="px-6 py-2 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[11px] font-bold uppercase hover:bg-[var(--bg-elevated)]">Authorize Commits</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden p-6">
                <div className="border-b border-[var(--border)] pb-4 mb-4">
                  <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                    <BellRing size={14} className="text-[var(--accent)]" />
                    Information Broadcast Logic
                  </h3>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {[
                    { id: 'n1', label: 'Authorization Signal on lead allocation', default: true },
                    { id: 'n2', label: 'Messaging Protocol on stage shift', default: true },
                    { id: 'n3', label: 'End-of-cycle diagnostic summary', default: false },
                    { id: 'n4', label: 'Operational site-visit proximity markers', default: true },
                  ].map(n => (
                    <div key={n.id} className="flex items-center justify-between py-4 group">
                      <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-tight group-hover:text-[var(--text-primary)] transition-colors">{n.label}</span>
                      <input type="checkbox" className="w-4 h-4 border-[var(--border)] bg-[var(--bg-surface)] text-[var(--accent)] focus:ring-[var(--accent)]" defaultChecked={n.default} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'pipeline' && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden p-6">
                <div className="border-b border-[var(--border)] pb-4 mb-6 flex justify-between items-center">
                  <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                    <GitMerge size={14} className="text-[var(--accent)]" />
                    Pipeline Evolution Logic
                  </h3>
                  <span className="text-[10px] font-bold text-[var(--danger)] uppercase border border-[var(--danger)] px-2 py-1">IMMUTABILITY LOCK</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-bold mb-6 uppercase tracking-tight">Current trajectory states are synchronized with internal reporting frameworks. Structural modifications are restricted.</p>
                <div className="flex flex-wrap gap-2">
                  {['NEW_LEAD', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'NEGOTIATION', 'BOOKING_DONE', 'LOST'].map(s => (
                    <span key={s} className="px-3 py-2 bg-[var(--bg-surface)] text-[var(--text-primary)] text-[11px] font-bold uppercase border border-[var(--border)]">
                       {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
                <div className="px-4 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border)] flex justify-between items-center">
                   <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                      <History size={14} className="text-[var(--accent)]" />
                      Global Execution Registry
                   </h3>
                   <div className="flex gap-2">
                      <select className="bg-[var(--bg-surface)] px-2 py-1 border border-[var(--border)] text-[var(--text-primary)] text-[10px] font-bold uppercase outline-none" value={auditFilter} onChange={e => setAuditFilter(e.target.value)}>
                         <option value="">ALL ENTITIES</option>
                         {['LEAD','BOOKING','PAYMENT','REFUND','USER','PROJECT'].map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                        <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Signature</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase text-center">Action</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {auditLogs.map(log => (
                        <React.Fragment key={log.id}>
                          <tr className="hover:bg-[var(--bg-elevated)] transition-all cursor-pointer group" onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                            <td className="px-4 py-3 text-[11px] font-bold text-[var(--text-secondary)] font-mono">
                               {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                   <div className="w-7 h-7 bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[9px] font-bold text-[var(--text-primary)] uppercase">{log.user?.name?.charAt(0) || 'S'}</div>
                                   <div className="flex flex-col">
                                      <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase">{log.user?.name || 'SYSTEM'}</span>
                                      <span className="text-[9px] text-[var(--text-muted)] uppercase">{log.entity} <code className="font-mono">{log.entityId.slice(-6)}</code></span>
                                   </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                                 log.action === 'CREATE' ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]' : 
                                 log.action === 'DELETE' ? 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]' : 
                                 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                               <ChevronRight size={14} className={`text-[var(--text-muted)] transition-transform ${expandedLog === log.id ? 'rotate-90 text-[var(--accent)]' : ''}`} />
                            </td>
                          </tr>
                          {expandedLog === log.id && (
                            <tr className="bg-[var(--bg-elevated)]">
                              <td colSpan={4} className="px-6 py-6 border-l-4 border-[var(--accent)]">
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                       <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Antecedent State</div>
                                       <pre className="bg-[var(--bg-surface)] p-4 border border-[var(--border)] text-[10px] font-mono text-[var(--text-secondary)] overflow-x-auto h-40">{JSON.stringify(log.oldData, null, 2) || 'NONE'}</pre>
                                    </div>
                                    <div className="space-y-2">
                                       <div className="text-[10px] font-bold text-[var(--accent)] uppercase">Mutation</div>
                                       <pre className="bg-[var(--bg-surface)] p-4 border border-[var(--border)] text-[10px] font-mono text-[var(--text-primary)] overflow-x-auto h-40">{JSON.stringify(log.newData, null, 2)}</pre>
                                    </div>
                                 </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 flex justify-between items-center bg-[var(--bg-elevated)] border-t border-[var(--border)]">
                   <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{auditTotal} EVENTS REGISTERED</span>
                   <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border)] text-[10px] font-bold uppercase disabled:opacity-50" disabled={auditPage === 1} onClick={() => setAuditPage(auditPage - 1)}>PREV</button>
                      <span className="px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-primary)]">{auditPage}</span>
                      <button className="px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border)] text-[10px] font-bold uppercase disabled:opacity-50" disabled={auditLogs.length < 50} onClick={() => setAuditPage(auditPage + 1)}>NEXT</button>
                   </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#F5F5F5]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInviteModal(false)}>
          <div className="bg-[var(--bg-surface)] w-full max-w-sm border border-[var(--border)] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
             <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-surface)]">
               <div>
                  <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wide">Protocol Initiation</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-0.5">Staff Authorization Sequence</p>
               </div>
               <button className="text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => setShowInviteModal(false)}>
                  <X size={20} />
               </button>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Identity</label>
                  <input className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-[12px] font-bold focus:border-[var(--accent)] outline-none uppercase" placeholder="STAFF NAME" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} />
               </div>
               <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Transmission Hash</label>
                  <input className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-[12px] font-bold focus:border-[var(--accent)] outline-none lowercase" placeholder="EMAIL" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} />
               </div>
               <div className="space-y-1">
                   <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Authorization Tier</label>
                   <select className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-[12px] font-bold focus:border-[var(--accent)] outline-none uppercase" value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}>
                     {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                   </select>
               </div>
               <div className="pt-4">
                  <button className="w-full py-3 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[11px] font-bold uppercase hover:bg-[var(--bg-elevated)]" onClick={handleInvite}>
                     EXECUTE AUTHORIZATION
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
