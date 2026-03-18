'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function PortalDashboardPage() {
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
      <h1 style={{fontSize: 24, fontWeight: 700, marginBottom: 8}}>Buyer Portal</h1>
      <p style={{color: 'var(--text-muted)', marginBottom: 24}}>Welcome, {email}</p>

      {data?.bookings?.map((booking: any) => (
        <div key={booking.id} className="card" style={{marginBottom: 16}}>
          <h3 style={{fontSize: 16, fontWeight: 600}}>{booking.unit?.tower?.project?.name} — Unit {booking.unit?.unitNumber}</h3>
          <p style={{fontSize: 13, color: 'var(--text-muted)', marginTop: 4}}>Booking Amount: ₹{booking.bookingAmount?.toLocaleString()}</p>
          <div className="card-header" style={{marginTop: 16}}>Payment Schedule</div>
          {booking.payments?.map((p: any) => (
            <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14}}>
              <span>₹{p.amount?.toLocaleString()}</span>
              <span>Due: {new Date(p.dueDate).toLocaleDateString()}</span>
              <span className={`badge ${p.paidAt ? 'badge-success' : p.isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                {p.paidAt ? 'Paid' : p.isOverdue ? 'Overdue' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      ))}
      {!data?.bookings?.length && <div className="empty-state"><div className="icon">📋</div><h3>No bookings found</h3></div>}
    </div>
  );
}
