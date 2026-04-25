'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import { Plus, Building2, MapPin, ShieldCheck, Layers, Layout, ChevronRight, X, Building } from 'lucide-react';

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', type: 'RESIDENTIAL', reraNumber: '' });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { api.get<any[]>('/projects').then(setProjects).catch(console.error).finally(() => setLoading(false)); }
  }, [user, authLoading]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      setShowCreate(false);
      api.get<any[]>('/projects').then(setProjects);
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) return (
    <CRMLayout>
      <div className="p-8 space-y-6">
        <div className="h-12 w-64 animate-pulse bg-[#22262F] rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 animate-pulse bg-[#22262F] rounded-lg"></div>)}
        </div>
      </div>
    </CRMLayout>
  );

  return (
    <CRMLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end pb-4 border-b border-slate-100">
           <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <Building2 size={24} className="text-primary" />
                 Asset Portfolio
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Foundational Inventory: {projects.length} developments active</p>
           </div>
           <button className="btn btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5 shadow-md" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Register Asset
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(p => (
            <div 
              key={p.id} 
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all cursor-pointer group flex flex-col h-full" 
              onClick={() => router.push(`/projects/${p.id}`)}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-blue-50 text-primary border border-blue-100">
                     {p.type}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-400 animate-pulse'}`} />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{p.name}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-slate-400 text-xs font-medium">
                   <MapPin size={12} className="text-slate-300" />
                   {p.location}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <ShieldCheck size={12} /> Compliance
                      </span>
                      <div className="text-xs font-black text-slate-800 font-mono">{p.reraNumber || 'PENDING'}</div>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Layers size={12} /> Capacity
                      </span>
                      <div className="text-xs font-black text-slate-800 font-mono">{p.towers?.length || 0} Sub-Assets</div>
                   </div>
                </div>
              </div>
              <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Management</span>
                 <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>
          ))}
          
          {!projects.length && (
            <div className="md:col-span-2 xl:col-span-3 py-32 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
               <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 text-slate-200 shadow-sm">
                  <Building2 size={32} />
               </div>
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Portfolio Empty</h3>
               <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Identify and register your initial project development to begin tracking inventory and availability.</p>
               <button className="mt-8 btn btn-secondary text-xs uppercase font-bold tracking-widest" onClick={() => setShowCreate(true)}>Initialize First Asset</button>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <Building size={18} className="text-primary" />
                 Initialize Asset Registry
              </h3>
              <button className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setShowCreate(false)}>
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={createProject} className="space-y-5">
              <div className="form-group">
                <label className="form-label">Project Legal Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Skyline Heights Phase 1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Geographic Location / Site Address</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3 text-slate-300" size={16} />
                   <input className="form-input pl-10" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Main Avenue, Sector 4..." required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Classification</label>
                  <select className="form-select font-bold text-xs" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {['RESIDENTIAL','COMMERCIAL','MIXED','VILLA','TOWNSHIP'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">RERA ID Number</label>
                  <input className="form-input text-xs font-mono" value={form.reraNumber} onChange={e => setForm({...form, reraNumber: e.target.value})} placeholder="PR00-00-00-00" />
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button type="button" className="btn btn-secondary flex-1 font-bold uppercase text-[11px]" onClick={() => setShowCreate(false)}>Discard</button>
                <button type="submit" className="btn btn-primary flex-1 font-bold uppercase text-[11px]">Authorize Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
