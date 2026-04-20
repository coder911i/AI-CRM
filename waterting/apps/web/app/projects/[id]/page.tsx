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

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!project) return <CRMLayout><div className="flex flex-col items-center justify-center py-32 text-slate-300 gap-4"><Building2 size={64} /><h3 className="text-xl font-black uppercase">Project Nullified</h3></div></CRMLayout>;

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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{project.name}</h1>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    Status: {project.status}
                 </span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-medium text-sm">
                 <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {project.location}</span>
                 <span className="w-1 h-1 bg-slate-200 rounded-full" />
                 <span className="flex items-center gap-1.5 uppercase text-xs tracking-widest font-black text-slate-500">{project.type}</span>
              </div>
           </div>
           <div className="flex gap-2">
              <button className="btn btn-secondary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5 shadow-sm border-slate-200">
                 <Settings size={14} /> Global Config
              </button>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { label: 'Asset Blocks', value: towers.length, icon: <Layers className="text-blue-500" /> },
             { label: 'Inventory Units', value: towers.reduce((acc, t) => acc + (t._count?.units || 0), 0), icon: <Layout className="text-indigo-500" /> },
             { label: 'Active Enquiries', value: project._count?.leads || 0, icon: <Users className="text-violet-500" /> },
             { label: 'Project Flux', value: `${project.constructionUpdates?.[0]?.progressPct || 45}%`, icon: <Activity className="text-emerald-500" /> }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                   {stat.icon}
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{stat.label}</label>
                   <div className="text-xl font-black text-slate-900 font-mono tracking-tighter">{stat.value}</div>
                </div>
             </div>
           ))}
        </div>

        <div className="border-b border-slate-100 flex gap-10 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-2">
                   <Target size={16} className="text-primary" />
                   Sales Extraction Funnel
                </h3>
                <div className="h-[300px] flex items-end justify-between gap-4 px-4 overflow-hidden pt-10">
                   {[
                     { label: 'INTAKE', count: 45, pct: 100 },
                     { label: 'CONTACT', count: 32, pct: 71 },
                     { label: 'INTENT', count: 18, pct: 40 },
                     { label: 'VISIT', count: 12, pct: 26 },
                     { label: 'CONVERSION', count: 5, pct: 11 }
                   ].map((bar, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center group">
                        <div className="w-full bg-slate-50 rounded-t-lg relative flex flex-col justify-end transition-all hover:bg-primary/5 border-x border-t border-slate-100" style={{ height: `${bar.pct}%` }}>
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors">{bar.count}</div>
                           <div className="w-full h-[3px] bg-primary rounded-t-full shadow-[0_-4px_12px_rgba(37,99,235,0.4)]" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">{bar.label}</span>
                     </div>
                   ))}
                </div>
              </div>
              <div className="lg:col-span-4 bg-white p-8 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-10 w-full text-left flex items-center gap-2">
                   <TrendingUp size={16} className="text-primary" />
                   Inventory Saturation
                 </h3>
                 <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[1.5rem] border-slate-50" />
                    <div className="absolute inset-0 rounded-full border-[1.5rem] border-primary border-t-transparent border-l-transparent -rotate-45" />
                    <div>
                       <div className="text-3xl font-black text-slate-900 tracking-tighter">72%</div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saturated</div>
                    </div>
                 </div>
                 <div className="space-y-3 w-full">
                    {unitStats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-400' : 'bg-blue-600'}`} />
                            {stat.name}
                         </span>
                         <span className="text-xs font-black text-slate-900 font-mono tracking-tighter">{stat.value}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'towers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Structural Blocks</h3>
                 <button className="btn btn-secondary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" onClick={() => setShowAddTower(true)}>
                    <Plus size={14} /> Append Tower
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {towers.map(t => (
                  <div key={t.id} className={`bg-white p-6 rounded-xl border transition-all cursor-pointer group ${selectedTower === t.id ? 'border-primary ring-1 ring-primary/20 shadow-lg' : 'border-slate-200/60 hover:border-slate-300 shadow-sm'}`} onClick={() => { setSelectedTower(t.id); setActiveTab('inventory'); }}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                         <Building2 size={24} className={selectedTower === t.id ? 'text-primary' : 'text-slate-300'} />
                      </div>
                      <div className="text-right">
                         <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-tighter">
                            {t.units?.filter((u:any) => u.status === 'AVAILABLE').length || 0} Open
                         </span>
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">{t.name}</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">{t.totalFloors} Structural Levels</p>
                    <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-primary transition-colors">Access Matrix</span>
                       <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-slate-100">
                <div className="flex gap-4 items-end">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Focus</label>
                      <select className="form-select h-10 border-slate-200 font-black text-xs uppercase tracking-widest min-w-[180px] pr-10 shadow-sm" value={selectedTower || ''} onChange={e => setSelectedTower(e.target.value)}>
                        {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                   </div>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1 ml-4 flex items-center gap-3">
                      <Layout size={20} className="text-primary" />
                      Spatial Matrix
                   </h3>
                </div>
                <button className="btn btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5 shadow-md" onClick={() => setShowAddUnit(true)}>
                   <Plus size={16} /> Deploy Unit
                </button>
              </div>
              
              <div className="space-y-2">
                {Array.from({length: towers.find(t=>t.id===selectedTower)?.totalFloors || 0}, (_, i) => i + 1).reverse().map(floor => (
                  <div key={floor} className="flex gap-6 items-center p-2 rounded-lg hover:bg-slate-50/50 transition-colors">
                    <div className="w-16 flex flex-col items-center flex-shrink-0 group">
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5 group-hover:text-primary transition-colors">Floor</span>
                       <span className="text-base font-black text-slate-400 group-hover:text-slate-900 transition-colors font-mono">{String(floor).padStart(2, '0')}</span>
                    </div>
                    <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide py-1">
                      {towers.find(t=>t.id===selectedTower)?.units?.filter((u:any) => u.floor === floor).sort((a:any, b:any) => a.unitNumber.localeCompare(b.unitNumber)).map((u:any) => (
                        <div 
                          key={u.id} 
                          onClick={() => setSelectedUnit(u)}
                          className={`min-w-[90px] h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm relative group ${
                            u.status === 'AVAILABLE' ? 'bg-white border-emerald-100 hover:border-emerald-300' : 
                            u.status === 'RESERVED' ? 'bg-amber-50 border-amber-200' : 
                            u.status === 'BOOKED' ? 'bg-blue-50 border-blue-200' : 
                            'bg-slate-100 border-slate-200 opacity-60'
                          }`}
                        >
                          <span className={`text-xs font-black tracking-tight ${u.status === 'AVAILABLE' ? 'text-slate-900' : 'text-slate-600'}`}>{u.unitNumber}</span>
                          <div className={`w-1 h-1 rounded-full absolute bottom-1.5 ${
                            u.status === 'AVAILABLE' ? 'bg-emerald-500' : 
                            u.status === 'RESERVED' ? 'bg-amber-500' : 
                            u.status === 'BOOKED' ? 'bg-blue-600' : 
                            'bg-slate-400'
                          }`} />
                          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"><Plus size={10} /></div>
                          </div>
                        </div>
                      ))}
                      {towers.find(t=>t.id===selectedTower)?.units?.filter((u:any) => u.floor === floor).length === 0 && (
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic py-3 ml-2">Baseline Structural Frame Only</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                   <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      Documentation Matrix
                   </h3>
                   <button className="text-[10px] font-black text-primary hover:bg-blue-50 px-3 py-1.5 rounded transition-all border border-blue-100 uppercase tracking-widest">
                      Upload PDF
                   </button>
                </div>
                <div className="p-6 space-y-3">
                  {project.media?.filter((m:any) => m.type === 'BROCHURE').map((m:any) => (
                    <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-red-500 shadow-sm">
                            <FileText size={18} />
                         </div>
                         <div>
                            <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{m.title || 'BROCHURE_V1.pdf'}</div>
                            <div className="text-[9px] font-bold text-slate-400">PDF Document • 4.2 MB</div>
                         </div>
                      </div>
                      <a href={m.url} target="_blank" className="p-2 hover:bg-blue-50 text-slate-400 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-blue-100">
                         <FileDown size={18} />
                      </a>
                    </div>
                  ))}
                  {!project.media?.some((m:any) => m.type === 'BROCHURE') && (
                     <div className="py-12 text-center text-slate-300 space-y-2">
                        <FileText size={32} className="mx-auto opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No Technical Data Registered</p>
                     </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                   <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={16} className="text-primary" />
                      Visual Asset Repository
                   </h3>
                   <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 border border-slate-200 bg-white">
                      <Plus size={16} />
                   </button>
                </div>
                <div className="p-6 grid grid-cols-3 gap-3">
                   {project.media?.filter((m:any) => m.type === 'IMAGE').map((m:any) => (
                     <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-100 group">
                        <img src={m.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <MoreVertical size={16} className="text-white" />
                        </div>
                     </div>
                   ))}
                   <div className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all cursor-pointer bg-slate-50/30">
                      <Plus size={24} />
                      <span className="text-[8px] font-black uppercase tracking-widest mt-2">Append</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'construction' && (
            <div className="max-w-3xl space-y-8">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Development Timeline</h3>
                    <p className="text-xs text-slate-400 font-medium">Historical structural progression matrix</p>
                 </div>
                 <button className="btn btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5" onClick={() => setShowAddUpdate(true)}>
                    <Plus size={16} /> Commit Milestone
                 </button>
              </div>
              <div className="relative pl-8 space-y-12 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-px before:bg-slate-100">
                {project.constructionUpdates?.length ? project.constructionUpdates.map((update:any) => (
                  <div key={update.id} className="relative group">
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-primary shadow-[0_0_0_4px_#fff]" />
                    <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm group-hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h4 className="text-base font-black text-slate-900 tracking-tight">{update.milestoneName}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                               <Clock size={10} />
                               {new Date(update.updateDate).toLocaleDateString()}
                            </div>
                         </div>
                         <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                            {update.progressPct}% REACHED
                         </span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden mb-5">
                         <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${update.progressPct}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-bold">{update.description}</p>
                      {update.photoUrls?.length > 0 && (
                        <div className="flex gap-2 mt-6 pt-6 border-t border-slate-50">
                          {update.photoUrls.map((url:string, i:number) => (
                            <img key={i} src={url} className="w-16 h-16 rounded-lg object-cover border border-slate-100 hover:scale-110 transition-transform" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                     <Building2 size={48} className="mx-auto text-slate-200" />
                     <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Structural Inertia</h4>
                        <p className="text-[11px] text-slate-400 font-medium italic mt-1 uppercase tracking-tighter">No progression milestones have been committed.</p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {/* Actual implementation would fetch leads filtered by projectId */}
                  <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                       <div className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">Prashant Gupta</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">INTERESTED</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden max-w-[60px]">
                             <div className="h-full bg-primary" style={{ width: '82%' }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-500 font-mono">82%</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2 Days Previous</span>
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
        <div className="modal-overlay" onClick={() => setShowAddTower(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <Building2 size={18} className="text-primary" />
                 Initialize Tower Module
              </h3>
              <button className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setShowAddTower(false)}>
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={addTower} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Structural Identifier (Name)</label>
                <input className="form-input" required value={towerForm.name} onChange={e => setTowerForm({...towerForm, name: e.target.value})} placeholder="e.g. TOWER-ALPHA" />
              </div>
              <div className="form-group">
                <label className="form-label">Vertical Complexity (Total Floors)</label>
                <input type="number" className="form-input" value={towerForm.totalFloors} onChange={e => setTowerForm({...towerForm, totalFloors: parseInt(e.target.value)})} />
              </div>
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button type="button" className="btn btn-secondary flex-1 font-bold uppercase text-[11px]" onClick={() => setShowAddTower(false)}>Discard</button>
                <button type="submit" className="btn btn-primary flex-1 font-bold uppercase text-[11px]">Authorize Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddUnit && (
        <div className="modal-overlay" onClick={() => setShowAddUnit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 450}}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <Layout size={18} className="text-primary" />
                 Deploy Inventory Unit
              </h3>
              <button className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setShowAddUnit(false)}>
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={addUnit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Elevation Level (Floor)</label>
                  <input type="number" className="form-input" value={unitForm.floor} onChange={e => setUnitForm({...unitForm, floor: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Designation</label>
                  <input className="form-input font-black uppercase" required value={unitForm.unitNumber} onChange={e => setUnitForm({...unitForm, unitNumber: e.target.value})} placeholder="A-101" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Classification Template</label>
                <select className="form-select font-bold text-xs" value={unitForm.type} onChange={e => setUnitForm({...unitForm, type: e.target.value})}>
                  {['ONE_BHK','TWO_BHK','THREE_BHK','FOUR_BHK','STUDIO','PENTHOUSE','VILLA','PLOT'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Market Valuation (₹)</label>
                <input type="number" className="form-input font-mono font-bold" value={unitForm.totalPrice} onChange={e => setUnitForm({...unitForm, totalPrice: parseInt(e.target.value)})} />
              </div>
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button type="button" className="btn btn-secondary flex-1 font-bold uppercase text-[11px]" onClick={() => setShowAddUnit(false)}>Discard</button>
                <button type="submit" className="btn btn-primary flex-1 font-bold uppercase text-[11px]">Authorize Deployment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUnit && (
        <div className="modal-overlay" onClick={() => setSelectedUnit(null)}>
          <div className="bg-white w-[400px] h-full fixed right-0 top-0 shadow-2xl p-8 flex flex-col border-l border-slate-100" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-100">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Unit {selectedUnit.unitNumber}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Asset Control Panel</p>
               </div>
               <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setSelectedUnit(null)}>
                 <X size={24} />
               </button>
             </div>

             <div className="space-y-8 flex-1 overflow-y-auto">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Live Status</label>
                     <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                       selectedUnit.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                       selectedUnit.status === 'RESERVED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                       'bg-blue-50 text-blue-600 border-blue-100'
                     }`}>
                        {selectedUnit.status}
                     </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Template</label>
                     <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{selectedUnit.type.replace('_', ' ')}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Valuation</label>
                     <span className="text-xs font-black text-slate-900 font-mono">₹{selectedUnit.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Elevation</label>
                     <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Level {selectedUnit.floor}</span>
                  </div>
               </div>
               
               <div className="space-y-3 pt-10">
                 {selectedUnit.status === 'AVAILABLE' && (
                    <button className="btn btn-secondary w-full flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-50" onClick={() => updateUnitStatus(selectedUnit.id, 'RESERVED')}>
                       <Lock size={16} /> Authorize Hold
                    </button>
                 )}
                 {selectedUnit.status === 'RESERVED' && (
                    <button className="btn btn-secondary w-full flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50" onClick={() => updateUnitStatus(selectedUnit.id, 'AVAILABLE')}>
                       <Unlock size={16} /> Release Asset
                    </button>
                 )}
                 {(selectedUnit.status === 'AVAILABLE' || selectedUnit.status === 'RESERVED') && (
                    <button className="btn btn-primary w-full flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest h-12 shadow-lg" onClick={() => router.push(`/bookings/create?unitId=${selectedUnit.id}`)}>
                       <Calendar size={18} /> Initiate Booking Protocol
                    </button>
                 )}
                 <button className="btn btn-secondary w-full flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest border-slate-200 h-12">
                    <Edit size={16} /> Edit Attributes
                 </button>
                 <button className="btn btn-danger w-full flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest bg-red-50 text-red-600 border-red-100 hover:bg-red-100 mt-10 h-12" onClick={() => updateUnitStatus(selectedUnit.id, 'BLOCKED')}>
                    <Ban size={16} /> Terminate Availability
                 </button>
               </div>
             </div>
             
             <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Asset ID: {selectedUnit.id}</p>
             </div>
          </div>
        </div>
      )}

      {showAddUpdate && (
        <div className="modal-overlay" onClick={() => setShowAddUpdate(false)}>
           <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
             <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <Building2 size={18} className="text-primary" />
                 Post Structural Milestone
              </h3>
              <button className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setShowAddUpdate(false)}>
                 <X size={20} />
              </button>
            </div>
             <form onSubmit={handleAddUpdate} className="space-y-6">
                <div className="form-group">
                   <label className="form-label">Milestone Identifier</label>
                   <input className="form-input" required value={updateForm.milestoneName} onChange={e => setUpdateForm({...updateForm, milestoneName: e.target.value})} placeholder="e.g. 5th Floor Slab Casting" />
                </div>
                <div className="form-group">
                   <label className="form-label">Progression Yield ({updateForm.progressPct}%)</label>
                   <input type="range" min="0" max="100" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" value={updateForm.progressPct} onChange={e => setUpdateForm({...updateForm, progressPct: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                   <label className="form-label">Tactical Narrative</label>
                   <textarea className="form-textarea h-24" rows={3} value={updateForm.description} onChange={e => setUpdateForm({...updateForm, description: e.target.value})} placeholder="Describe structural achievements..." />
                </div>
                <div className="flex gap-3 pt-6 border-t border-slate-100">
                   <button type="button" className="btn btn-secondary flex-1 font-bold uppercase text-[11px]" onClick={() => setShowAddUpdate(false)}>Discard</button>
                   <button type="submit" className="btn btn-primary flex-1 font-bold uppercase text-[11px]">Authorize Update</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </CRMLayout>
  );
}
