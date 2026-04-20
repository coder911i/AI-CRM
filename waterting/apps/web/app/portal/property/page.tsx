'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { 
  Building2, 
  MapPin, 
  Grid, 
  Layers, 
  Expand, 
  ShieldCheck, 
  Activity, 
  ArrowLeft, 
  Globe, 
  Zap,
  Target,
  FileText,
  Share2
} from 'lucide-react';

export default function PortalPropertyPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const email = typeof window !== 'undefined' ? localStorage.getItem('waterting_portal_email') : null;

  useEffect(() => {
    if (!email) { router.push('/portal/login'); return; }
    api.get<any>('/portal/dashboard').then(setData).catch(() => router.push('/portal/login')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="max-w-[1240px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
           <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors mb-4">
              <ArrowLeft size={14} /> Return to Portfolio
           </button>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Asset Specification Dossier</h2>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Authorized technical property validation</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
              <Share2 size={16} />
           </button>
           <button className="btn btn-primary px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 flex items-center gap-3">
              Download Technical Spec <FileText size={16} />
           </button>
        </div>
      </div>

      {data?.bookings?.map((booking: any) => (
        <div key={booking.id} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden group">
               <div className="p-10 space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase group-hover:text-primary transition-colors leading-none">{booking.unit?.tower?.project?.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1 italic">
                         <MapPin size={10} className="text-primary" /> {booking.unit?.tower?.project?.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                       <ShieldCheck size={14} className="text-emerald-500" />
                       <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest italic">RERA Authorized Asset</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-slate-50">
                    {[
                      { label: 'Asset Number', val: booking.unit?.unitNumber, icon: Grid },
                      { label: 'Structural Level', val: `${booking.unit?.tower?.name} / ${booking.unit?.floor}FL`, icon: Layers },
                      { label: 'Category', val: booking.unit?.type.replace(/_/g, ' '), icon: Building2 },
                      { label: 'Certified Area', val: `${booking.unit?.carpetArea} SQ.FT.`, icon: Expand },
                    ].map((spec, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 transition-colors group-hover:text-primary group-hover:bg-primary/5">
                              <spec.icon size={14} />
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{spec.label}</span>
                        </div>
                        <div className="text-sm font-black text-slate-900 uppercase tracking-tighter font-mono">{spec.val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Structural Highlights</span>
                       <div className="flex-1 h-px bg-slate-50" />
                    </div>
                    <div className="flex flex-wrap gap-3">
                       {['Swimming Pool', 'Gymnasium', '24/7 Security', 'Clubhouse', 'Yoga Deck', 'Kids Play Area'].map(a => (
                          <span key={a} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-white hover:border-primary transition-all cursor-default">
                             {a}
                          </span>
                       ))}
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden group min-h-[400px] relative">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.15),transparent_70%)]" />
               <div className="absolute top-8 left-8 z-10 flex items-center gap-4">
                  <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl">
                     <Globe size={20} />
                  </div>
                  <div>
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Geographical Context</h4>
                     <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter italic">Noida Sector 62 / Sector Core-Alpha</p>
                  </div>
               </div>
               <div className="absolute inset-0 flex items-center justify-center text-white/5 select-none pointer-events-none">
                  <MapPin size={240} className="animate-pulse" />
               </div>
               <div className="absolute bottom-8 right-8 z-10">
                  <button className="bg-white text-slate-900 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                     Enlarge Grid <Expand size={12} />
                  </button>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg p-8 space-y-8">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Asset Support</h4>
               </div>
               <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center gap-4 group cursor-pointer hover:shadow-xl transition-all">
                     <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                     </div>
                     <div className="space-y-1">
                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Inquiry Protocol</h5>
                        <p className="text-[9px] text-slate-400 font-medium italic lowercase tracking-tighter">Initialize secure communication channel</p>
                     </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center gap-4 group cursor-pointer hover:shadow-xl transition-all">
                     <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform text-emerald-500">
                        <Zap size={24} fill="currentColor" />
                     </div>
                     <div className="space-y-1">
                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Flash Verification</h5>
                        <p className="text-[9px] text-slate-400 font-medium italic lowercase tracking-tighter">Instant authorization for on-site visits</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-primary rounded-3xl p-8 shadow-xl shadow-primary/20 space-y-6 relative overflow-hidden group text-white">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Target size={80} />
               </div>
               <div className="relative z-10 space-y-2">
                  <h4 className="text-base font-black uppercase tracking-widest">Acquisition Assistance</h4>
                  <p className="text-[10px] font-medium text-white/70 italic uppercase tracking-tighter leading-relaxed">System-optimized advisory for seamless high-value asset procurement.</p>
               </div>
               <button className="relative z-10 w-full py-4 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl">
                  Contact Asset Manager
               </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
