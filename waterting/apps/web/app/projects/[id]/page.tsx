'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Target, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Users, 
  Plus, 
  ChevronRight, 
  Settings, 
  Edit, 
  Save, 
  X, 
  Lock, 
  Unlock, 
  Ban, 
  FileDown, 
  Layout, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Activity
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<any | null>(null);
  const [towers, setTowers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [showAddTower, setShowAddTower] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [updateForm, setUpdateForm] = useState({ milestoneName: '', progressPct: 0, description: '' });
  
  const [towerForm, setTowerForm] = useState({ name: '', totalFloors: 10 });
  const [unitForm, setUnitForm] = useState({ floor: 1, unitNumber: '', type: 'TWO_BHK', carpetArea: 1200, basePrice: 5000000, totalPrice: 5500000 });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user && id) fetchData();
  }, [user, authLoading, id]);

  const fetchData = async () => {
    try {
      const [projData, towersData] = await Promise.all([
        api.get<any>(`/projects/${id}`),
        api.get<any[]>(`/projects/${id}/towers`),
      ]);
      setProject(projData);
      setTowers(towersData);
      if (towersData.length > 0 && !selectedTower) setSelectedTower(towersData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/construction-updates`, updateForm);
      setShowAddUpdate(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const addTower = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/towers`, towerForm);
      setShowAddTower(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const addUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTower) return;
    try {
      await api.post(`/units`, { ...unitForm, towerId: selectedTower });
      setShowAddUnit(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const updateUnitStatus = async (unitId: string, status: string) => {
    try {
      await api.patch(`/units/${unitId}/status`, { status });
      setSelectedUnit(null);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center"><div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" /></div>;
  if (!project) return <CRMLayout><div className="flex flex-col items-center justify-center py-32 text-[var(--text-muted)] gap-4"><Building2 size={64} /><h3 className="text-[20px] font-bold uppercase">Project Nullified</h3></div></CRMLayout>;

  const allUnits = towers.flatMap(t => t.units || []);
  const unitStats = [
    { name: 'Available', value: allUnits.filter(u => u.status === 'AVAILABLE').length },
    { name: 'Reserved', value: allUnits.filter(u => u.status === 'RESERVED').length },
    { name: 'Sold', value: allUnits.filter(u => u.status === 'BOOKED' || u.status === 'SOLD').length },
  ];

  const tabs = [
    { id: 'overview', label: 'Intelligence', icon: <Activity size={16} /> },
    { id: 'towers', label: 'Towers', icon: <Layers size={16} /> },
    { id: 'inventory', label: 'Matrix', icon: <Layout size={16} /> },
    { id: 'construction', label: 'Construction', icon: <Building2 size={16} /> },
    { id: 'media', label: 'Assets', icon: <ImageIcon size={16} /> },
    { id: 'leads', label: 'Enquiries', icon: <Users size={16} /> },
  ];

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-6 min-h-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-wide uppercase italic">{project.name}</h1>
                 <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${project.status === 'ACTIVE' ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]' : 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]'}`}>
                    Status: {project.status}
                 </span>
              </div>
              <div className="flex items-center gap-4 text-[var(--text-secondary)] font-bold text-[10px] uppercase">
                 <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[var(--accent)]" /> {project.location}</span>
                 <span className="w-1 h-1 bg-[var(--border)]" />
                 <span className="tracking-widest text-[var(--text-muted)]">{project.type}</span>
              </div>
           </div>
           <div className="flex gap-2">
              <button className="bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] px-6 py-2 text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2">
                 <Settings size={14} /> Global Config
              </button>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Asset Blocks', value: towers.length, icon: <Layers size={18} /> },
             { label: 'Inventory Units', value: towers.reduce((acc, t) => acc + (t._count?.units || 0), 0), icon: <Layout size={18} /> },
             { label: 'Active Enquiries', value: project._count?.leads || 0, icon: <Users size={18} /> },
             { label: 'Project Flux', value: `${project.constructionUpdates?.[0]?.progressPct || 45}%`, icon: <Activity size={18} /> }
           ].map((stat, i) => (
             <div key={i} className="bg-[var(--bg-surface)] p-4 border border-[var(--border)] flex items-center gap-4 hover:border-[var(--accent)] transition-all">
                <div className="w-10 h-10 border border-[var(--border)] flex items-center justify-center text-[var(--accent)] bg-[var(--bg-elevated)]">
                   {stat.icon}
                </div>
                <div>
                   <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-0.5">{stat.label}</label>
                   <div className="text-[18px] font-bold text-[var(--text-primary)] font-mono tracking-tight uppercase">{stat.value}</div>
                </div>
             </div>
           ))}
        </div>

        <div className="border-b border-[var(--border)] flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-[var(--bg-surface)] p-6 border border-[var(--border)]">
                <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-8 flex items-center gap-2">
                   <Target size={16} className="text-[var(--accent)]" />
                   Sales Extraction Funnel
                </h3>
                <div className="h-[280px] flex items-end justify-between gap-4 px-4 overflow-hidden pt-8">
                   {[
                     { label: 'INTAKE', count: 45, pct: 100 },
                     { label: 'CONTACT', count: 32, pct: 71 },
                     { label: 'INTENT', count: 18, pct: 40 },
                     { label: 'VISIT', count: 12, pct: 26 },
                     { label: 'CONVERSION', count: 5, pct: 11 }
                   ].map((bar, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center group">
                        <div className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] relative flex flex-col justify-end transition-all hover:border-[var(--accent)]" style={{ height: `${bar.pct}%` }}>
                           <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">{bar.count}</div>
                           <div className="w-full h-1 bg-[var(--accent)]" />
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-4">{bar.label}</span>
                     </div>
                   ))}
                </div>
              </div>
              <div className="lg:col-span-4 bg-[var(--bg-surface)] p-6 border border-[var(--border)] flex flex-col items-center">
                 <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-8 w-full text-left flex items-center gap-2">
                   <TrendingUp size={16} className="text-[var(--accent)]" />
                   Inventory Saturation
                 </h3>
                 <div className="relative w-40 h-40 mb-6 flex items-center justify-center border-8 border-[var(--bg-elevated)]">
                    <div className="absolute inset-0 border-8 border-[var(--accent)] border-t-transparent border-l-transparent -rotate-45" />
                    <div className="text-center">
                       <div className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">72%</div>
                       <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Saturated</div>
                    </div>
                 </div>
                 <div className="space-y-2 w-full">
                    {unitStats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center bg-[var(--bg-elevated)] p-2 border border-[var(--border)]">
                         <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                            <span className={`w-2 h-2 ${i === 0 ? 'bg-[var(--success)]' : i === 1 ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'}`} />
                            {stat.name}
                         </span>
                         <span className="text-[11px] font-bold text-[var(--text-primary)] font-mono">{stat.value}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'towers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Structural Blocks</h3>
                 <button className="bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-4 py-2 text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2" onClick={() => setShowAddTower(true)}>
                    <Plus size={14} /> Append Tower
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {towers.map(t => (
                  <div key={t.id} className={`bg-[var(--bg-surface)] p-6 border transition-all cursor-pointer group ${selectedTower === t.id ? 'border-[var(--accent)] bg-[var(--bg-elevated)]' : 'border-[var(--border)] hover:border-[var(--accent)]'}`} onClick={() => { setSelectedTower(t.id); setActiveTab('inventory'); }}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                         <Building2 size={24} />
                      </div>
                      <div className="text-right">
                         <span className="px-2 py-0.5 border border-[var(--success)] text-[var(--success)] bg-[var(--success-bg)] text-[10px] font-bold uppercase tracking-wider">
                            {t.units?.filter((u:any) => u.status === 'AVAILABLE').length || 0} Open
                         </span>
                      </div>
                    </div>
                    <h4 className="text-[18px] font-bold text-[var(--text-primary)] tracking-tight uppercase">{t.name}</h4>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1 uppercase tracking-widest">{t.totalFloors} Structural Levels</p>
                    <div className="mt-8 pt-4 border-t border-[var(--border)] flex justify-between items-center">
                       <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--accent)] transition-colors">Access Matrix</span>
                       <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[var(--border)]">
                <div className="flex gap-4 items-end">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Asset Focus</label>
                      <select className="bg-[var(--bg-surface)] border border-[var(--border)] h-9 px-3 text-[11px] font-bold uppercase tracking-widest min-w-[160px] outline-none focus:border-[var(--accent)]" value={selectedTower || ''} onChange={e => setSelectedTower(e.target.value)}>
                        {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                   </div>
                   <h3 className="text-[20px] font-bold text-[var(--text-primary)] uppercase tracking-tight mb-1 ml-4 flex items-center gap-3">
                      <Layout size={20} className="text-[var(--accent)]" />
                      Spatial Matrix
                   </h3>
                </div>
                <button className="bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-4 py-2 text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2" onClick={() => setShowAddUnit(true)}>
                   <Plus size={16} /> Deploy Unit
                </button>
              </div>
              
              <div className="space-y-1">
                {Array.from({length: towers.find(t=>t.id===selectedTower)?.totalFloors || 0}, (_, i) => i + 1).reverse().map(floor => (
                  <div key={floor} className="flex gap-4 items-center p-2 border border-transparent hover:bg-[var(--bg-elevated)] hover:border-[var(--border)] transition-all">
                    <div className="w-12 flex flex-col items-center flex-shrink-0 group">
                       <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase mb-0.5">Floor</span>
                       <span className="text-[14px] font-bold text-[var(--text-secondary)] font-mono">{String(floor).padStart(2, '0')}</span>
                    </div>
                    <div className="flex gap-1 flex-1 overflow-x-auto no-scrollbar py-1">
                      {towers.find(t=>t.id===selectedTower)?.units?.filter((u:any) => u.floor === floor).sort((a:any, b:any) => a.unitNumber.localeCompare(b.unitNumber)).map((u:any) => (
                        <div 
                          key={u.id} 
                          onClick={() => setSelectedUnit(u)}
                          className={`min-w-[80px] h-10 border flex items-center justify-center cursor-pointer transition-all hover:border-[var(--accent)] relative group ${
                            u.status === 'AVAILABLE' ? 'bg-[var(--bg-surface)] border-[var(--border)]' : 
                            u.status === 'RESERVED' ? 'bg-[var(--warning-bg)] border-[var(--warning)]' : 
                            u.status === 'BOOKED' ? 'bg-[var(--accent-light)] border-[var(--accent)]' : 
                            'bg-[var(--bg-elevated)] border-[var(--border)] opacity-60'
                          }`}
                        >
                          <span className={`text-[11px] font-bold tracking-tight ${u.status === 'AVAILABLE' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{u.unitNumber}</span>
                          <div className={`w-1.5 h-1.5 absolute bottom-1 right-1 ${
                            u.status === 'AVAILABLE' ? 'bg-[var(--success)]' : 
                            u.status === 'RESERVED' ? 'bg-[var(--warning)]' : 
                            u.status === 'BOOKED' ? 'bg-[var(--accent)]' : 
                            'bg-[var(--text-muted)]'
                          }`} />
                        </div>
                      ))}
                      {towers.find(t=>t.id===selectedTower)?.units?.filter((u:any) => u.floor === floor).length === 0 && (
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest italic py-2 ml-2">Baseline Structural Frame Only</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                   <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                      <FileText size={16} className="text-[var(--accent)]" />
                      Documentation Matrix
                   </h3>
                   <button className="text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent-light)] px-3 py-1 border border-[var(--accent)] uppercase tracking-wider">
                      Upload PDF
                   </button>
                </div>
                <div className="p-4 space-y-2">
                  {project.media?.filter((m:any) => m.type === 'BROCHURE').map((m:any) => (
                    <div key={m.id} className="p-3 bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-between group hover:border-[var(--accent)] transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[var(--danger)]">
                            <FileText size={18} />
                         </div>
                         <div>
                            <div className="text-[11px] font-bold text-[var(--text-primary)] uppercase">{m.title || 'BROCHURE_V1.pdf'}</div>
                            <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase">PDF Document • 4.2 MB</div>
                         </div>
                      </div>
                      <a href={m.url} target="_blank" className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                         <FileDown size={18} />
                      </a>
                    </div>
                  ))}
                  {!project.media?.some((m:any) => m.type === 'BROCHURE') && (
                     <div className="py-12 text-center text-[var(--text-muted)] space-y-2">
                        <FileText size={32} className="mx-auto opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No Technical Data Registered</p>
                     </div>
                  )}
                </div>
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                   <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon size={16} className="text-[var(--accent)]" />
                      Visual Asset Repository
                   </h3>
                   <button className="p-1 border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--accent)]">
                      <Plus size={16} />
                   </button>
                </div>
                <div className="p-4 grid grid-cols-3 gap-3">
                   {project.media?.filter((m:any) => m.type === 'IMAGE').map((m:any) => (
                     <div key={m.id} className="relative aspect-square border border-[var(--border)] overflow-hidden group">
                        <img src={m.url} className="w-full h-full object-cover" />
                     </div>
                   ))}
                   <div className="aspect-square border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer bg-[var(--bg-elevated)]">
                      <Plus size={24} />
                      <span className="text-[8px] font-bold uppercase tracking-widest mt-2">Append</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'construction' && (
            <div className="max-w-3xl space-y-8">
              <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
                 <div>
                    <h3 className="text-[20px] font-bold text-[var(--text-primary)] uppercase tracking-tight">Development Timeline</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Historical structural progression matrix</p>
                 </div>
                 <button className="bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-6 py-2 text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2" onClick={() => setShowAddUpdate(true)}>
                    <Plus size={16} /> Commit Milestone
                 </button>
              </div>
              <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[2px] before:bg-[var(--border)]">
                {project.constructionUpdates?.length ? project.constructionUpdates.map((update:any) => (
                  <div key={update.id} className="relative group">
                    <div className="absolute -left-[28px] top-2 w-3 h-3 bg-[var(--bg-surface)] border-2 border-[var(--accent)]" />
                    <div className="bg-[var(--bg-surface)] p-6 border border-[var(--border)] group-hover:border-[var(--accent)] transition-all">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <h4 className="text-[16px] font-bold text-[var(--text-primary)] uppercase tracking-tight">{update.milestoneName}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
                               <Clock size={10} />
                               {new Date(update.updateDate).toLocaleDateString()}
                            </div>
                         </div>
                         <span className="px-2 py-0.5 border border-[var(--success)] text-[var(--success)] bg-[var(--success-bg)] text-[10px] font-bold uppercase tracking-wider">
                            {update.progressPct}% REACHED
                         </span>
                      </div>
                      <div className="h-1 bg-[var(--bg-elevated)] overflow-hidden mb-6">
                         <div className="h-full bg-[var(--success)]" style={{ width: `${update.progressPct}%` }} />
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] font-bold uppercase">{update.description}</p>
                      {update.photoUrls?.length > 0 && (
                        <div className="flex gap-2 mt-6 pt-6 border-t border-[var(--border)]">
                          {update.photoUrls.map((url:string, i:number) => (
                            <img key={i} src={url} className="w-16 h-16 border border-[var(--border)] object-cover" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center space-y-4 bg-[var(--bg-elevated)] border border-dashed border-[var(--border)]">
                     <Building2 size={48} className="mx-auto text-[var(--text-muted)]" />
                     <div>
                        <h4 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Structural Inertia</h4>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold italic mt-1 uppercase tracking-tighter">No progression milestones have been committed.</p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Entity Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Phase</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Engagement</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Acquisition Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr className="hover:bg-[var(--bg-elevated)] transition-all cursor-pointer group">
                    <td className="px-6 py-4">
                       <div className="text-[12px] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase">Prashant Gupta</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-0.5 border border-[var(--warning)] text-[var(--warning)] bg-[var(--warning-bg)] text-[10px] font-bold uppercase tracking-wider">INTERESTED</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 bg-[var(--bg-elevated)] overflow-hidden max-w-[60px]">
                             <div className="h-full bg-[var(--accent)]" style={{ width: '82%' }} />
                          </div>
                          <span className="text-[10px] font-bold text-[var(--text-secondary)] font-mono">82%</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">2 Days Previous</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showAddTower && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm" onClick={() => setShowAddTower(false)}>
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                 <Building2 size={18} className="text-[var(--accent)]" />
                 Initialize Tower Module
              </h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => setShowAddTower(false)}>
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={addTower} className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Structural Identifier</label>
                <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold uppercase outline-none focus:border-[var(--accent)]" required value={towerForm.name} onChange={e => setTowerForm({...towerForm, name: e.target.value})} placeholder="e.g. TOWER-ALPHA" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Vertical Complexity</label>
                <input type="number" className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold font-mono outline-none focus:border-[var(--accent)]" value={towerForm.totalFloors} onChange={e => setTowerForm({...towerForm, totalFloors: parseInt(e.target.value)})} />
              </div>
              <div className="flex gap-3 pt-6 border-t border-[var(--border)]">
                <button type="button" className="flex-1 px-4 py-2 text-[11px] font-bold uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setShowAddTower(false)}>Discard</button>
                <button type="submit" className="flex-1 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-4 py-2 text-[11px] font-bold uppercase hover:bg-[var(--bg-elevated)]">Authorize Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddUnit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm" onClick={() => setShowAddUnit(false)}>
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                 <Layout size={18} className="text-[var(--accent)]" />
                 Deploy Inventory Unit
              </h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => setShowAddUnit(false)}>
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={addUnit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Elevation Level</label>
                  <input type="number" className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold font-mono outline-none focus:border-[var(--accent)]" value={unitForm.floor} onChange={e => setUnitForm({...unitForm, floor: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Unit Designation</label>
                  <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold uppercase outline-none focus:border-[var(--accent)]" required value={unitForm.unitNumber} onChange={e => setUnitForm({...unitForm, unitNumber: e.target.value})} placeholder="A-101" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Classification Template</label>
                <select className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[11px] font-bold uppercase outline-none focus:border-[var(--accent)]" value={unitForm.type} onChange={e => setUnitForm({...unitForm, type: e.target.value})}>
                  {['ONE_BHK','TWO_BHK','THREE_BHK','FOUR_BHK','STUDIO','PENTHOUSE','VILLA','PLOT'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Market Valuation (₹)</label>
                <input type="number" className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold font-mono outline-none focus:border-[var(--accent)]" value={unitForm.totalPrice} onChange={e => setUnitForm({...unitForm, totalPrice: parseInt(e.target.value)})} />
              </div>
              <div className="flex gap-3 pt-6 border-t border-[var(--border)]">
                <button type="button" className="flex-1 px-4 py-2 text-[11px] font-bold uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setShowAddUnit(false)}>Discard</button>
                <button type="submit" className="flex-1 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-4 py-2 text-[11px] font-bold uppercase hover:bg-[var(--bg-elevated)]">Authorize Deployment</button>
              </div>
            </form>
          </div>
        </div>
      )}      {selectedUnit && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-[var(--bg-primary)]/80 backdrop-blur-sm" onClick={() => setSelectedUnit(null)}>
          <div className="bg-[var(--bg-surface)] w-[380px] h-full border-l border-[var(--border)] p-6 flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-10 pb-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] -mx-6 px-6 -mt-6 py-4">
               <div>
                  <h3 className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight uppercase italic">Unit {selectedUnit.unitNumber}</h3>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">Asset Control Panel</p>
               </div>
               <button className="text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => setSelectedUnit(null)}>
                 <X size={24} />
               </button>
             </div>

             <div className="space-y-4 flex-1 overflow-y-auto">
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--bg-elevated)] p-4 border border-[var(--border)]">
                     <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2">Live Status</label>
                     <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${
                       selectedUnit.status === 'AVAILABLE' ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]' :
                       selectedUnit.status === 'RESERVED' ? 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]' :
                       'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]'
                     }`}>
                        {selectedUnit.status}
                     </span>
                  </div>
                  <div className="bg-[var(--bg-elevated)] p-4 border border-[var(--border)]">
                     <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2">Template</label>
                     <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase">{selectedUnit.type.replace('_', ' ')}</span>
                  </div>
                  <div className="bg-[var(--bg-elevated)] p-4 border border-[var(--border)]">
                     <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2">Valuation</label>
                     <span className="text-[11px] font-bold text-[var(--text-primary)] font-mono">₹{selectedUnit.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="bg-[var(--bg-elevated)] p-4 border border-[var(--border)]">
                     <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2">Elevation</label>
                     <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase">Level {selectedUnit.floor}</span>
                  </div>
               </div>
               
               <div className="space-y-2 pt-8">
                 {selectedUnit.status === 'AVAILABLE' && (
                    <button className="w-full bg-[var(--warning-bg)] border-2 border-[var(--warning)] text-[var(--warning)] px-4 py-3 text-[11px] font-bold uppercase flex items-center justify-center gap-2" onClick={() => updateUnitStatus(selectedUnit.id, 'RESERVED')}>
                       <Lock size={16} /> Authorize Hold
                    </button>
                 )}
                 {selectedUnit.status === 'RESERVED' && (
                    <button className="w-full bg-[var(--success-bg)] border-2 border-[var(--success)] text-[var(--success)] px-4 py-3 text-[11px] font-bold uppercase flex items-center justify-center gap-2" onClick={() => updateUnitStatus(selectedUnit.id, 'AVAILABLE')}>
                       <Unlock size={16} /> Release Asset
                    </button>
                 )}
                 {(selectedUnit.status === 'AVAILABLE' || selectedUnit.status === 'RESERVED') && (
                    <button className="w-full bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-4 py-3 text-[11px] font-bold uppercase flex items-center justify-center gap-2" onClick={() => router.push(`/bookings/create?unitId=${selectedUnit.id}`)}>
                       <Calendar size={18} /> Initiate Booking Protocol
                    </button>
                 )}
                 <button className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] px-4 py-3 text-[11px] font-bold uppercase flex items-center justify-center gap-2">
                    <Edit size={16} /> Edit Attributes
                 </button>
                 <button className="w-full bg-[var(--danger-bg)] border-2 border-[var(--danger)] text-[var(--danger)] px-4 py-3 text-[11px] font-bold uppercase flex items-center justify-center gap-2 mt-8" onClick={() => updateUnitStatus(selectedUnit.id, 'BLOCKED')}>
                    <Ban size={16} /> Terminate Availability
                 </button>
               </div>
             </div>
             
             <div className="pt-4 border-t border-[var(--border)] text-center">
                 <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Asset ID: {selectedUnit.id}</p>
             </div>
          </div>
        </div>
      )}    )}

      {showAddUpdate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm" onClick={() => setShowAddUpdate(false)}>
           <div className="bg-[var(--bg-surface)] border border-[var(--border)] w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                 <Building2 size={18} className="text-[var(--accent)]" />
                 Post Structural Milestone
              </h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={() => setShowAddUpdate(false)}>
                 <X size={20} />
              </button>
            </div>
             <form onSubmit={handleAddUpdate} className="p-6 space-y-6">
                <div className="space-y-1">
                   <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Milestone Identifier</label>
                   <input className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold uppercase outline-none focus:border-[var(--accent)]" required value={updateForm.milestoneName} onChange={e => setUpdateForm({...updateForm, milestoneName: e.target.value})} placeholder="e.g. 5th Floor Slab Casting" />
                </div>
                <div className="space-y-1">
                   <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Progression Yield ({updateForm.progressPct}%)</label>
                   <input type="range" min="0" max="100" className="w-full h-1 bg-[var(--bg-elevated)] appearance-none cursor-pointer accent-[var(--accent)]" value={updateForm.progressPct} onChange={e => setUpdateForm({...updateForm, progressPct: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Tactical Narrative</label>
                   <textarea className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 text-[12px] font-bold uppercase outline-none focus:border-[var(--accent)] h-24" rows={3} value={updateForm.description} onChange={e => setUpdateForm({...updateForm, description: e.target.value})} placeholder="Describe structural achievements..." />
                </div>
                <div className="flex gap-3 pt-6 border-t border-[var(--border)]">
                   <button type="button" className="flex-1 px-4 py-2 text-[11px] font-bold uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setShowAddUpdate(false)}>Discard</button>
                   <button type="submit" className="flex-1 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-4 py-2 text-[11px] font-bold uppercase hover:bg-[var(--bg-elevated)]">Authorize Update</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </CRMLayout>
  );
}
