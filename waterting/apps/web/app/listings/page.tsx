'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import { 
  Building2, 
  ExternalLink, 
  RefreshCcw, 
  Trash2, 
  Plus, 
  LayoutGrid, 
  Layers, 
  Globe, 
  IndianRupee, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  ChevronRight,
  Filter,
  Search,
  X
} from 'lucide-react';

const PLATFORMS = ['99ACRES', 'MAGICBRICKS', 'HOUSING', 'WEBSITE'];

export default function ListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', platform: 'WEBSITE', projectId: '' });
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      Promise.all([
        api.get<any[]>('/listings'),
        api.get<any[]>('/projects'),
      ]).then(([l, p]) => {
        setListings(Array.isArray(l) ? l : []);
        setProjects(Array.isArray(p) ? p : []);
      }).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const handleCreate = async () => {
    if (!form.title || !form.price || !form.platform) return;
    await api.post('/listings', { ...form, price: parseFloat(form.price) });
    setShowForm(false);
    setForm({ title: '', description: '', price: '', platform: 'WEBSITE', projectId: '' });
    api.get<any[]>('/listings').then(setListings);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/listings/${id}`);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  if (authLoading || loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50">
       <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Aggregating Market Presence...</span>
       </div>
    </div>
  );

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-6 min-h-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
          <div>
             <h2 className="text-[24px] font-bold text-[var(--text-primary)] uppercase tracking-wide italic">Market Ledger</h2>
             <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mt-1">Authorized multichannel asset distribution registry</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                <input 
                  type="text" 
                  placeholder="FILTER ENTRIES..." 
                  className="bg-[var(--bg-surface)] border border-[var(--border)] pl-10 pr-4 py-2 text-[10px] font-bold tracking-wider uppercase outline-none focus:border-[var(--accent)] transition-all w-64"
                />
             </div>
             <button className="bg-[var(--accent-light)] text-[var(--accent)] px-6 py-2 border-2 border-[var(--accent)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2" onClick={() => setShowForm(true)}>
                Initialize Listing <Plus size={16} />
             </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                   <LayoutGrid size={14} className="text-[var(--accent)]" /> Listing Initialization Protocol
                </h3>
                <button onClick={() => setShowForm(false)} className="text-[var(--text-muted)] hover:text-[var(--danger)]">
                   <X size={16} />
                </button>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-surface)]">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Entry Designation *</label>
                  <input 
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold uppercase tracking-tight outline-none focus:border-[var(--accent)]" 
                    value={form.title} 
                    onChange={e => setForm({ ...form, title: e.target.value })} 
                    placeholder="3BHK PREMIUM ACQUISITION" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Valuation (₹) *</label>
                  <input 
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold font-mono outline-none focus:border-[var(--accent)]" 
                    type="number" 
                    value={form.price} 
                    onChange={e => setForm({ ...form, price: e.target.value })} 
                    placeholder="7500000" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Target Channel *</label>
                  <select 
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[11px] font-bold uppercase outline-none focus:border-[var(--accent)]" 
                    value={form.platform} 
                    onChange={e => setForm({ ...form, platform: e.target.value })}
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Structural Linkage</label>
                  <select 
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[11px] font-bold uppercase outline-none focus:border-[var(--accent)]" 
                    value={form.projectId} 
                    onChange={e => setForm({ ...form, projectId: e.target.value })}
                  >
                    <option value="">INDEPENDENT_ASSET</option>
                    {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Briefing Context</label>
                  <textarea 
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-medium outline-none focus:border-[var(--accent)] resize-none" 
                    rows={2} 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                   <button className="px-6 py-2 text-[11px] font-bold uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setShowForm(false)}>Abort Phase</button>
                   <button className="px-8 py-2 bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent)] text-[11px] font-bold uppercase hover:bg-[var(--bg-elevated)]" onClick={handleCreate}>Finalize Initialization</button>
                </div>
             </div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
             <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} className="text-[var(--accent)]" /> Active Channel Distribution Registry
             </h3>
             <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider italic">{listings.length} Entries Operational</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Market Designation</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Strategic Value</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Portal</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Project</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">State</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {listings.map((l: any) => (
                  <tr key={l.id} className="hover:bg-[var(--bg-elevated)] transition-all group/row">
                    <td className="px-4 py-4">
                       <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-tight group-hover/row:text-[var(--accent)]">{l.title}</span>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono">#{l.id.slice(-6).toUpperCase()}</span>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       <span className="text-[12px] font-bold text-[var(--text-primary)] font-mono">₹{(l.price / 100000).toFixed(1)}L</span>
                    </td>
                    <td className="px-4 py-4">
                       <span className="text-[10px] font-bold uppercase border border-[var(--border)] px-2 py-0.5">
                          {l.platform}
                       </span>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-2">
                          <Building2 size={12} className="text-[var(--text-muted)]" />
                          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                             {l.project?.name ?? 'UNLINKED'}
                          </span>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                             l.status === 'ACTIVE' 
                             ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]' 
                             : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]'
                          }`}>
                            {l.status}
                          </span>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="px-3 py-1 bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] flex items-center gap-2 group/sync" 
                          onClick={async () => {
                            try {
                              await api.post(`/listings/${l.id}/sync`, { portals: [l.platform] });
                              api.get<any[]>('/listings').then(setListings);
                            } catch (e) { console.error('Sync failure'); }
                          }}
                        >
                          Sync <RefreshCcw size={12} className="group-hover/sync:rotate-180 transition-transform" />
                        </button>
                        <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => handleDelete(l.id)}>
                           <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && (
                  <tr>
                     <td colSpan={6} className="px-4 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                           <div className="w-16 h-16 bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                              <Search size={32} />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Registry Vacuum</h4>
                              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight italic">Zero multichannel assets discovered.</p>
                           </div>
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
