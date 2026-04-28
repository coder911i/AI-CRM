'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import { Users2, Plus, Search, Filter, Download, ChevronRight, Phone, Mail, Fingerprint, Percent, Activity, X } from 'lucide-react';

export default function BrokersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', commissionPct: 2.0 });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { api.get<any[]>('/brokers').then(setBrokers).catch(console.error).finally(() => setLoading(false)); }
  }, [user, authLoading]);

  const createBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/brokers', form);
      setShowCreate(false);
      api.get<any[]>('/brokers').then(setBrokers);
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) return (
    <CRMLayout>
      <div className="p-8 space-y-8 bg-[var(--bg-primary)] min-h-screen">
        <div className="h-12 w-64 animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
        <div className="grid grid-cols-1 gap-6">
          <div className="h-[400px] animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
        </div>
      </div>
    </CRMLayout>
  );

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-8 min-h-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-4 border-[var(--border)]">
           <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-3">
                 <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                 Network Distribution Protocol
              </div>
              <h1 className="text-[24px] font-black text-[var(--text-primary)] uppercase tracking-tight italic flex items-center gap-4">
                 <Users2 size={28} className="text-[var(--accent)]" />
                 Partner Distribution Network
              </h1>
              <p className="text-[var(--text-secondary)] text-[11px] font-bold uppercase mt-2 italic">Registry of {brokers.length} authorized brokerage entities currently indexed</p>
           </div>
           <div className="flex gap-4">
              <button className="px-6 py-4 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2 italic">
                 <Download size={16} /> EXPORT_NETWORK
              </button>
              <button className="px-8 py-4 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[var(--accent)] transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_var(--accent-light)] italic" onClick={() => setShowCreate(true)}>
                 <Plus size={18} /> INITIALIZE_PARTNER
              </button>
           </div>
        </div>

        <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[8px_8px_0px_0px_var(--border)] overflow-hidden">
           <div className="px-6 py-4 border-b-2 border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
              <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2 italic">
                 <Activity size={14} className="text-[var(--accent)]" />
                 Active Network Registry Matrix
              </h3>
              <div className="flex items-center gap-4">
                 <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic bg-white border border-[var(--border)] px-3 py-1">SYNC_ACTIVE: VER_4.8</span>
                 <div className="w-2.5 h-2.5 bg-[var(--success)] animate-pulse" />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-elevated)] border-b-2 border-[var(--border)]">
                    <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Partner_Identity</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Inception_Contact</th>
                    <th className="px-6 py-5 text-[10px) font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Yield_Factor</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Asset_Count</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Protocol_ID</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">State</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[var(--border)]">
                  {brokers.map(b => (
                    <tr key={b.id} className="hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer group" onClick={() => router.push(`/brokers/${b.id}`)}>
                      <td className="px-6 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[var(--border)] flex items-center justify-center text-[12px] font-black text-white border-2 border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] transition-all">
                               {b.name ? b.name[0].toUpperCase() : 'P'}
                            </div>
                            <span className="text-[14px] font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors tracking-tight uppercase italic">{b.name}</span>
                         </div>
                      </td>
                      <td className="px-6 py-6">
                         <div className="space-y-1">
                            <div className="text-[12px] font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2 lowercase">
                               <Mail size={14} className="text-[var(--accent)]" /> {b.email || 'VOID'}
                            </div>
                            <div className="text-[10px] font-black text-[var(--text-muted)] tracking-widest flex items-center gap-2 uppercase font-mono">
                               <Phone size={12} /> {b.phone}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-6">
                         <div className="flex items-center gap-1.5 text-[14px] font-black text-[var(--text-primary)] font-mono italic">
                            <Percent size={14} className="text-[var(--accent)]" />
                            {b.commissionPct.toFixed(2)}
                         </div>
                      </td>
                      <td className="px-6 py-6 font-mono text-[14px] font-black text-[var(--text-secondary)]">
                         {b._count?.leads ?? 0}
                      </td>
                      <td className="px-6 py-6">
                         <div className="inline-flex items-center gap-2 bg-[var(--bg-elevated)] border-2 border-[var(--border)] px-3 py-1.5 shadow-[2px_2px_0px_0px_var(--border)]">
                            <Fingerprint size={12} className="text-[var(--accent)]" />
                            <code className="text-[11px] font-black text-[var(--text-primary)] font-mono">{b.referralCode.toUpperCase()}</code>
                         </div>
                      </td>
                      <td className="px-6 py-6">
                         <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 transition-all italic ${
                            b.isActive ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]' : 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]'
                         }`}>
                            {b.isActive ? 'OPERATIONAL' : 'DEACTIVATED'}
                         </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                         <div className="inline-flex p-2 border-2 border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all">
                            <ChevronRight size={18} />
                         </div>
                      </td>
                    </tr>
                  ))}
                  
                  {!brokers.length && (
                    <tr>
                      <td colSpan={7} className="py-48 text-center bg-[var(--bg-surface)]">
                        <div className="space-y-6">
                           <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--bg-elevated)] border-2 border-[var(--border)] mb-4 text-[var(--text-muted)] shadow-[6px_6px_0px_0px_var(--border)]">
                              <Users2 size={40} />
                           </div>
                           <div>
                              <h4 className="text-[16px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">PARTNER_GRID_VOID</h4>
                              <p className="text-[11px] text-[var(--text-secondary)] font-bold italic mt-2 max-w-[300px] mx-auto uppercase tracking-tighter opacity-60">No authorized brokerage entities discovered in current network scan.</p>
                           </div>
                           <button className="px-8 py-3 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[11px] font-black uppercase tracking-widest mt-8 hover:bg-[var(--accent)] hover:text-white transition-all italic" onClick={() => setShowCreate(true)}>INITIALIZE_PRIMARY_PARTNER</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCreate(false)}>
          <div className="bg-[var(--bg-surface)] w-full max-w-md border-4 border-[var(--border)] shadow-[10px_10px_0px_0px_var(--border)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b-4 border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
               <div>
                  <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Partner Onboarding Matrix</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter mt-1">Authorized Agent Credentialing [SEC_9.2]</p>
               </div>
               <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" onClick={() => setShowCreate(false)}>
                  <X size={24} />
               </button>
            </div>
            
            <form onSubmit={createBroker} className="p-8 space-y-8">
              <div className="space-y-3">
                 <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                    Entity Descriptor
                 </label>
                 <div className="relative">
                    <Users2 size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                    <input className="w-full pl-14 pr-6 py-5 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[14px] font-black focus:border-[var(--accent)] outline-none transition-all uppercase italic placeholder:text-[var(--text-muted)]" placeholder="LEGAL BUSINESS NAME" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                       Contact Signal
                    </label>
                    <div className="relative">
                       <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                       <input className="w-full pl-14 pr-6 py-5 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[14px] font-black focus:border-[var(--accent)] outline-none transition-all font-mono italic" placeholder="+91 ..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                       Yield Factor %
                    </label>
                    <div className="relative">
                       <Percent size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                       <input type="number" step="0.5" className="w-full pl-14 pr-6 py-5 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[14px] font-black focus:border-[var(--accent)] outline-none transition-all font-mono italic" value={form.commissionPct} onChange={e => setForm({...form, commissionPct: parseFloat(e.target.value)})} />
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                    Communication Channel
                 </label>
                 <div className="relative">
                    <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                    <input type="email" className="w-full pl-14 pr-6 py-5 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[14px] font-black focus:border-[var(--accent)] outline-none transition-all placeholder:text-[var(--text-muted)] lowercase italic" placeholder="PARTNER@PROTOCOL.COM" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                 </div>
              </div>

              <div className="pt-6 border-t-2 border-[var(--border)]">
                 <button type="submit" className="w-full bg-[var(--accent)] border-2 border-[var(--accent)] text-white py-5 text-[13px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-[var(--accent)] transition-all italic shadow-[6px_6px_0px_0px_var(--accent-light)]">
                    FINALIZE PARTNER AUTHORIZATION
                 </button>
                 <p className="text-[9px] text-[var(--text-muted)] font-black text-center mt-6 uppercase tracking-widest italic">System generated referral code will be attributed immediately.</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
