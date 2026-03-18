'use client';

import CRMLayout from '@/components/CRMLayout';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InventoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="page-header"><div><h2>Inventory</h2><p className="subtitle">Floor plan and unit status management</p></div></div>
      <div className="card">
        <div style={{display: 'flex', gap: 12, marginBottom: 24}}>
          {[{label:'Available', cls:'unit-available'},{label:'Reserved', cls:'unit-reserved'},{label:'Booked', cls:'unit-booked'},{label:'Sold', cls:'unit-sold'},{label:'Blocked', cls:'unit-blocked'}].map(s => (
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:6}}>
              <div className={`badge ${s.cls}`} style={{width:12,height:12,borderRadius:3,padding:0}} />
              <span style={{fontSize:12}}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="empty-state">
          <div className="icon">🏢</div>
          <h3>Select a project to view inventory</h3>
          <p>Go to Projects → Select a project → View towers and units</p>
          <button className="btn btn-primary btn-sm" style={{marginTop: 12}} onClick={() => router.push('/projects')}>View Projects</button>
        </div>
      </div>
    </CRMLayout>
  );
}
