'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { api.get<any[]>('/bookings').then(setBookings).catch(console.error).finally(() => setLoading(false)); }
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  const statusBadge = (s: string) => {
    switch(s) { case 'CONFIRMED': return 'badge-success'; case 'CANCELLED': return 'badge-danger'; case 'PAYMENT_PENDING': return 'badge-warning'; default: return 'badge-info'; }
  };

  return (
    <CRMLayout>
      <div className="page-header"><div><h2>Bookings</h2><p className="subtitle">{bookings.length} bookings</p></div></div>
      <div className="card" style={{padding: 0, overflow: 'hidden'}}>
        <table className="data-table">
          <thead><tr><th>Buyer</th><th>Unit</th><th>Project</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{cursor:'pointer'}} onClick={() => router.push(`/bookings/${b.id}`)}>
                <td style={{fontWeight: 600}}>{b.buyerName}</td>
                <td>{b.unit?.unitNumber || '—'}</td>
                <td>{b.unit?.tower?.project?.name || '—'}</td>
                <td>₹{b.bookingAmount?.toLocaleString()}</td>
                <td><span className={`badge ${statusBadge(b.status)}`}>{b.status?.replace(/_/g,' ')}</span></td>
                <td style={{fontSize: 12, color: 'var(--text-muted)'}}>{new Date(b.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!bookings.length && <tr><td colSpan={6}><div className="empty-state"><div className="icon">📋</div><h3>No bookings yet</h3></div></td></tr>}
          </tbody>
        </table>
      </div>
    </CRMLayout>
  );
}
