'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Construction, BrickWall, HardHat } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PortalConstructionPage() {
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
      <h2 style={{fontSize: 20, fontWeight: 700, marginBottom: 24}}>Construction Updates</h2>

      {data?.bookings?.map((booking: any) => (
        <div key={booking.id} style={{marginBottom: 40}}>
          <h3 style={{fontSize: 18, fontWeight: 700, marginBottom: 12}}>{booking.unit?.tower?.project?.name}</h3>
          
          <div className="card" style={{padding: 20, marginBottom: 20}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
               <span style={{fontSize: 14, fontWeight: 600}}>Overall Progress</span>
               <span style={{fontSize: 14, fontWeight: 700, color: 'var(--primary)'}}>75%</span>
            </div>
            <div style={{height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden'}}>
               <div style={{width: '75%', height: '100%', background: 'var(--primary)'}} />
            </div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            {[
              { title: 'Foundation Completed', date: 'Jan 15, 2026', icon: <HardHat size={24} className="text-primary" /> },
              { title: 'First Floor Slab Cast', date: 'Feb 20, 2026', icon: <Construction size={24} className="text-primary" /> },
              { title: 'Brickwork in Progress', date: 'Current Task', icon: <BrickWall size={24} className="text-primary" /> },
            ].reverse().map((update, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-6 items-center">
                 <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-xl shrink-0">
                    {update.icon}
                 </div>
                 <div>
                    <div style={{fontWeight: 700}}>{update.title}</div>
                    <div style={{fontSize: 12, color: 'var(--text-muted)', marginTop: 4}}>{update.date}</div>
                    <p style={{fontSize: 13, marginTop: 8}}>Work progressing on schedule as per project timeline.</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
