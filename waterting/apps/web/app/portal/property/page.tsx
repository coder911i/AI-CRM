'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function PortalPropertyPage() {
  const router = useRouter();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/portal/property')
      .then(setUnit)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!unit) return <div className="empty-state">No property details found.</div>;

  return (
    <div>
      <h2 style={{fontSize: 20, fontWeight: 700, marginBottom: 20}}>Property Details</h2>
      <div className="card" style={{marginBottom: 24}}>
        <h3 style={{fontSize: 16, fontWeight: 700, marginBottom: 16}}>Unit {unit.unitNumber}</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
          <div>
            <span style={{fontSize: 12, color: 'var(--text-muted)'}}>Tower</span>
            <div style={{fontWeight: 600}}>{unit.tower?.name}</div>
          </div>
          <div>
            <span style={{fontSize: 12, color: 'var(--text-muted)'}}>Floor</span>
            <div style={{fontWeight: 600}}>{unit.floor}</div>
          </div>
          <div>
            <span style={{fontSize: 12, color: 'var(--text-muted)'}}>Unit Type</span>
            <div style={{fontWeight: 600}}>{unit.type?.replace('_', ' ')}</div>
          </div>
          <div>
            <span style={{fontSize: 12, color: 'var(--text-muted)'}}>Carpet Area</span>
            <div style={{fontWeight: 600}}>{unit.carpetArea} sqft</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{fontSize: 16, fontWeight: 700, marginBottom: 16}}>Project: {unit.tower?.project?.name}</h3>
        <p style={{fontSize: 14, color: 'var(--text-muted)', marginBottom: 20}}>📍 {unit.tower?.project?.location}</p>
        <div className="card-header" style={{marginBottom: 12}}>Amenities</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
          {unit.tower?.project?.amenities?.map((a: string) => (
            <span key={a} className="badge badge-info">{a}</span>
          ))}
          {(!unit.tower?.project?.amenities || unit.tower.project.amenities.length === 0) && (
            <span style={{fontSize: 13, color: 'var(--text-muted)'}}>No amenities listed.</span>
          )}
        </div>
      </div>
    </div>
  );
}
