'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import Link from 'next/link';
import { 
  IndianRupee, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Building2, 
  FileText, 
  ArrowUpRight, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Briefcase,
  ChevronRight,
  Sparkles,
  Layout
} from 'lucide-react';

export default function PortalDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const email = typeof window !== 'undefined' ? localStorage.getItem('waterting_portal_email') : null;

  useEffect(() => {
    if (!email) { router.push('/portal/login'); return; }
    api.get<any>('/portal/dashboard').then(setData).catch(() => router.push('/portal/login')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const totalValue = data?.bookings?.reduce((acc: number, b: any) => acc + (b.grandTotal || 0), 0) || 0;
  const paidAmount = data?.bookings?.reduce((acc: number, b: any) => 
    acc + (b.payments?.filter((p: any) => p.paidAt).reduce((sum: number, p: any) => sum + p.amount, 0) || 0), 0) || 0;
  const outstanding = totalValue - paidAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
             <ShieldCheck size={28} className="text-primary" />
             Property Portfolio
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest text-[10px] font-black">Strategic Intelligence Briefing</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 shadow-xl">
           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <User size={16} className="text-primary" />
           </div>
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Authenticated Entity</span>
              <span className="text-xs font-black text-white font-mono">{email}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Booking Asset Value', value: totalValue, icon: <IndianRupee className="text-blue-500" />, sub: 'Total Portfolio' },
          { label: 'Realized Capital', value: paidAmount, icon: <CheckCircle2 className="text-emerald-500" />, sub: 'Net Paid' },
          { label: 'Pending Liquidity', value: outstanding, icon: <Clock className="text-amber-500" />, sub: 'Outstanding' },
          { label: 'Strategic Visitors', value: data?.visits?.filter((v:any) => new Date(v.scheduledAt) > new Date()).length || 0, icon: <Calendar className="text-violet-500" />, sub: 'Pending Visits', isRaw: true }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex flex-col gap-3 group hover:border-primary/20 transition-all">
             <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                   {stat.icon}
                </div>
                <ArrowUpRight size={14} className="text-slate-200 group-hover:text-primary transition-colors" />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{stat.label}</label>
                <div className="text-xl font-black text-slate-900 font-mono tracking-tighter">
                   {stat.isRaw ? stat.value : `₹${stat.value.toLocaleString()}`}
                </div>
                <span className="text-[9px] font-bold text-slate-300 uppercase mt-2 block tracking-tighter italic">{stat.sub}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                Active Asset Portfolio
             </h3>
             <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Portfolio Map</button>
          </div>

          <div className="space-y-6">
            {data?.bookings?.map((booking: any) => {
              const paid = booking.payments?.filter((p: any) => p.paidAt).reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
              const progress = (paid / booking.grandTotal) * 100;
              const nextInstallment = booking.payments?.find((p: any) => !p.paidAt);

              return (
                <div key={booking.id} className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-md group hover:border-primary/10 transition-all overflow-hidden relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-xl">
                          <Building2 size={24} className="text-primary" />
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">{booking.unit?.tower?.project?.name}</h4>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-tight mt-1">
                             <span className="uppercase text-slate-600 font-black tracking-widest text-[10px]">UNIT {booking.unit?.unitNumber}</span>
                             <span className="w-1 h-1 bg-slate-200 rounded-full" />
                             <span className="uppercase">{booking.unit?.type?.replace('_', ' ')}</span>
                          </div>
                       </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                       booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                       {booking.status}
                    </span>
                  </div>

                  <div className="mb-10 space-y-3">
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Realization</span>
                          <span className="text-xl font-black text-slate-900 font-mono tracking-tighter">
                             ₹{paid.toLocaleString()} <span className="text-slate-300 text-sm">/ ₹{booking.grandTotal.toLocaleString()}</span>
                          </span>
                       </div>
                       <span className="text-base font-black text-primary font-mono">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-px">
                       <div className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {nextInstallment && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-amber-500 shadow-sm">
                            <Clock size={20} />
                         </div>
                         <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Installment</div>
                            <div className="text-sm font-black text-slate-900 font-mono">₹{nextInstallment.amount.toLocaleString()} <span className="text-slate-400 font-sans font-bold text-[10px] uppercase ml-1">Due {new Date(nextInstallment.dueDate).toLocaleDateString()}</span></div>
                         </div>
                      </div>
                      <Link href={`/portal/payments/${nextInstallment.id}`} className="btn btn-primary btn-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20">
                         Authorize Entry <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border-t border-slate-50">
                      <thead>
                        <tr>
                          <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Descriptor</th>
                          <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                          <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                          <th className="py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {booking.payments?.slice(0, 5).map((p: any) => (
                          <tr key={p.id} className="group/row">
                            <td className="py-3 text-[10px] font-bold text-slate-500 font-mono uppercase">{p.receiptNumber || 'PYMT-BGN'}</td>
                            <td className="py-3 text-xs font-black text-slate-900 font-mono tracking-tighter">₹{p.amount.toLocaleString()}</td>
                            <td className="py-3 text-[10px] font-bold text-slate-400">{new Date(p.dueDate).toLocaleDateString()}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                 p.paidAt ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : p.isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                              }`}>
                                {p.paidAt ? 'REALIZED' : p.isOverdue ? 'OVERDUE' : 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Link href="/portal/payments" className="w-full flex items-center justify-center gap-2 py-4 mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100">
                    Audit Full Schedule <ChevronRight size={14} />
                  </Link>
                </div>
              );
            })}

            {!data?.bookings?.length && (
              <div className="bg-white p-20 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                   <Building2 size={40} className="text-slate-200" />
                </div>
                <div>
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Asset Framework Empty</h4>
                   <p className="text-[11px] text-slate-400 font-medium italic mt-2 uppercase tracking-tighter max-w-[250px]">No finalized property acquisition records detected in current protocol.</p>
                </div>
                <Link href="/portal/wishlist" className="btn btn-secondary btn-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-8">
                   Explore Assets <Sparkles size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-6">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Layout size={18} className="text-primary" />
                Field Intelligence
             </h3>
             <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
               {data?.visits?.slice(0, 3).map((v: any) => (
                 <div key={v.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 group cursor-pointer hover:bg-white hover:border-primary/20 transition-all">
                   <div className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors">{v.lead?.project?.name}</div>
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 bg-white w-fit px-2 py-1 rounded border border-slate-100 shadow-sm">
                      <Calendar size={10} />
                      {new Date(v.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                   </div>
                   <div className="flex items-center gap-2 mt-4">
                     <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[8px] font-black text-white border border-slate-800 shadow-sm uppercase">{v.agent?.name?.charAt(0)}</div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{v.agent?.name || 'GENERIC AGENT'}</span>
                   </div>
                 </div>
               ))}
               {!data?.visits?.length && (
                 <div className="py-10 text-center text-slate-300">
                    <p className="text-[9px] font-black uppercase tracking-widest italic">No Intelligence Missions Scheduled</p>
                 </div>
               )}
               <Link href="/portal/visits" className="w-full flex items-center justify-center gap-2 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                  Authorize Site Visit <ChevronRight size={12} />
               </Link>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                Strategic Yields
             </h3>
             <div className="relative p-8 rounded-2xl overflow-hidden group shadow-2xl">
               <div className="absolute inset-0 bg-slate-900" />
               <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
               <div className="relative z-10 space-y-4">
                  <div className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                     <AlertCircle size={12} /> Priority Signal
                  </div>
                  <h4 className="text-lg font-black text-white tracking-tighter leading-tight uppercase underline decoration-primary decoration-4 underline-offset-4">Zero Neutralization Protocol</h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-tighter">Limited window: Full GST Neutralization for North Goa Acquisitions. Exclusive yield for tier-1 partners.</p>
                  <button className="w-full bg-white text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">
                     Request Access
                  </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
