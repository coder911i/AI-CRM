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

  const [project, setProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user && id) fetchData();
  }, [user, authLoading, id]);

  const fetchData = async () => {
    try {
      const [projData, unitsData] = await Promise.all([
        api.get<Project>(`/projects/${id}`),
        api.get<Unit[]>(`/projects/${id}/units`),
      ]);
      setProject(projData);
      setUnits(unitsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!project) return <CRMLayout><div className="empty-state">Project not found</div></CRMLayout>;

  const unitStats = [
    { name: 'Available', value: units.filter(u => u.status === 'AVAILABLE').length },
    { name: 'Reserved', value: units.filter(u => u.status === 'RESERVED').length },
    { name: 'Booked', value: units.filter(u => u.status === 'BOOKED' || u.status === 'SOLD').length },
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
          <div className="card-header">Total Units</div>
          <div className="card-value">{units.length}</div>
        </div>
        <div className="card">
          <div className="card-header">Available</div>
          <div className="card-value" style={{color: 'var(--success)'}}>{units.filter(u => u.status === 'AVAILABLE').length}</div>
        </div>
        <div className="card">
          <div className="card-header">Leads</div>
          <div className="card-value">{project._count?.leads || 0}</div>
        </div>
        <div className="card">
          <div className="card-header">Est. Revenue</div>
          <div className="card-value">₹{(units.filter(u => u.status === 'SOLD').reduce((acc, curr) => acc + curr.totalPrice, 0) / 10000000).toFixed(2)} Cr</div>
        </div>
      </div>

      <div style={{borderBottom: '1px solid var(--border)', marginBottom: 24, display: 'flex', gap: 24}}>
        {['overview', 'inventory', 'leads', 'analytics'].map(tab => (
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
              cursor: 'pointer'
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

      {activeTab === 'inventory' && (
        <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16}}>
          {units.map(u => (
            <div key={u.id} className="card" onClick={() => router.push('/inventory')}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom: 8}}>
                <span style={{fontWeight: 700}}>{u.unitNumber}</span>
                <span className={`badge unit-${u.status.toLowerCase()}`}>{u.status}</span>
              </div>
              <p style={{fontSize: 12, color: 'var(--text-muted)'}}>{u.type.replace('_', ' ')}</p>
              <p style={{fontWeight: 600, marginTop: 8}}>₹{u.totalPrice.toLocaleString()}</p>
            </div>
          ))}
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
    </CRMLayout>
  );
}
