'use client';

import React, { useState, useEffect } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  type: string;
  carpetArea: number;
  totalPrice: number;
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'SOLD' | 'BLOCKED';
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

  // Modal State
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [holdHours, setHoldHours] = useState(24);

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
    setIsRefreshing(true);
    try {
      const data = await api.get<Unit[]>(`/projects/${selectedProjectId}/units`);
      // If tower selected, filter here (or backend if supported)
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
      if (newStatus === 'RESERVED') {
        await api.patch(`/units/${selectedUnit.id}/hold`, { holdHours });
      } else {
        // Generic status update if backend allows
        // Here we just use the hold endpoint for simulation or extend API
      }
      setSelectedUnit(null);
      fetchUnits();
    } catch (err) {
      alert('Update failed');
    }
  };

  const filteredUnits = units.filter(u => {
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    const matchesSearch = u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="page-header">
        <div>
          <h2>Inventory Management</h2>
          <p className="subtitle">Real-time availability across all towers</p>
        </div>
        <div style={{display:'flex', gap: 12}}>
          <button className="btn btn-secondary btn-sm">Export CSV</button>
          <button className="btn btn-primary btn-sm">Bulk Price Update</button>
        </div>
      </div>

      <div className="card" style={{marginBottom: 24}}>
        <div style={{display:'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16}}>
          <div className="form-group">
            <label className="form-label">Project</label>
            <select 
              className="form-select" 
              value={selectedProjectId} 
              onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedTowerId(''); }}
            >
              <option value="">Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tower</label>
            <select 
              className="form-select"
              value={selectedTowerId}
              onChange={(e) => setSelectedTowerId(e.target.value)}
            >
              <option value="">All Towers</option>
              {projects.find(p => p.id === selectedProjectId)?.towers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Search Unit</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ex: A-101" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{display:'flex', gap: 8, marginTop: 16, flexWrap: 'wrap'}}>
          {['ALL', 'AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD', 'BLOCKED'].map(s => (
            <button 
              key={s} 
              className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isRefreshing ? (
         <div style={{textAlign:'center', padding: 40}}><div className="spinner" style={{margin:'0 auto'}} /></div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16}}>
          {filteredUnits.map(unit => (
            <div key={unit.id} className="card" style={{cursor:'pointer'}} onClick={() => setSelectedUnit(unit)}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom: 12}}>
                <span style={{fontWeight: 700, fontSize: 16}}>{unit.unitNumber}</span>
                <span className={`badge unit-${unit.status.toLowerCase()}`}>{unit.status}</span>
              </div>
              <div style={{fontSize: 13, color: 'var(--text-muted)'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom: 4}}>
                  <span>Type</span><span>{unit.type.replace('_', ' ')}</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom: 4}}>
                  <span>Area</span><span>{unit.carpetArea} sqft</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontWeight: 600, color: 'var(--text)', marginTop: 8}}>
                  <span>Price</span><span>₹{unit.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredUnits.length === 0 && (
            <div style={{gridColumn:'1/-1', textAlign:'center', padding: 40, border:'2px dashed var(--border)', borderRadius: 12}}>
              <p>No units found matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {selectedUnit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Management: {selectedUnit.unitNumber}</h3>
              <button className="modal-close" onClick={() => setSelectedUnit(null)}>&times;</button>
            </div>
            <div className="form-group">
              <label className="form-label">Action</label>
              <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="">Select Action</option>
                <option value="RESERVED">Put on Hold</option>
                <option value="BLOCKED">Block Unit</option>
                <option value="AVAILABLE">Make Available</option>
                <option value="BOOKING">Create Booking</option>
              </select>
            </div>
            {newStatus === 'RESERVED' && (
              <div className="form-group">
                <label className="form-label">Hold Duration (Hours)</label>
                <input type="number" className="form-input" value={holdHours} onChange={(e) => setHoldHours(Number(e.target.value))} />
              </div>
            )}
            <div style={{display:'flex', gap: 12, marginTop: 24}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={() => setSelectedUnit(null)}>Cancel</button>
              <button className="btn btn-primary" style={{flex:1}} onClick={handleStatusUpdate}>Apply Change</button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
