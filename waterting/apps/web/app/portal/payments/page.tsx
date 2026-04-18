'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function PortalPaymentsPage() {
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
      <h2 style={{fontSize: 20, fontWeight: 700, marginBottom: 24}}>My Payments</h2>

      {data?.bookings?.map((booking: any) => (
        <div key={booking.id} className="card" style={{marginBottom: 24}}>
          <div className="card-header">{booking.unit?.unitNumber} — Payment Timeline</div>
          <div style={{padding: '0 20px'}}>
             {booking.payments.map((p: any, idx: number) => (
                <div key={p.id} style={{display: 'flex', gap: 20, padding: '20px 0', borderLeft: '2px solid #e2e8f0', marginLeft: 10, position: 'relative'}}>
                   <div style={{width: 12, height: 12, borderRadius: '50%', background: p.paidAt ? '#10b981' : p.isOverdue ? '#ef4444' : '#6366f1', position: 'absolute', left: -7, top: 24}} />
                   <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                         <div style={{fontWeight: 700, fontSize: 16}}>₹{p.amount.toLocaleString()}</div>
                         <span className={`badge ${p.paidAt ? 'badge-success' : p.isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                            {p.paidAt ? 'PAID' : p.isOverdue ? 'OVERDUE' : 'DUE'}
                         </span>
                      </div>
                      <div style={{fontSize: 13, color: 'var(--text-muted)', marginTop: 4}}>
                         {p.paidAt ? `Paid on ${new Date(p.paidAt).toLocaleDateString()}` : `Due by ${new Date(p.dueDate).toLocaleDateString()}`}
                      </div>
                      {p.paidAt && <button className="btn btn-secondary btn-sm" style={{marginTop: 10, fontSize: 11}}>📄 Download Receipt</button>}
                   </div>
                </div>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
}
