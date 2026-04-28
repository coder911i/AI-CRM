'use client';

import React, { useState, useEffect } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Layers, 
  MapPin, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Activity, 
  RefreshCcw,
  IndianRupee,
  Layout,
  Grid
} from 'lucide-react';

interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  type: string;
  carpetArea: number;
  totalPrice: number;
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'SOLD' | 'BLOCKED';
  tower?: { id: string; name: string };
}

interface Project {
  id: string;
  name: string;
  towers: { id: string; name: string }[];
}

export default function InventoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTowerId, setSelectedTowerId] = useState<string>('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [showBulkPrice, setShowBulkPrice] = useState(false);
  const [bulkTowerId, setBulkTowerId] = useState('');
  const [bulkFloor, setBulkFloor] = useState<number | ''>('');
  const [bulkPrice, setBulkPrice] = useState<number | ''>('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) fetchProjects();
  }, [user, loading]);

  useEffect(() => {
    if (selectedProjectId) fetchUnits();
  }, [selectedProjectId, selectedTowerId]);

  const fetchProjects = async () => {
    try {
      const data = await api.get<Project[]>('/projects');
      setProjects(data);
      if (data.length > 0) setSelectedProjectId(data[0].id);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const fetchUnits = async () => {
    if (!selectedProjectId) return;
    setIsRefreshing(true);
    try {
      const data = await api.get<Unit[]>(`/projects/${selectedProjectId}/units`);
      setUnits(data);
    } catch (err) {
      console.error('Failed to fetch units', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedUnit) return;
    try {
      await api.patch(`/units/${selectedUnit.id}/status`, { status: newStatus as any });
      setSelectedUnit(null);
      fetchUnits();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (!bulkTowerId || !bulkPrice) return;
    try {
      await api.patch('/units/bulk-price', {
        towerId: bulkTowerId,
        floor: bulkFloor === '' ? undefined : Number(bulkFloor),
        basePrice: Number(bulkPrice)
      });
      setShowBulkPrice(false);
      fetchUnits();
    } catch (err) {
      alert('Bulk update failed');
    }
  };

  const handleExportCSV = () => {
    if (!selectedProjectId) return;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/projects/${selectedProjectId}/units/export`;
    window.open(url, '_blank');
  };

  const filteredUnits = units.filter(u => {
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    const matchesTower = !selectedTowerId || u.tower?.id === selectedTowerId;
    const matchesSearch = u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch && matchesTower;
  });

  if (loading) {
    return (
      <CRMLayout>
        <div className="p-8 space-y-6 bg-[var(--bg-primary)] min-h-screen">
          <div className="h-10 w-64 animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
          <div className="h-[600px] w-full animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-6 min-h-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
          <div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                Asset Management Core
             </div>
             <h1 className="text-[20px] font-bold text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-3 italic">
                Inventory Matrix Ledger
             </h1>
             <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mt-1 italic">Real-time cross-tower structural synchronization: ACTIVE</p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2" onClick={handleExportCSV}>
                <Download size={14} /> Intelligence Export
             </button>
             <button className="px-4 py-2 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2" onClick={() => setShowBulkPrice(true)}>
                <RefreshCcw size={14} /> Bulk Re-Valuation
             </button>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] p-6 border border-[var(--border)] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Grid size={80} /></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="space-y-1">
                 <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Focus Project Protocol</label>
                 <select 
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none" 
                    value={selectedProjectId} 
                    onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedTowerId(''); }}
                 >
                    <option value="">Select Protocol</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Structural Block Selection</label>
                 <select 
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none"
                    value={selectedTowerId}
                    onChange={(e) => setSelectedTowerId(e.target.value)}
                 >
                    <option value="">All Functional Units</option>
                    {projects.find(p => p.id === selectedProjectId)?.towers.map(t => (
                      <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                    ))}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Unit Identity Query</label>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                    <input 
                       type="text" 
                       className="w-full bg-[var(--bg-surface)] border border-[var(--border)] pl-10 pr-4 py-2 text-[12px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase placeholder:text-[var(--text-muted)]" 
                       placeholder="SEARCH UNIT ID..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           <div className="flex gap-1.5 mt-8 overflow-x-auto no-scrollbar border-t border-[var(--border)] pt-6">
              {['ALL', 'AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD', 'BLOCKED'].map(s => (
                <button 
                  key={s} 
                  className={`px-4 py-1.5 text-[9px] font-bold uppercase border-2 transition-all ${
                    filterStatus === s 
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-elevated)]'
                  }`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>

        {isRefreshing ? (
           <div className="py-48 flex flex-col items-center gap-6 bg-[var(--bg-surface)] border border-[var(--border)] border-dashed">
              <RefreshCcw size={48} className="animate-spin text-[var(--accent)]" />
              <div className="text-center space-y-1">
                 <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] block">Synchronizing Matrix...</span>
                 <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Establishing Encrypted Data Link</span>
              </div>
           </div>
        ) : (
          <div className="space-y-16">
            {Array.from(new Set(filteredUnits.map(u => u.tower?.name || 'GENERIC-SHELL'))).map(towerName => {
              const towerUnits = filteredUnits.filter(u => u.tower?.name === towerName);
              const floors = Array.from(new Set(towerUnits.map(u => u.floor))).sort((a, b) => b - a);

              return (
                <div key={towerName} className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3">
                        <Building2 size={18} className="text-[var(--accent)]" />
                        {towerName} 
                        <span className="text-[10px] text-[var(--text-muted)] font-bold border-l border-[var(--border)] pl-3 ml-1 italic tracking-normal uppercase">Active Sector Terminal</span>
                     </h3>
                     <div className="flex flex-wrap gap-4">
                        {[
                          { s: 'AVAILABLE', c: 'var(--success)' },
                          { s: 'RESERVED', c: 'var(--warning)' },
                          { s: 'BOOKED', c: 'var(--accent)' },
                          { s: 'SOLD', c: 'var(--text-muted)' }
                        ].map(({s, c}) => (
                           <div key={s} className="flex items-center gap-2 border border-[var(--border)] px-3 py-1 bg-[var(--bg-surface)]">
                              <div className="w-2 h-2" style={{ backgroundColor: c }} />
                              <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">{towerUnits.filter(u => u.status === s).length} {s}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="divide-y divide-[var(--border)] bg-[var(--bg-primary)]">
                    {floors.map(floor => (
                      <div key={floor} className="flex gap-0 items-stretch hover:bg-[var(--bg-elevated)] transition-colors group/floor border-b border-[var(--border)] last:border-b-0">
                        <div className="w-20 flex flex-col items-center justify-center border-r border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
                           <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">LEVEL</span>
                           <span className="text-[18px] font-bold text-[var(--text-primary)] font-mono italic">{String(floor).padStart(2, '0')}</span>
                        </div>
                        <div className="flex gap-2 p-4 flex-wrap flex-1 min-w-0">
                          {towerUnits.filter(u => u.floor === floor).sort((a,b) => a.unitNumber.localeCompare(b.unitNumber)).map(unit => (
                            <div 
                              key={unit.id} 
                              onClick={() => { setSelectedUnit(unit); setNewStatus(unit.status); }}
                              className={`w-14 h-12 border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative group/unit ${
                                unit.status === 'AVAILABLE' ? 'bg-[var(--bg-surface)] border-[var(--border)] hover:border-[var(--success)] hover:bg-[var(--success-bg)]' : 
                                unit.status === 'RESERVED' ? 'bg-[var(--warning-bg)] border-[var(--warning)] hover:brightness-95' : 
                                unit.status === 'BOOKED' ? 'bg-[var(--accent-light)] border-[var(--accent)] hover:brightness-95' : 
                                'bg-[var(--bg-elevated)] border-[var(--border)] opacity-40 grayscale pointer-events-none'
                              }`}
                            >
                              <span className="text-[11px] font-bold font-mono text-[var(--text-primary)]">{unit.unitNumber.split('-').pop()}</span>
                              <div className={`absolute bottom-0 left-0 w-full h-[3px] ${
                                unit.status === 'AVAILABLE' ? 'bg-[var(--success)]' : 
                                unit.status === 'RESERVED' ? 'bg-[var(--warning)]' : 
                                unit.status === 'BOOKED' ? 'bg-[var(--accent)]' : 
                                'bg-[var(--text-muted)]'
                              }`} />
                              <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover/unit:opacity-5 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedUnit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm" onClick={() => setSelectedUnit(null)}>
          <div className="bg-[var(--bg-surface)] w-full max-w-sm border-2 border-[var(--border)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
               <div>
                  <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-widest italic">Unit Protocol {selectedUnit.unitNumber}</h3>
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Tactical Asset Override Interface</p>
               </div>
               <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" onClick={() => setSelectedUnit(null)}>
                 <X size={20} />
               </button>
            </div>

            <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'IDENT_STATE', val: selectedUnit.status, icon: ShieldCheck, color: 'text-[var(--accent)]' },
                    { label: 'CONFIG_TYPE', val: selectedUnit.type, icon: Layout, color: 'text-[var(--text-secondary)]' },
                    { label: 'VALUATION', val: `₹${(selectedUnit.totalPrice/100000).toFixed(1)}L`, icon: IndianRupee, color: 'text-[var(--text-primary)]' },
                    { label: 'DIMENSIONS', val: `${selectedUnit.carpetArea} FT²`, icon: Activity, color: 'text-[var(--text-secondary)]' },
                  ].map((spec, i) => (
                    <div key={i} className="bg-[var(--bg-elevated)] p-4 border border-[var(--border)] group hover:border-[var(--accent)] transition-colors">
                       <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1.5 flex items-center gap-1.5 tracking-tighter">
                          <spec.icon size={11} className={spec.color} /> {spec.label}
                       </label>
                       <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase font-mono italic">{spec.val}</span>
                    </div>
                  ))}
               </div>

               <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Protocol State Modification</label>
                     <select className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2.5 text-[12px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                       <option value="AVAILABLE">DEPLOY: STATUS_AVAILABLE</option>
                       <option value="RESERVED">HOLD: INITIALIZE_RESERVATION</option>
                       <option value="BLOCKED">INTERNAL: STATUS_BLOCKED</option>
                       <option value="SOLD">ARCHIVE: STATUS_SOLD</option>
                     </select>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase transition-colors" onClick={() => setSelectedUnit(null)}>Abondon</button>
                    <button className="flex-1 py-2.5 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all" onClick={handleStatusUpdate}>Apply Protocol</button>
                  </div>
               </div>

               {['AVAILABLE', 'RESERVED'].includes(selectedUnit.status) && (
                 <button className="w-full bg-[var(--bg-primary)] border-2 border-dashed border-[var(--border)] text-[var(--text-primary)] py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all flex items-center justify-center gap-3 mt-4" onClick={() => router.push(`/bookings/create?unitId=${selectedUnit.id}`)}>
                    <RefreshCcw size={14} /> Open Booking Transaction
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {showBulkPrice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm" onClick={() => setShowBulkPrice(false)}>
          <div className="bg-[var(--bg-surface)] w-full max-w-sm border-2 border-[var(--border)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
               <h3 className="text-[12px] font-bold uppercase text-[var(--text-primary)] flex items-center gap-2 tracking-widest italic">
                  <RefreshCcw size={18} className="text-[var(--accent)]" />
                  Bulk Valuation Update
               </h3>
               <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" onClick={() => setShowBulkPrice(false)}>
                  <X size={20} />
               </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Target Structural Block (Tower)</label>
                <select className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2.5 text-[12px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none" value={bulkTowerId} onChange={(e) => setBulkTowerId(e.target.value)}>
                  <option value="">Select Target Sector</option>
                  {projects.find(p => p.id === selectedProjectId)?.towers.map(t => (
                    <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Level Focus</label>
                   <input type="number" className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2.5 text-[12px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono" value={bulkFloor} onChange={(e) => setBulkFloor(e.target.value === '' ? '' : Number(e.target.value))} placeholder="GLOBAL" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">New Base Valuation</label>
                   <input type="number" className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2.5 text-[12px] font-mono font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" value={bulkPrice} onChange={(e) => setBulkPrice(Number(e.target.value))} placeholder="₹ AMOUNT" />
                 </div>
              </div>
              <div className="flex gap-2 pt-8 border-t border-[var(--border)]">
                <button className="flex-1 py-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase transition-colors" onClick={() => setShowBulkPrice(false)}>Discard</button>
                <button className="flex-1 py-2.5 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all" onClick={handleBulkPriceUpdate}>Authorize Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
