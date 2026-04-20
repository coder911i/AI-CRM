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

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                <Grid size={28} className="text-primary" />
                Inventory Matrix
             </h1>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Real-time cross-tower structural synchronization</p>
          </div>
          <div className="flex gap-3">
             <button className="btn btn-secondary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 border-slate-200 shadow-sm" onClick={handleExportCSV}>
                <Download size={14} /> Intelligence Export
             </button>
             <button className="btn btn-primary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 shadow-xl shadow-primary/20" onClick={() => setShowBulkPrice(true)}>
                <RefreshCcw size={14} /> Bulk Re-Valuation
             </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Focus Project</label>
                 <select 
                    className="form-select h-11 border-slate-200 font-black text-xs uppercase tracking-widest bg-slate-50" 
                    value={selectedProjectId} 
                    onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedTowerId(''); }}
                 >
                    <option value="">Select Protocol</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Structural Block</label>
                 <select 
                    className="form-select h-11 border-slate-200 font-black text-xs uppercase tracking-widest bg-slate-50"
                    value={selectedTowerId}
                    onChange={(e) => setSelectedTowerId(e.target.value)}
                 >
                    <option value="">All Functional Units</option>
                    {projects.find(p => p.id === selectedProjectId)?.towers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lead Filter Search</label>
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
                    <input 
                       type="text" 
                       className="form-input h-11 pl-10 border-slate-200 font-black text-xs uppercase tracking-widest bg-slate-50" 
                       placeholder="QUERY UNIT ID..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           <div className="flex gap-2 mt-8 overflow-x-auto no-scrollbar pb-2">
              {['ALL', 'AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD', 'BLOCKED'].map(s => (
                <button 
                  key={s} 
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    filterStatus === s 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                    : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                  }`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>

        {isRefreshing ? (
           <div className="py-32 flex flex-col items-center gap-4 text-slate-300">
              <RefreshCcw size={32} className="animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Matrix...</span>
           </div>
        ) : (
          <div className="space-y-12">
            {Array.from(new Set(filteredUnits.map(u => u.tower?.name || 'GENERIC-SHELL'))).map(towerName => {
              const towerUnits = filteredUnits.filter(u => u.tower?.name === towerName);
              const floors = Array.from(new Set(towerUnits.map(u => u.floor))).sort((a, b) => b - a);

              return (
                <div key={towerName} className="bg-white p-10 rounded-[2rem] border border-slate-200/60 shadow-md">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                     <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-2">
                        <Building2 size={24} className="text-primary" />
                        {towerName} 
                        <span className="text-[10px] text-slate-300 font-bold ml-2">/ Block Terminal</span>
                     </h3>
                     <div className="flex gap-2">
                        {['AVAILABLE', 'RESERVED', 'SOLD'].map(status => (
                           <div key={status} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-100">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                 status === 'AVAILABLE' ? 'bg-emerald-500' : status === 'RESERVED' ? 'bg-amber-400' : 'bg-blue-600'
                              }`} />
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{towerUnits.filter(u => u.status === status).length} {status}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                    {floors.map(floor => (
                      <div key={floor} className="flex gap-10 items-center group/floor hover:bg-slate-50/50 p-2 rounded-xl transition-all">
                        <div className="w-14 flex flex-col items-center">
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover/floor:text-primary transition-colors">Level</span>
                           <span className="text-lg font-black text-slate-400 font-mono group-hover/floor:text-slate-900 transition-colors">{String(floor).padStart(2, '0')}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap flex-1 min-w-0">
                          {towerUnits.filter(u => u.floor === floor).sort((a,b) => a.unitNumber.localeCompare(b.unitNumber)).map(unit => (
                            <div 
                              key={unit.id} 
                              onClick={() => { setSelectedUnit(unit); setNewStatus(unit.status); }}
                              className={`w-20 h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm border relative group/unit ${
                                unit.status === 'AVAILABLE' ? 'bg-white border-emerald-100' : 
                                unit.status === 'RESERVED' ? 'bg-amber-50 border-amber-200' : 
                                unit.status === 'BOOKED' ? 'bg-blue-50 border-blue-200' : 
                                'bg-slate-100 border-slate-200 opacity-60'
                              }`}
                            >
                              <span className={`text-[10px] font-black tracking-tight ${unit.status === 'AVAILABLE' ? 'text-slate-900' : 'text-slate-600'}`}>{unit.unitNumber.split('-').pop()}</span>
                              <div className={`w-1 h-1 rounded-full absolute bottom-1.5 ${
                                unit.status === 'AVAILABLE' ? 'bg-emerald-500' : 
                                unit.status === 'RESERVED' ? 'bg-amber-500' : 
                                unit.status === 'BOOKED' ? 'bg-blue-600' : 
                                'bg-slate-400'
                              }`} />
                              <div className="absolute inset-0 bg-primary/0 group-hover/unit:bg-primary/5 rounded-lg transition-colors" />
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
        <div className="modal-overlay" onClick={() => setSelectedUnit(null)}>
          <div className="bg-white w-[400px] h-full fixed right-0 top-0 shadow-2xl p-10 flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Unit {selectedUnit.unitNumber}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Asset Control Override</p>
               </div>
               <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setSelectedUnit(null)}>
                 <X size={24} />
               </button>
            </div>

            <div className="space-y-8 flex-1">
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Current State', val: selectedUnit.status, icon: ShieldCheck, color: 'text-primary' },
                    { label: 'Asset Type', val: selectedUnit.type, icon: Layout, color: 'text-slate-400' },
                    { label: 'Valuation', val: `₹${(selectedUnit.totalPrice/100000).toFixed(1)}L`, icon: IndianRupee, color: 'text-slate-400' },
                    { label: 'Area Cert.', val: `${selectedUnit.carpetArea} FT`, icon: Activity, color: 'text-slate-400' },
                  ].map((spec, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                          <spec.icon size={10} className={spec.color} /> {spec.label}
                       </label>
                       <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{spec.val}</span>
                    </div>
                  ))}
               </div>

               <div className="space-y-4 pt-10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modify Protocol State</label>
                     <select className="form-select h-12 border-slate-200 font-black text-xs uppercase tracking-widest bg-slate-50" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                       <option value="AVAILABLE">DEPLOY_AVAILABLE</option>
                       <option value="RESERVED">INITIALIZE_HOLD</option>
                       <option value="BLOCKED">INTERNAL_BLOCK</option>
                       <option value="SOLD">FINALIZE_SALE</option>
                     </select>
                  </div>
                  <div className="flex gap-3 pt-6">
                    <button className="flex-1 btn btn-secondary h-12 font-black uppercase text-[10px] tracking-widest" onClick={() => setSelectedUnit(null)}>Discard</button>
                    <button className="flex-1 btn btn-primary h-12 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20" onClick={handleStatusUpdate}>Apply Change</button>
                  </div>
               </div>
            </div>

            <div className="mt-auto pt-10 border-t border-slate-100 space-y-4">
               {['AVAILABLE', 'RESERVED'].includes(selectedUnit.status) && (
                 <button className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-2xl flex items-center justify-center gap-2" onClick={() => router.push(`/bookings/create?unitId=${selectedUnit.id}`)}>
                    <RefreshCcw size={14} /> Open Booking Protocol
                 </button>
               )}
               <p className="text-[9px] font-bold text-slate-300 text-center uppercase tracking-widest">Asset Integrity Verified: {selectedUnit.id}</p>
            </div>
          </div>
        </div>
      )}

      {showBulkPrice && (
        <div className="modal-overlay" onClick={() => setShowBulkPrice(false)}>
          <div className="modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <RefreshCcw size={18} className="text-primary" />
                  Bulk Valuation Update
               </h3>
               <button className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setShowBulkPrice(false)}>
                  <X size={20} />
               </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Structural Block (Tower)</label>
                <select className="form-select h-11 border-slate-200 font-black text-xs uppercase" value={bulkTowerId} onChange={(e) => setBulkTowerId(e.target.value)}>
                  <option value="">Select Target Module</option>
                  {projects.find(p => p.id === selectedProjectId)?.towers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Level (Optional)</label>
                   <input type="number" className="form-input h-11 border-slate-200" value={bulkFloor} onChange={(e) => setBulkFloor(e.target.value === '' ? '' : Number(e.target.value))} placeholder="All Levels" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price (₹)</label>
                   <input type="number" className="form-input h-11 border-slate-200 font-mono font-bold" value={bulkPrice} onChange={(e) => setBulkPrice(Number(e.target.value))} placeholder="85,00,000" />
                 </div>
              </div>
              <div className="flex gap-3 pt-8 border-t border-slate-50">
                <button className="flex-1 btn btn-secondary py-3 text-[10px] font-black uppercase tracking-widest" onClick={() => setShowBulkPrice(false)}>Discard</button>
                <button className="flex-1 btn btn-primary py-3 text-[10px] font-black uppercase tracking-widest" onClick={handleBulkPriceUpdate}>Authorize Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
