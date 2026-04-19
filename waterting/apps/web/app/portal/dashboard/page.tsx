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
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Buyer Dashboard</h2>
          <p className="subtitle">Overview of your real estate journey</p>
        </div>
        <div style={{ padding: '8px 16px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>
          {email}
        </div>
      </div>

      <div className="stats-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">💰</div>
          <div className="kpi-content">
            <div className="kpi-label">Total Booked Value</div>
            <div className="kpi-value">₹{(data?.bookings?.reduce((acc: number, b: any) => acc + (b.grandTotal || 0), 0) || 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green">✅</div>
          <div className="kpi-content">
            <div className="kpi-label">Paid Amount</div>
            <div className="kpi-value">
              ₹{(data?.bookings?.reduce((acc: number, b: any) => 
                acc + (b.payments?.filter((p: any) => p.paidAt).reduce((sum: number, p: any) => sum + p.amount, 0) || 0), 0) || 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red">⏳</div>
          <div className="kpi-content">
            <div className="kpi-label">Outstanding</div>
            <div className="kpi-value">
              ₹{(data?.bookings?.reduce((acc: number, b: any) => 
                acc + (b.payments?.filter((p: any) => !p.paidAt).reduce((sum: number, p: any) => sum + p.amount, 0) || 0), 0) || 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple">🗓️</div>
          <div className="kpi-content">
            <div className="kpi-label">Upcoming Visits</div>
            <div className="kpi-value">{data?.visits?.filter((v:any) => new Date(v.scheduledAt) > new Date()).length || 0}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>My Bookings</h3>
          {data?.bookings?.map((booking: any) => (
            <div key={booking.id} className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700 }}>{booking.unit?.tower?.project?.name}</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Unit {booking.unit?.unitNumber} · {booking.unit?.type?.replace('_', ' ')}</p>
                </div>
                <div className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>
                  {booking.status}
                </div>
              </div>

              <div className="data-table" style={{ background: 'transparent', boxShadow: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 0', fontSize: 11 }}>Instalment</th>
                      <th style={{ padding: '8px 0', fontSize: 11 }}>Amount</th>
                      <th style={{ padding: '8px 0', fontSize: 11 }}>Due Date</th>
                      <th style={{ padding: '8px 0', fontSize: 11 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.payments?.slice(0, 5).map((p: any) => (
                      <tr key={p.id}>
                        <td style={{ padding: '10px 0', fontSize: 13 }}>{p.receiptNumber || 'Installment'}</td>
                        <td style={{ padding: '10px 0', fontSize: 13, fontWeight: 600 }}>₹{p.amount.toLocaleString()}</td>
                        <td style={{ padding: '10px 0', fontSize: 13 }}>{new Date(p.dueDate).toLocaleDateString()}</td>
                        <td style={{ padding: '10px 0' }}>
                          <span className={`badge ${p.paidAt ? 'badge-success' : p.isOverdue ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                            {p.paidAt ? 'Paid' : p.isOverdue ? 'Overdue' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link href="/portal/payments" className="btn btn-secondary btn-sm" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>View Full Payment Schedule</Link>
            </div>
          ))}
          {!data?.bookings?.length && (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🏠</div>
              <h4>No Active Bookings</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>Explore properties to start your journey.</p>
              <Link href="/portal/wishlist" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Browse Wishlist</Link>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Site Visits</h3>
          <div className="card">
            {data?.visits?.slice(0, 3).map((v: any) => (
              <div key={v.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{v.lead?.project?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(v.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <div className="user-avatar" style={{ width: 20, height: 20, fontSize: 10 }}>{v.agent?.name?.charAt(0)}</div>
                  <span style={{ fontSize: 12 }}>{v.agent?.name || 'Assigned Agent'}</span>
                </div>
              </div>
            ))}
            {!data?.visits?.length && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                No visits scheduled.
              </div>
            )}
            <Link href="/portal/visits" className="btn btn-secondary btn-sm" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>Schedule a Visit</Link>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Offers for You</h3>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--navy), #1E3A5F)', color: '#fff', border: 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Early Bird Special</div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: '8px 0' }}>Zero GST on Bookings</div>
            <p style={{ fontSize: 12, opacity: 0.7 }}>Limited time offer for new projects in North Goa. Use code WATER24.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16, background: '#fff', color: 'var(--navy)' }}>Check Projects</button>
          </div>
        </div>
      </div>
    </div>
  );
}
