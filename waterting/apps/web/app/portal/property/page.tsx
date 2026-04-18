'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function PortalPropertyPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const email = typeof window !== 'undefined' ? localStorage.getItem('waterting_portal_email') : null;

  useEffect(() => {
    if (!email) { router.push('/portal/login'); return; }
    api.get<any>('/portal/dashboard').then(setData).catch(() => router.push('/portal/login')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div style={{maxWidth: 800, margin: '40px auto', padding: '0 20px'}}>
      <h2 style={{fontSize: 20, fontWeight: 700, marginBottom: 24}}>Property Details</h2>

      {data?.bookings?.map((booking: any) => (
        <div key={booking.id} style={{display: 'flex', flexDirection: 'column', gap: 24}}>
          <div className="card shadow-sm" style={{padding: 24}}>
            <h3 style={{fontSize: 22, fontWeight: 800, color: 'var(--primary)'}}>{booking.unit?.tower?.project?.name}</h3>
            <p style={{fontSize: 14, color: 'var(--text-muted)', marginTop: 4}}>📍 {booking.unit?.tower?.project?.location}</p>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20, marginTop: 24}}>
               <div><label style={{fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'}}>Unit Number</label><div style={{fontSize: 16, fontWeight: 700}}>{booking.unit?.unitNumber}</div></div>
               <div><label style={{fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'}}>Tower / Floor</label><div style={{fontSize: 16, fontWeight: 700}}>{booking.unit?.tower?.name} / {booking.unit?.floor}th</div></div>
               <div><label style={{fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'}}>Type</label><div style={{fontSize: 16, fontWeight: 700}}>{booking.unit?.type.replace(/_/g, ' ')}</div></div>
               <div><label style={{fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'}}>Carpet Area</label><div style={{fontSize: 16, fontWeight: 700}}>{booking.unit?.carpetArea} sq.ft.</div></div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header">Amenities & Features</div>
            <div style={{padding: 20, display: 'flex', flexWrap: 'wrap', gap: 10}}>
               {['Swimming Pool', 'Gymnasium', '24/7 Security', 'Clubhouse', 'Yoga Deck', 'Kids Play Area'].map(a => (
                  <span key={a} className="badge badge-info" style={{padding: '8px 12px'}}>{a}</span>
               ))}
            </div>
          </div>

          <div className="card shadow-sm" style={{padding: 0, overflow: 'hidden'}}>
             <div className="card-header" style={{border: 'none'}}>Location Map</div>
             <div style={{height: 300, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>
                [ Google Maps Embed for Noida Sector 62 ]
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
