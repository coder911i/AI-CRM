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
      <div className="bg-[#0F1117] min-h-screen text-[#F1F3F5] p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2E3340]">
           <div>
              <h1 className="text-3xl font-black text-[#F1F3F5] tracking-tighter uppercase">Command Center</h1>
              <p className="text-[#8B909A] text-sm font-medium mt-1 lowercase tracking-widest text-[10px] font-black uppercase">Authorized system and organizational overrides</p>
           </div>
        </div>

        <div className="flex gap-10">
          <aside className="w-64 flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-[#1A1D23] text-[#F1F3F5] shadow-lg border border-[#2E3340]' 
                  : 'text-[#8B909A] hover:bg-[#1A1D23] hover:text-[#F1F3F5]'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} className={activeTab === tab.id ? 'text-[#4F6EF7]' : 'text-[#8B909A]'} />
                {tab.label}
              </button>
            ))}
            <div className="mt-10 pt-6 border-t border-slate-50">
               <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 transition-all" onClick={logout}>
                  <LogOut size={16} /> Deauthorize System
               </button>
            </div>
          </aside>

          <main className="flex-1 space-y-6">
            {activeTab === 'team' && (
              <div className="bg-[#1A1D23] rounded-2xl border border-[#2E3340] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#2E3340] flex justify-between items-center">
                  <h3 className="text-[11px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                    <Users2 size={14} className="text-[#8B909A]" />
                    Internal Directory
                  </h3>
                  <button className="btn btn-primary btn-xs flex items-center gap-2 text-[9px] px-4" onClick={() => setShowInviteModal(true)}>
                    <UserPlus size={12} /> INITIALIZE STAFF
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0F1117] border-b border-[#2E3340] font-mono">
                        <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest">Entity</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest">Class</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest">State</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2E3340]">
                      {users.map(u => {
                        const role = ROLES.find(r => r.value === u.role);
                        return (
                          <tr key={u.id} className="hover:bg-[#22262F] transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-[#2E3340] flex items-center justify-center text-[10px] font-black text-[#F1F3F5] uppercase">{u.name?.charAt(0)}</div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-[#F1F3F5] tracking-tight uppercase">{u.name}</span>
                                    <span className="text-[10px] font-bold text-[#8B909A] lowercase">{u.email}</span>
                                 </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${role?.color}`}>
                                 {u.role.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                 {u.isActive ? 'OPERATIONAL' : 'SUSPENDED'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {u.id !== user?.sub && (
                                <button className="text-[10px] font-black text-[#8B909A] uppercase tracking-widest hover:text-[#4F6EF7] transition-colors underline decoration-[#2E3340] underline-offset-4" onClick={() => toggleUserStatus(u.id)}>
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
              <div className="bg-[#1A1D23] rounded-2xl border border-[#2E3340] shadow-sm overflow-hidden p-8 space-y-8">
                <div className="border-b border-[#2E3340] pb-6">
                  <h3 className="text-[11px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                    <Building size={14} className="text-[#8B909A]" />
                    Corporation Framework
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest ml-1">Legal Identity</label>
                    <input className="w-full px-4 py-3 bg-[#0F1117] border border-[#2E3340] rounded-xl text-sm font-bold text-[#F1F3F5] focus:ring-2 focus:ring-[#4F6EF7]/10 transition-all uppercase" defaultValue="Skyline Developers" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest ml-1">RERA Authorization</label>
                    <input className="w-full px-4 py-3 bg-[#0F1117] border border-[#2E3340] rounded-xl text-sm font-bold text-[#F1F3F5] focus:ring-2 focus:ring-[#4F6EF7]/10 transition-all font-mono uppercase" placeholder="UPRERAPRJXXXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest ml-1">Command Signal Email</label>
                    <input className="w-full px-4 py-3 bg-[#0F1117] border border-[#2E3340] rounded-xl text-sm font-bold text-[#F1F3F5] focus:ring-2 focus:ring-[#4F6EF7]/10 transition-all lowercase" defaultValue={user?.email} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest ml-1">Insignia Path</label>
                    <input className="w-full px-4 py-3 bg-[#0F1117] border border-[#2E3340] rounded-xl text-sm font-bold text-[#F1F3F5] focus:ring-2 focus:ring-[#4F6EF7]/10 transition-all" placeholder="https://..." />
                  </div>
                </div>
                <div className="pt-4">
                   <button className="btn btn-primary px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20">Authorize Commits</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-[#1A1D23] rounded-2xl border border-[#2E3340] shadow-sm overflow-hidden p-8">
                <div className="border-b border-[#2E3340] pb-6 mb-4">
                  <h3 className="text-[11px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                    <BellRing size={14} className="text-[#8B909A]" />
                    Information Broadcast Logic
                  </h3>
                </div>
                <div className="divide-y divide-[#2E3340]">
                  {[
                    { id: 'n1', label: 'Authorization Signal on lead allocation', default: true },
                    { id: 'n2', label: 'Messaging Protocol on stage shift', default: true },
                    { id: 'n3', label: 'End-of-cycle diagnostic summary', default: false },
                    { id: 'n4', label: 'Operational site-visit proximity markers', default: true },
                  ].map(n => (
                    <div key={n.id} className="flex items-center justify-between py-5 group">
                      <span className="text-xs font-black text-[#8B909A] uppercase tracking-tight group-hover:text-[#F1F3F5] transition-colors">{n.label}</span>
                      <input type="checkbox" className="w-4 h-4 rounded border-[#2E3340] bg-[#0F1117] text-[#4F6EF7] focus:ring-[#4F6EF7]" defaultChecked={n.default} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'pipeline' && (
              <div className="bg-[#1A1D23] rounded-2xl border border-[#2E3340] shadow-sm overflow-hidden p-8">
                <div className="border-b border-[#2E3340] pb-6 mb-8 flex justify-between items-center">
                  <h3 className="text-[11px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                    <GitMerge size={14} className="text-[#8B909A]" />
                    Pipeline Evolution Logic
                  </h3>
                  <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter bg-rose-50 px-2 py-1 rounded border border-rose-100">Immutability Lock Enabled</span>
                </div>
                <p className="text-[11px] text-[#5A5F6B] font-medium mb-8 leading-relaxed uppercase tracking-tighter">Current trajectory states are synchronized with internal reporting frameworks. Structural modifications are restricted.</p>
                <div className="flex flex-wrap gap-3">
                  {['NEW_LEAD', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'NEGOTIATION', 'BOOKING_DONE', 'LOST'].map(s => (
                    <span key={s} className="px-3 py-2 bg-[#0F1117] text-[#F1F3F5] text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg border border-[#2E3340]">
                       {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="bg-[#1A1D23] rounded-2xl border border-[#2E3340] shadow-sm overflow-hidden">
                <div className="px-6 py-5 bg-[#0F1117] border-b border-[#2E3340] flex justify-between items-center">
                   <h3 className="text-[11px] font-black text-[#F1F3F5] uppercase tracking-widest flex items-center gap-2">
                      <History size={14} className="text-[#8B909A]" />
                      Global Execution Registry
                   </h3>
                   <div className="flex gap-4">
                      <select className="bg-[#1A1D23] px-3 py-1.5 border border-[#2E3340] text-[#F1F3F5] rounded-lg text-[9px] font-black uppercase tracking-widest outline-none" value={auditFilter} onChange={e => setAuditFilter(e.target.value)}>
                         <option value="">ALL ENTITIES</option>
                         {['LEAD','BOOKING','PAYMENT','REFUND','USER','PROJECT'].map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <select className="bg-[#1A1D23] px-3 py-1.5 border border-[#2E3340] text-[#F1F3F5] rounded-lg text-[9px] font-black uppercase tracking-widest outline-none" value={auditActionFilter} onChange={e => setAuditActionFilter(e.target.value)}>
                        <option value="">ALL ACTIONS</option>
                        {['CREATE','UPDATE','DELETE','LOGIN','VERIFY'].map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0F1117] border-b border-[#2E3340]">
                        <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest font-mono">Timestamp</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest">Entity Signature</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[#5A5F6B] uppercase tracking-widest text-center">Protocol Action</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2E3340]">
                      {auditLogs.map(log => (
                        <React.Fragment key={log.id}>
                          <tr className="hover:bg-[#22262F] transition-all cursor-pointer group" onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                            <td className="px-6 py-4 text-[10px] font-bold text-[#8B909A] font-mono italic">
                               {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-[#2E3340] flex items-center justify-center text-[9px] font-black text-[#F1F3F5] border border-[#2E3340] shadow-sm uppercase">{log.user?.name?.charAt(0) || 'S'}</div>
                                  <div className="flex flex-col">
                                     <span className="text-xs font-black text-[#F1F3F5] group-hover:text-[#4F6EF7] transition-colors uppercase tracking-tight">{log.user?.name || 'SYSTEM_SYNC'}</span>
                                     <span className="text-[9px] font-bold text-[#8B909A] uppercase tracking-tighter">{log.entity} <code className="text-[#5A5F6B]">#{log.entityId.slice(-6)}</code></span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                 log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                 log.action === 'DELETE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                 'bg-slate-50 text-slate-600 border-slate-100'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <ChevronRight size={14} className={`text-[#5A5F6B] transition-transform ${expandedLog === log.id ? 'rotate-90 text-[#4F6EF7]' : ''}`} />
                            </td>
                          </tr>
                          {expandedLog === log.id && (
                            <tr className="bg-[#22262F]">
                              <td colSpan={4} className="px-8 py-8 border-l-4 border-[#4F6EF7]">
                                 <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                       <div className="text-[9px] font-black text-[#8B909A] uppercase tracking-widest flex items-center gap-2">
                                          <AlertCircle size={10} /> Antecedent State
                                       </div>
                                       <pre className="bg-[#0F1117] p-6 rounded-xl border border-[#2E3340] text-[9px] font-mono font-bold text-[#8B909A] overflow-x-auto shadow-inner h-48">{JSON.stringify(log.oldData, null, 2) || 'NONE_RECORDED'}</pre>
                                    </div>
                                    <div className="space-y-3">
                                       <div className="text-[9px] font-black text-[#4F6EF7] uppercase tracking-widest flex items-center gap-2">
                                          <CheckCircle2 size={10} /> Mutation Execution
                                       </div>
                                       <pre className="bg-[#0F1117] p-6 rounded-xl border border-[#2E3340] text-[9px] font-mono font-bold text-[#F1F3F5] overflow-x-auto shadow-inner h-48">{JSON.stringify(log.newData, null, 2)}</pre>
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
                <div className="px-8 py-5 flex justify-between items-center bg-[#0F1117] border-t border-[#2E3340]">
                   <span className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest italic">{auditTotal} SYSTEM EVOCATIONS REGISTERED</span>
                   <div className="flex gap-2">
                      <button className="btn btn-secondary px-4 py-2 text-[9px] font-black uppercase tracking-widest" disabled={auditPage === 1} onClick={() => setAuditPage(auditPage - 1)}>ANTECEDENT</button>
                      <span className="px-4 py-2 text-[10px] font-black text-[#F1F3F5] border border-[#2E3340] bg-[#1A1D23] rounded-lg">{auditPage}</span>
                      <button className="btn btn-secondary px-4 py-2 text-[9px] font-black uppercase tracking-widest" disabled={auditLogs.length < 50} onClick={() => setAuditPage(auditPage + 1)}>SUBSEQUENT</button>
                   </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1A1D23] w-full max-w-sm rounded-3xl shadow-2xl border border-[#2E3340] overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 border-b border-[#2E3340] flex justify-between items-center bg-[#0F1117]">
               <div>
                  <h3 className="text-sm font-black text-[#F1F3F5] uppercase tracking-widest">Protocol Initiation</h3>
                  <p className="text-[10px] text-[#5A5F6B] font-bold uppercase tracking-tighter mt-0.5">Staff Authorization Sequence</p>
               </div>
               <button className="p-2 hover:bg-[#22262F] rounded-xl transition-colors text-[#8B909A]" onClick={() => setShowInviteModal(false)}>
                  <X size={20} />
               </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest ml-1">Identity Identifier</label>
                  <input className="w-full px-4 py-3 bg-[#0F1117] border border-[#2E3340] text-[#F1F3F5] rounded-xl text-sm font-black focus:ring-2 focus:ring-[#4F6EF7]/10 transition-all uppercase" placeholder="LEGAL STAFF NAME" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest ml-1">Primary Transmission Hash</label>
                  <input className="w-full px-4 py-3 bg-[#0F1117] border border-[#2E3340] text-[#F1F3F5] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#4F6EF7]/10 transition-all lowercase" placeholder="EMAIL@PROTOCOL.IO" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} />
               </div>
               <div className="space-y-2">
                   <label className="text-[10px] font-black text-[#5A5F6B] uppercase tracking-widest ml-1">Authorization Tier</label>
                   <select className="w-full px-4 py-3 bg-[#0F1117] border border-[#2E3340] text-[#F1F3F5] rounded-xl text-sm font-black focus:ring-2 focus:ring-[#4F6EF7]/10 transition-all uppercase appearance-none" value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}>
                     {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                   </select>
               </div>
               <div className="pt-4">
                  <button className="w-full btn btn-primary py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all font-mono" onClick={handleInvite}>
                     EXECUTE AUTHORIZATION
                  </button>
                  <p className="text-[9px] text-slate-300 font-bold text-center mt-6 uppercase tracking-tighter italic">Credentials will be transmitted via encrypted channel.</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
