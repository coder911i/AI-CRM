'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function PortalPropertyPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/portal/property')
      .then(setData)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state">No property details found.</div>;

  const { unit, project } = data;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <h2>Unit {unit.unitNumber}</h2>
          <p className="subtitle">{project.name} • {unit.type?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header">Unit Specifications</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Floor</span>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{unit.floor}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Facing</span>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{unit.facing || 'East'}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</span>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{unit.type?.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carpet Area</span>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{unit.carpetArea} sqft</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Super Area</span>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{unit.superArea || (unit.carpetArea * 1.5).toFixed(0)} sqft</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tower</span>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Tower A</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Floor Plan</div>
            <div style={{ marginTop: 16, background: 'var(--bg)', borderRadius: 8, padding: 20, textAlign: 'center' }}>
              {unit.floorPlanUrl ? (
                <img src={unit.floorPlanUrl} alt="Floor Plan" style={{ maxWidth: '100%', borderRadius: 4 }} />
              ) : (
                <div style={{ padding: 60, color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 8 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
                  <p>Large Scale Floor Plan Currently Unavailable</p>
                  <p style={{ fontSize: 12 }}>Please contact our office for a physical copy.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header">Project Information</div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{project.name}</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>📍 {project.location}</p>
              
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: 6, borderLeft: '4px solid var(--primary)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>RERA Registration</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{project.reraNumber || 'P1234567890'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Amenities & Services</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {project.amenities?.map((a: string) => (
                <span key={a} className="badge badge-info" style={{ padding: '4px 10px', fontSize: 11 }}>{a}</span>
              )) || ['Pool', 'Gym', 'Clubhouse', 'Security', 'Parking'].map(a => (
                <span key={a} className="badge badge-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>{a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
