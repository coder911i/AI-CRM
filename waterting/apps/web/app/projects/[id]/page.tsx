'use client';

import React, { useState, useEffect } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import { useRouter, useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  reraNumber?: string;
  _count?: {
    leads: number;
    towers: number;
  };
}

interface Unit {
  id: string;
  unitNumber: string;
  status: string;
  type: string;
  totalPrice: number;
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6B7280'];

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
  if (!project) return <CRMLayout><div className="empty-state">Project not found</div></CRMLayout>;

  const allUnits = towers.flatMap(t => t.units || []);
  const unitStats = [
    { name: 'Available', value: allUnits.filter(u => u.status === 'AVAILABLE').length },
    { name: 'Reserved', value: allUnits.filter(u => u.status === 'RESERVED').length },
    { name: 'Booked', value: allUnits.filter(u => u.status === 'BOOKED' || u.status === 'SOLD').length },
  ];

  const funnelData = [
    { stage: 'New', count: 45 },
    { stage: 'Contacted', count: 32 },
    { stage: 'Interested', count: 18 },
    { stage: 'Visit Done', count: 12 },
    { stage: 'Booking', count: 5 },
  ];

  return (
    <CRMLayout>
      <div className="page-header">
        <div>
          <div style={{display:'flex', alignItems:'center', gap: 12}}>
            <h2>{project.name}</h2>
            <span className={`badge ${project.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{project.status}</span>
          </div>
          <p className="subtitle">📍 {project.location} • {project.type}</p>
        </div>
        <button className="btn btn-secondary btn-sm">Edit Project</button>
      </div>

      <div className="stats-grid">
        <div className="card">
          <div className="card-header">Total Towers</div>
          <div className="card-value">{towers.length}</div>
        </div>
        <div className="card">
          <div className="card-header">Total Units</div>
          <div className="card-value">{towers.reduce((acc, t) => acc + (t._count?.units || 0), 0)}</div>
        </div>
        <div className="card">
          <div className="card-header">Leads</div>
          <div className="card-value">{project._count?.leads || 0}</div>
        </div>
        <div className="card">
          <div className="card-header">Construction</div>
          <div className="card-value">{(project.constructionUpdates?.[0]?.progressPct || 45)}%</div>
        </div>
      </div>

      <div style={{borderBottom: '1px solid var(--border)', marginBottom: 24, display: 'flex', gap: 24, overflowX: 'auto'}}>
        {['overview', 'towers', 'inventory', 'media', 'construction', 'leads'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 4px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'capitalize',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24}}>
          <div className="card">
            <h3 style={{fontSize: 16, marginBottom: 20}}>Sales Funnel</h3>
            <div style={{height: 300}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="stage" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <h3 style={{fontSize: 16, marginBottom: 20}}>Unit Status</h3>
            <div style={{height: 300}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unitStats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {unitStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'towers' && (
        <div>
          <div className="page-header">
            <h3>Towers</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddTower(true)}>+ Add Tower</button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap: 16}}>
            {towers.map(t => (
              <div key={t.id} className={`card ${selectedTower === t.id ? 'active' : ''}`} style={{borderColor: selectedTower === t.id ? 'var(--primary)' : ''}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                  <div>
                    <h4 style={{fontSize: 16, fontWeight: 700}}>{t.name}</h4>
                    <p style={{fontSize: 12, color: 'var(--text-muted)'}}>{t.totalFloors} Floors</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span className="badge badge-success">{t.units?.filter((u:any) => u.status === 'AVAILABLE').length || 0} Available</span>
                  </div>
                </div>
                <div style={{marginTop:16, display:'flex', gap: 8}}>
                  <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={() => { setSelectedTower(t.id); setActiveTab('inventory'); }}>View Units</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => alert('Edit logic here')}>✏️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div>
          <div className="page-header">
            <div style={{display:'flex', gap: 12, alignItems:'center'}}>
              <select className="form-select" style={{width: 150}} value={selectedTower || ''} onChange={e => setSelectedTower(e.target.value)}>
                {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <h3>Matrix View</h3>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUnit(true)}>+ Add Unit</button>
          </div>
          
          <div style={{display:'flex', flexDirection:'column', gap: 4}}>
            {/* Group units by floor and render matrix */}
            {Array.from({length: towers.find(t=>t.id===selectedTower)?.totalFloors || 0}, (_, i) => i + 1).reverse().map(floor => (
              <div key={floor} style={{display:'flex', gap: 12, alignItems:'center'}}>
                <div style={{width: 40, fontSize: 11, fontWeight: 700, color:'var(--text-muted)'}}>FL {floor}</div>
                <div style={{display:'flex', gap: 4, flex: 1, overflowX: 'auto'}}>
                  {towers.find(t=>t.id===selectedTower)?.units?.filter((u:any) => u.floor === floor).sort((a:any, b:any) => a.unitNumber.localeCompare(b.unitNumber)).map((u:any) => (
                    <div 
                      key={u.id} 
                      onClick={() => setSelectedUnit(u)}
                      style={{
                        minWidth: 80, height: 40, borderRadius: 6, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, fontWeight: 600, cursor:'pointer',
                        background: u.status === 'AVAILABLE' ? 'var(--success)' : u.status === 'RESERVED' ? 'var(--warning)' : u.status === 'BOOKED' ? '#3B82F6' : u.status === 'SOLD' ? '#6B7280' : 'var(--danger)',
                        color: '#fff'
                      }}
                    >
                      {u.unitNumber}
                    </div>
                  ))}
                  {towers.find(t=>t.id===selectedTower)?.units?.filter((u:any) => u.floor === floor).length === 0 && <div style={{fontSize: 10, color:'var(--text-muted)', fontStyle:'italic'}}>Empty floor</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 24}}>
          <div className="card">
            <div className="card-header">Brochures & Documents</div>
            <div style={{marginTop: 12, display:'flex', flexDirection:'column', gap: 8}}>
              <div style={{padding:12, border:'1px dashed var(--border)', borderRadius: 8, textAlign:'center'}}>
                <button className="btn btn-secondary btn-sm">+ Upload PDF</button>
              </div>
              {project.media?.filter((m:any) => m.type === 'BROCHURE').map((m:any) => (
                <div key={m.id} style={{padding:8, background:'var(--bg)', borderRadius:6, display:'flex', justifyContent:'space-between'}}>
                  <span style={{fontSize:13}}>📄 {m.title || 'Brochure.pdf'}</span>
                  <a href={m.url} target="_blank" style={{fontSize:11, color:'var(--primary)'}}>Download</a>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">Walkthrough & Photos</div>
            <div style={{marginTop:12, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap: 8}}>
               <div style={{aspectRatio:'1/1', border:'1px dashed var(--border)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 24, cursor:'pointer'}}>+</div>
               {project.media?.filter((m:any) => m.type === 'IMAGE').map((m:any) => (
                 <img key={m.id} src={m.url} style={{width:'100%', aspectRatio:'1/1', objectFit:'cover', borderRadius:8}} />
               ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'construction' && (
        <div style={{maxWidth:700}}>
          <div className="page-header">
            <h3>Construction History</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUpdate(true)}>+ Add Update</button>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap: 16}}>
            {project.constructionUpdates?.length ? project.constructionUpdates.map((update:any) => (
              <div key={update.id} className="card">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                   <h4 style={{fontSize: 15, fontWeight: 700}}>{update.milestoneName}</h4>
                   <span style={{fontSize: 12, color:'var(--text-muted)'}}>{new Date(update.updateDate).toLocaleDateString()}</span>
                </div>
                <div style={{height: 8, background:'#E2E8F0', borderRadius: 4, margin:'12px 0'}}>
                   <div style={{width: `${update.progressPct}%`, height:'100%', background:'var(--primary)', borderRadius:4}} />
                </div>
                <p style={{fontSize: 13, color:'var(--text-muted)'}}>{update.description}</p>
                <div style={{display:'flex', gap: 8, marginTop: 12}}>
                  {update.photoUrls?.map((url:string, i:number) => (
                    <img key={i} src={url} style={{width:60, height:60, borderRadius:6, objectFit:'cover'}} />
                  ))}
                </div>
              </div>
            )) : <div className="empty-state">No updates logged yet.</div>}
          </div>
        </div>
      )}

      {/* Modals & Slide-overs */}
      {showAddTower && (
        <div className="modal-overlay" onClick={() => setShowAddTower(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
            <div className="modal-header"><h3>Add Tower</h3><button className="modal-close" onClick={() => setShowAddTower(false)}>×</button></div>
            <form onSubmit={addTower}>
              <div className="form-group"><label className="form-label">Tower Name *</label><input className="form-input" required value={towerForm.name} onChange={e => setTowerForm({...towerForm, name: e.target.value})} placeholder="e.g. Tower A" /></div>
              <div className="form-group"><label className="form-label">Total Floors</label><input type="number" className="form-input" value={towerForm.totalFloors} onChange={e => setTowerForm({...towerForm, totalFloors: parseInt(e.target.value)})} /></div>
              <div style={{display:'flex', gap: 12, marginTop: 24}}>
                <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setShowAddTower(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Add Tower</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddUnit && (
        <div className="modal-overlay" onClick={() => setShowAddUnit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 450}}>
            <div className="modal-header"><h3>Add Unit</h3><button className="modal-close" onClick={() => setShowAddUnit(false)}>×</button></div>
            <form onSubmit={addUnit}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
                <div className="form-group"><label>Floor</label><input type="number" className="form-input" value={unitForm.floor} onChange={e => setUnitForm({...unitForm, floor: parseInt(e.target.value)})} /></div>
                <div className="form-group"><label>Unit Number</label><input className="form-input" required value={unitForm.unitNumber} onChange={e => setUnitForm({...unitForm, unitNumber: e.target.value})} placeholder="e.g. A-101" /></div>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-select" value={unitForm.type} onChange={e => setUnitForm({...unitForm, type: e.target.value})}>
                  {['ONE_BHK','TWO_BHK','THREE_BHK','FOUR_BHK','STUDIO','PENTHOUSE','VILLA','PLOT'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Total Price (₹)</label><input type="number" className="form-input" value={unitForm.totalPrice} onChange={e => setUnitForm({...unitForm, totalPrice: parseInt(e.target.value)})} /></div>
              <div style={{display:'flex', gap: 12, marginTop: 24}}>
                <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setShowAddUnit(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Create Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUnit && (
        <div className="modal-overlay" onClick={() => setSelectedUnit(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400, transform: 'translateX(auto)', marginRight: 0, height:'100vh', borderRadius:0, position:'fixed', right: 0, top: 0}}>
             <div className="modal-header">
               <h3>Unit {selectedUnit.unitNumber}</h3>
               <button className="modal-close" onClick={() => setSelectedUnit(null)}>×</button>
             </div>
             <div style={{display:'flex', flexDirection:'column', gap: 20}}>
               <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, fontSize: 13}}>
                 <div><span style={{color:'var(--text-muted)'}}>Status</span><br/><span className={`badge unit-${selectedUnit.status.toLowerCase()}`}>{selectedUnit.status}</span></div>
                 <div><span style={{color:'var(--text-muted)'}}>Type</span><br/>{selectedUnit.type.replace('_', ' ')}</div>
                 <div><span style={{color:'var(--text-muted)'}}>Price</span><br/>₹{selectedUnit.totalPrice.toLocaleString()}</div>
                 <div><span style={{color:'var(--text-muted)'}}>Floor</span><br/>{selectedUnit.floor}</div>
               </div>
               
               <div style={{display:'flex', flexDirection:'column', gap: 10, marginTop: 32}}>
                 {selectedUnit.status === 'AVAILABLE' && <button className="btn btn-warning" onClick={() => updateUnitStatus(selectedUnit.id, 'RESERVED')}>🔒 Place Hold</button>}
                 {selectedUnit.status === 'RESERVED' && <button className="btn btn-success" onClick={() => updateUnitStatus(selectedUnit.id, 'AVAILABLE')}>🔓 Release Hold</button>}
                 {(selectedUnit.status === 'AVAILABLE' || selectedUnit.status === 'RESERVED') && <button className="btn btn-primary" onClick={() => router.push(`/bookings/create?unitId=${selectedUnit.id}`)}>📅 Book Unit</button>}
                 <button className="btn btn-secondary">✏️ Edit Details</button>
                 <button className="btn btn-danger" style={{marginTop: 20}} onClick={() => updateUnitStatus(selectedUnit.id, 'BLOCKED')}>🚫 Block Unit</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="card" style={{padding: 0}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Score</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {/* Mocking lead data for now or fetch /leads?projectId=id */}
              <tr>
                <td>Prashant Gupta</td>
                <td><span className="badge badge-warning">INTERESTED</span></td>
                <td>82</td>
                <td>2 days ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showAddUpdate && (
        <div className="modal-overlay" onClick={() => setShowAddUpdate(false)}>
           <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
             <div className="modal-header"><h3>Post Construction Update</h3><button className="modal-close" onClick={() => setShowAddUpdate(false)}>×</button></div>
             <form onSubmit={handleAddUpdate}>
               <div className="form-group"><label>Milestone Name *</label><input className="form-input" required value={updateForm.milestoneName} onChange={e => setUpdateForm({...updateForm, milestoneName: e.target.value})} placeholder="e.g. 5th Floor Slab Casting" /></div>
               <div className="form-group"><label>Progress Percentage ({updateForm.progressPct}%)</label><input type="range" min="0" max="100" className="form-input" value={updateForm.progressPct} onChange={e => setUpdateForm({...updateForm, progressPct: parseInt(e.target.value)})} /></div>
               <div className="form-group"><label>Description</label><textarea className="form-textarea" rows={3} value={updateForm.description} onChange={e => setUpdateForm({...updateForm, description: e.target.value})} /></div>
               <div style={{display:'flex', gap: 12, marginTop: 24}}>
                  <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setShowAddUpdate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{flex: 1}}>Post Update</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </CRMLayout>
  );
}
