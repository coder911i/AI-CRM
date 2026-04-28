'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import { Receipt, IndianRupee, Calendar, Building2, User, ChevronRight, PieChart, TrendingUp, Filter, Download, Plus, Layout } from 'lucide-react';

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { api.get<any[]>('/bookings').then(setBookings).catch(console.error).finally(() => setLoading(false)); }
  }, [user, authLoading]);

  if (authLoading || loading) return (
    <CRMLayout>
      <div className="p-8 space-y-8 bg-[var(--bg-primary)] min-h-full">
        <div className="h-10 w-64 animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>)}
        </div>
        <div className="h-[500px] w-full animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
      </div>
    </CRMLayout>
  );

  const statusBadge = (s: string) => {
    switch(s) { 
      case 'CONFIRMED': return 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]'; 
      case 'CANCELLED': return 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]'; 
      case 'PAYMENT_PENDING': return 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]'; 
      default: return 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]'; 
    }
  };

  const totalValue = bookings.reduce((acc, b) => acc + (b.bookingAmount || 0), 0);

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-6 min-h-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
           <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                 <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                 Financial Transaction Ledger
              </div>
              <h1 className="text-[20px] font-bold text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-3 italic">
                 Audit Intelligence Matrix
              </h1>
              <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mt-1 italic">Verified Records: {bookings.length} Finalized Submissions</p>
           </div>
           <div className="flex gap-2">
              <button className="px-6 py-2 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2">
                 <Download size={14} /> Structural Export
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-[var(--bg-surface)] p-6 border-2 border-[var(--accent)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5"><IndianRupee size={60} /></div>
              <div className="flex items-center gap-5 relative z-10">
                 <div className="w-14 h-14 bg-[var(--accent-light)] flex items-center justify-center border-2 border-[var(--accent)]">
                    <IndianRupee size={28} className="text-[var(--accent)]" />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] block mb-0.5 italic">Capital Closure</label>
                    <div className="text-[28px] font-bold text-[var(--text-primary)] font-mono tracking-tight italic">₹{(totalValue/100000).toFixed(2)}L</div>
                 </div>
              </div>
           </div>
           <div className="bg-[var(--bg-surface)] p-6 border-2 border-[var(--border)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5"><PieChart size={60} /></div>
              <div className="flex items-center gap-5 relative z-10">
                 <div className="w-14 h-14 bg-[var(--bg-elevated)] flex items-center justify-center border-2 border-[var(--border)]">
                    <PieChart size={28} className="text-[var(--accent)]" />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] block mb-0.5 italic">Asset Velocity</label>
                    <div className="text-[28px] font-bold text-[var(--text-primary)] font-mono tracking-tight italic">{(bookings.length / 30).toFixed(1)} <span className="text-[14px]">D/R</span></div>
                 </div>
              </div>
           </div>
           <div className="bg-[var(--bg-surface)] p-6 border-2 border-[var(--border)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5"><TrendingUp size={60} /></div>
              <div className="flex items-center gap-5 relative z-10">
                 <div className="w-14 h-14 bg-[var(--bg-elevated)] flex items-center justify-center border-2 border-[var(--border)]">
                    <TrendingUp size={28} className="text-[var(--success)]" />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] block mb-0.5 italic">Operational Index</label>
                    <div className="text-[28px] font-bold text-[var(--text-primary)] font-mono tracking-tight italic">94.2%</div>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] overflow-hidden">
           <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
              <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3 italic">
                 <Filter size={16} className="text-[var(--accent)]" />
                 Active Transaction Matrix
              </h3>
              <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase border border-[var(--border)] px-4 py-1.5 bg-[var(--bg-surface)] tracking-tighter">
                 Real-Time Ledger Synchronization Active
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-elevated)] border-b-2 border-[var(--border)]">
                    <th className="px-5 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border-r border-[var(--border)]">Entity Identity</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border-r border-[var(--border)]">Asset Coordinates</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border-r border-[var(--border)]">Valuation Index</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-center border-r border-[var(--border)]">Operational State</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Entry Timestamp</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer group" onClick={() => router.push(`/bookings/${b.id}`)}>
                      <td className="px-5 py-5 border-r border-[var(--border)]">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[var(--bg-elevated)] border-2 border-[var(--border)] flex items-center justify-center text-[12px] font-bold text-[var(--text-primary)] uppercase font-mono group-hover:border-[var(--accent)] transition-colors">
                               {b.buyerName ? b.buyerName[0] : 'U'}
                            </div>
                            <span className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors italic">{b.buyerName}</span>
                         </div>
                      </td>
                      <td className="px-5 py-5 border-r border-[var(--border)]">
                         <div className="space-y-1">
                            <div className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
                               <Layout size={14} className="text-[var(--accent)]" /> Unit {b.unit?.unitNumber || 'TDB'}
                            </div>
                            <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 italic">
                               <Building2 size={12} /> {b.unit?.tower?.project?.name || 'GENERIC ASSET'}
                            </div>
                         </div>
                      </td>
                      <td className="px-5 py-5 border-r border-[var(--border)]">
                         <span className="text-[13px] font-bold text-[var(--text-primary)] font-mono italic">₹{b.bookingAmount?.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-5 text-center border-r border-[var(--border)]">
                         <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] border-2 ${statusBadge(b.status)}`}>
                            {b.status?.replace(/_/g,' ')}
                         </span>
                      </td>
                      <td className="px-5 py-5">
                         <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] uppercase font-mono">
                            <Calendar size={14} className="text-[var(--text-muted)]" />
                            {new Date(b.createdAt).toLocaleDateString()}
                         </div>
                      </td>
                      <td className="px-5 py-5 text-right">
                         <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all inline translate-x-0 group-hover:translate-x-1" />
                      </td>
                    </tr>
                  ))}
                  
                  {!bookings.length && (
                    <tr>
                      <td colSpan={6} className="py-32 text-center bg-[var(--bg-surface)]">
                        <div className="space-y-6">
                           <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--bg-elevated)] border-2 border-dashed border-[var(--border)] text-[var(--text-muted)] group">
                              <Receipt size={40} className="group-hover:scale-110 transition-transform" />
                           </div>
                           <div>
                              <h4 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-[0.2em] italic">Ledger Matrix Inactive</h4>
                              <p className="text-[10px] text-[var(--text-secondary)] font-bold italic mt-2 max-w-[280px] mx-auto uppercase tracking-tighter leading-relaxed">No finalized transaction records identified within current synchronization cycle.</p>
                           </div>
                           <button className="px-10 py-3 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all italic mt-8" onClick={() => router.push('/leads')}>Initialize Transaction Protocol</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </CRMLayout>
  );
}
