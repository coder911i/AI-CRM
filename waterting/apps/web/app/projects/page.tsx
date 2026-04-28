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
      <div className="p-6 space-y-6 bg-[var(--bg-primary)] min-h-full">
        <div className="h-10 w-64 animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>)}
        </div>
      </div>
    </CRMLayout>
  );

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-6 min-h-full space-y-8">
        <div className="flex justify-between items-end pb-6 border-b border-[var(--border)]">
           <div>
              <h1 className="text-[24px] font-bold text-[var(--text-primary)] uppercase tracking-wide italic flex items-center gap-3">
                 <Building2 size={24} className="text-[var(--accent)]" />
                 Asset Portfolio
              </h1>
              <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mt-1">Foundational Inventory: {projects.length} developments active</p>
           </div>
           <button className="bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-6 py-2 text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Register Asset
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(p => (
            <div 
              key={p.id} 
              className="bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer group flex flex-col h-full" 
              onClick={() => router.push(`/projects/${p.id}`)}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex px-2 py-0.5 border border-[var(--border)] text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                     {p.type}
                  </span>
                  <div className={`w-2 h-2 ${p.status === 'ACTIVE' ? 'bg-[var(--success)]' : 'bg-[var(--warning)] animate-pulse'}`} />
                </div>
                <h3 className="text-[18px] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight uppercase">{p.name}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-[var(--text-muted)] text-[10px] font-bold uppercase">
                   <MapPin size={12} />
                   {p.location}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--border)]">
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                         <ShieldCheck size={12} /> Compliance
                      </span>
                      <div className="text-[11px] font-bold text-[var(--text-primary)] font-mono">{p.reraNumber || 'PENDING'}</div>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                         <Layers size={12} /> Capacity
                      </span>
                      <div className="text-[11px] font-bold text-[var(--text-primary)] font-mono">{p.towers?.length || 0} Sub-Assets</div>
                   </div>
                </div>
              </div>
              <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center group-hover:bg-[var(--bg-surface)] transition-all">
                 <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Inventory Management</span>
                 <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all" />
              </div>
            </div>
          ))}
          
          {!projects.length && (
            <div className="md:col-span-2 xl:col-span-3 py-24 text-center bg-[var(--bg-elevated)] border border-dashed border-[var(--border)]">
               <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--bg-surface)] border border-[var(--border)] mb-4 text-[var(--text-muted)]">
                  <Building2 size={32} />
               </div>
               <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Portfolio Empty</h3>
               <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase mt-1 max-w-xs mx-auto">Identify and register your initial project development.</p>
               <button className="mt-6 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-6 py-2 text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)]" onClick={() => setShowCreate(true)}>Initialize First Asset</button>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                 <Building size={18} className="text-[var(--accent)]" />
                 Initialize Asset Registry
              </h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => setShowCreate(false)}>
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={createProject} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Project Legal Name</label>
                <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold uppercase outline-none focus:border-[var(--accent)]" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Skyline Heights Phase 1" required />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Geographic Location</label>
                <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold uppercase outline-none focus:border-[var(--accent)]" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Main Avenue, Sector 4..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Classification</label>
                  <select className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[11px] font-bold uppercase outline-none focus:border-[var(--accent)]" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {['RESIDENTIAL','COMMERCIAL','MIXED','VILLA','TOWNSHIP'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">RERA ID Number</label>
                  <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold font-mono outline-none focus:border-[var(--accent)]" value={form.reraNumber} onChange={e => setForm({...form, reraNumber: e.target.value})} placeholder="PR00-00-00-00" />
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-[var(--border)]">
                <button type="button" className="flex-1 px-4 py-2 text-[11px] font-bold uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setShowCreate(false)}>Discard</button>
                <button type="submit" className="flex-1 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-4 py-2 text-[11px] font-bold uppercase hover:bg-[var(--bg-elevated)]">Authorize Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
