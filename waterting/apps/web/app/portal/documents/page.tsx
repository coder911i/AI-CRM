'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { FileText, FileDown, ShieldCheck, Clock, Search, MoreVertical, Archive, Layout, ArrowRightCircle } from 'lucide-react';

export default function PortalDocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/portal/documents')
      .then(setDocs)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const flattenedDocs = docs.flatMap(b => b.documents || []);

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <ShieldCheck size={28} className="text-primary" />
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Document Vault</h1>
           </div>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest text-[10px] font-black">Authorized legal and technical repository</p>
        </div>
        <div className="relative group">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
           <input type="text" placeholder="QUERY LEDGER..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest w-64 focus:ring-2 focus:ring-primary/10 transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Verified Assets', value: flattenedDocs.length, icon: <FileText className="text-primary" /> },
           { label: 'Vault Integrity', value: '100%', icon: <ShieldCheck className="text-emerald-500" /> },
           { label: 'Last Sync', value: 'Live', icon: <Clock className="text-amber-500" /> }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                 {stat.icon}
              </div>
              <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{stat.label}</label>
                 <div className="text-base font-black text-slate-900 tracking-tight uppercase">{stat.value}</div>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
           <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Archive size={14} className="text-slate-400" />
              Finalized Executions
           </h3>
           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Read-Only Access Protocol</span>
        </div>

        <div className="divide-y divide-slate-50">
          {flattenedDocs.map((doc: any) => (
            <div key={doc.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-red-500 shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    <FileText size={24} />
                 </div>
                 <div className="space-y-1">
                    <div className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight uppercase">{doc.title}</div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1"><Clock size={12} /> {new Date(doc.createdAt).toLocaleDateString()}</span>
                       <span className="w-1 h-1 bg-slate-200 rounded-full" />
                       <span className="text-slate-600 font-mono">VER 1.0.4</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-2.5 hover:bg-primary/10 text-slate-300 hover:text-primary rounded-xl transition-all border border-transparent hover:border-primary/10" onClick={() => window.open(doc.metadata?.url, '_blank')}>
                    <FileDown size={20} />
                 </button>
                 <button className="p-2.5 text-slate-200 hover:text-slate-400">
                    <MoreVertical size={18} />
                 </button>
              </div>
            </div>
          ))}

          {flattenedDocs.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center gap-4 bg-white">
               <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                  <Archive size={32} className="text-slate-100" />
               </div>
               <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ledger Void</h4>
                  <p className="text-[11px] text-slate-400 font-medium italic mt-1 uppercase tracking-tighter max-w-[220px]">No finalized document records discovered in current matrix sync.</p>
               </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
               <Layout size={28} />
            </div>
            <div>
               <h4 className="text-base font-black text-slate-900 tracking-tight uppercase group-hover:text-primary transition-colors">Technical Blueprints</h4>
               <p className="text-xs text-slate-500 font-medium mt-1">Access master plans and structural specifications for your unit.</p>
            </div>
         </div>
         <ArrowRightCircle size={24} className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}
