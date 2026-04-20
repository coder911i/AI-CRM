'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { 
  IndianRupee, 
  Clock, 
  ReceiptText, 
  CloudDownload, 
  ShieldCheck, 
  AlertCircle, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRightCircle,
  Building2,
  Calendar
} from 'lucide-react';

export default function PortalPaymentsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const email = typeof window !== 'undefined' ? localStorage.getItem('waterting_portal_email') : null;

  useEffect(() => {
    if (!email) { router.push('/portal/login'); return; }
    api.get<any>('/portal/dashboard').then(setData).catch(() => router.push('/portal/login')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const totalPaid = data?.bookings?.reduce((acc: number, b: any) => 
    acc + (b.payments?.filter((p: any) => p.paidAt).reduce((sum: number, p: any) => sum + p.amount, 0) || 0), 0) || 0;
  
  const totalDue = data?.bookings?.reduce((acc: number, b: any) => acc + (b.grandTotal || 0), 0) || 0;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <CreditCard size={28} className="text-primary" />
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Investment Registry</h1>
           </div>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest text-[10px] font-black">Authorized financial state synchronization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <TrendingUp size={80} className="text-primary" />
            </div>
            <div className="relative z-10 space-y-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" /> Verified Realization
               </label>
               <div>
                  <div className="text-4xl font-black text-white font-mono tracking-tighter uppercase">₹{totalPaid.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Net Realized Capital</div>
               </div>
            </div>
         </div>
         <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Clock size={14} className="text-amber-500" /> Outstanding Obligation
            </label>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tighter uppercase">₹{(totalDue - totalPaid).toLocaleString()}</div>
            <div className="w-full h-1.5 bg-slate-50 rounded-full mt-4 overflow-hidden border border-slate-100">
               <div className="h-full bg-primary" style={{ width: `${(totalPaid/totalDue)*100}%` }} />
            </div>
         </div>
      </div>

      <div className="space-y-10">
        {data?.bookings?.map((booking: any) => (
          <div key={booking.id} className="space-y-6">
            <div className="flex items-center gap-4 px-2">
               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                  <Building2 size={20} className="text-primary" />
               </div>
               <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{booking.unit?.tower?.project?.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">UNIT {booking.unit?.unitNumber} · STRUCTURAL PAYMENTS</p>
               </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
               <div className="divide-y divide-slate-50">
                  {booking.payments.map((p: any, idx: number) => (
                    <div key={p.id} className="p-8 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                       {/* Structural line connector */}
                       {idx !== booking.payments.length - 1 && (
                         <div className="absolute left-[39px] top-16 bottom-0 w-px bg-slate-100" />
                       )}
                       
                       <div className="flex items-center gap-6">
                          <div className={`w-2 h-2 rounded-full z-10 border-4 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)] ${
                             p.paidAt ? 'bg-emerald-500' : p.isOverdue ? 'bg-rose-500' : 'bg-primary'
                          }`} />
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-slate-900 font-mono tracking-tighter uppercase">₹{p.amount.toLocaleString()}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                   p.paidAt ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : p.isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                   {p.paidAt ? 'REALIZED' : p.isOverdue ? 'OVERDUE' : 'DUE'}
                                </span>
                             </div>
                             <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {p.paidAt ? 'COMPLETED' : 'DEADLINE'}: {new Date(p.paidAt || p.dueDate).toLocaleDateString()}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-slate-500 font-mono uppercase tracking-tighter">ID: TXN-{p.id.slice(-6)}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-3 ml-8 md:ml-0">
                          {p.paidAt ? (
                             <button className="btn btn-secondary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 hover:border-primary/20 hover:text-primary transition-all">
                                <CloudDownload size={14} /> Receipt
                             </button>
                          ) : (
                             <button className="btn btn-primary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
                                Authorize Payment <ArrowRightCircle size={14} />
                             </button>
                          )}
                          <button className="p-2 text-slate-200 hover:text-slate-400 transition-colors">
                             <AlertCircle size={18} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ))}

        {!data?.bookings?.length && (
          <div className="py-32 text-center flex flex-col items-center gap-6 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
             <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                <ReceiptText size={40} className="text-slate-200" />
             </div>
             <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction Matrix Empty</h4>
                <p className="text-[11px] text-slate-400 font-medium italic mt-2 uppercase tracking-tighter max-w-[280px] mx-auto">No finalized structural payment records discovered in current matrix synchronization.</p>
             </div>
          </div>
        )}
      </div>

      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-8 flex items-center justify-between group cursor-pointer hover:bg-emerald-50 transition-all">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
               <ShieldCheck size={28} />
            </div>
            <div>
               <h4 className="text-base font-black text-slate-900 tracking-tight uppercase group-hover:text-emerald-700 transition-colors">Tax Compliance Verified</h4>
               <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-tighter font-black">All active receipts are GST compliant and verified.</p>
            </div>
         </div>
         <ArrowRightCircle size={24} className="text-emerald-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}
