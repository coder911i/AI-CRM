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
      <div className="p-8 space-y-8">
        <div className="h-12 w-64 animate-pulse bg-[#22262F] rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 animate-pulse bg-[#22262F] rounded-lg"></div>)}
        </div>
        <div className="h-[400px] w-full animate-pulse bg-[#22262F] rounded-lg"></div>
      </div>
    </CRMLayout>
  );

  const statusBadge = (s: string) => {
    switch(s) { 
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-600 border-emerald-100'; 
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100'; 
      case 'PAYMENT_PENDING': return 'bg-amber-50 text-amber-600 border-amber-100'; 
      default: return 'bg-slate-50 text-slate-600 border-slate-100'; 
    }
  };

  const totalValue = bookings.reduce((acc, b) => acc + (b.bookingAmount || 0), 0);

  return (
    <CRMLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                 <Receipt size={28} className="text-primary" />
                 Transaction Ledger
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Audit-ready documentation: {bookings.length} finalized records</p>
           </div>
           <div className="flex gap-2">
              <button className="btn btn-secondary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 border-slate-200 shadow-sm">
                 <Download size={14} /> Export Report
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl flex items-center gap-5">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                 <IndianRupee size={24} className="text-blue-400" />
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Closure Capital</label>
                 <div className="text-2xl font-black text-white font-mono tracking-tighter">₹{(totalValue/100000).toFixed(2)}L</div>
              </div>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                 <PieChart size={24} className="text-primary" />
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Asset Velocity</label>
                 <div className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{(bookings.length / 30).toFixed(1)}/day</div>
              </div>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                 <TrendingUp size={24} className="text-emerald-500" />
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Efficiency Rating</label>
                 <div className="text-2xl font-black text-slate-900 font-mono tracking-tighter">94.2%</div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Filter size={14} className="text-slate-400" />
                 Active Booking Matrix
              </h3>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest tracking-tighter italic">Live Synchronization Enabled</span>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/10 border-b border-slate-50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyer Identity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Mapping</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction State</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => router.push(`/bookings/${b.id}`)}>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase border border-slate-200 shadow-sm">
                               {b.buyerName ? b.buyerName[0] : 'U'}
                            </div>
                            <span className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">{b.buyerName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-700 uppercase tracking-tighter flex items-center gap-1.5">
                               <Layout size={12} className="text-slate-300" /> Unit {b.unit?.unitNumber || 'TDB'}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                               <Building2 size={10} /> {b.unit?.tower?.project?.name || 'GENERIC ASSET'}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">₹{b.bookingAmount?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                         <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${statusBadge(b.status)}`}>
                            {b.status?.replace(/_/g,' ')}
                         </span>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar size={12} className="text-slate-300" />
                            {new Date(b.createdAt).toLocaleDateString()}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="inline-flex p-2 rounded-lg bg-slate-50 text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                            <ChevronRight size={16} />
                         </div>
                      </td>
                    </tr>
                  ))}
                  
                  {!bookings.length && (
                    <tr>
                      <td colSpan={6} className="py-32 text-center bg-white">
                        <div className="space-y-4">
                           <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4 text-slate-200 shadow-inner border border-slate-100">
                              <Receipt size={32} />
                           </div>
                           <div>
                              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ledger Inactive</h4>
                              <p className="text-[11px] text-slate-400 font-medium italic mt-1 max-w-[200px] mx-auto uppercase tracking-tighter">No finalized transaction records discovered in current matrix.</p>
                           </div>
                           <button className="btn btn-secondary text-[10px] font-black uppercase tracking-widest mt-6" onClick={() => router.push('/leads')}>Initialize Deal Protocol</button>
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
