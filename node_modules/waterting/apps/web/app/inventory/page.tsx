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

  // Modal States
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [holdHours, setHoldHours] = useState(24);
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
      alert('Prices updated successfully');
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
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowBulkPrice(true)}>Bulk Price Update</button>
        </div>
      </div>

      <div className="card shadow-sm" style={{marginBottom: 24}}>
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
            <div key={unit.id} className="card shadow-sm hover-card" style={{cursor:'pointer'}} onClick={() => setSelectedUnit(unit)}>
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
        </div>
      )}

      {selectedUnit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Action: {selectedUnit.unitNumber}</h3>
              <button className="modal-close" onClick={() => setSelectedUnit(null)}>&times;</button>
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label className="form-label">Set Status</label>
              <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="">Select Status</option>
                <option value="AVAILABLE">Make Available</option>
                <option value="RESERVED">Hold (Temporary)</option>
                <option value="BLOCKED">Internal Block</option>
                <option value="SOLD">Mark SOLD</option>
              </select>
            </div>
            <div style={{display:'flex', gap: 12, marginTop: 24}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={() => setSelectedUnit(null)}>Cancel</button>
              <button className="btn btn-primary" style={{flex:1}} onClick={handleStatusUpdate}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {showBulkPrice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Bulk Price Update</h3>
              <button className="modal-close" onClick={() => setShowBulkPrice(false)}>&times;</button>
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label className="form-label">Tower (Required)</label>
              <select className="form-select" value={bulkTowerId} onChange={(e) => setBulkTowerId(e.target.value)}>
                <option value="">Select Tower</option>
                {projects.find(p => p.id === selectedProjectId)?.towers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Floor (Optional - Empty for all floors)</label>
              <input type="number" className="form-input" value={bulkFloor} onChange={(e) => setBulkFloor(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">New Base Price (₹)</label>
              <input type="number" className="form-input" value={bulkPrice} onChange={(e) => setBulkPrice(Number(e.target.value))} placeholder="Ex: 8500000" />
            </div>
            <div style={{display:'flex', gap: 12, marginTop: 24}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={() => setShowBulkPrice(false)}>Cancel</button>
              <button className="btn btn-primary" style={{flex:1}} onClick={handleBulkPriceUpdate}>Update All Units</button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
