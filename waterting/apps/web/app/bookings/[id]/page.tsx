'use client';

import React, { useState, useEffect } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import { useRouter, useParams } from 'next/navigation';

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  method: string | null;
  referenceNumber: string | null;
  isOverdue: boolean;
}

interface Booking {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  status: string;
  bookingAmount: number;
  unit: {
    unitNumber: string;
    tower: { name: string; project: { name: string } };
  };
  payments: Payment[];
  refunds?: any[];
}

export default function BookingDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    method: 'UPI',
    referenceNumber: '',
    paidAt: new Date().toISOString().split('T')[0]
  });
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({ amount: 0, reason: '', referenceNumber: '' });
  const [showProcessRefund, setShowProcessRefund] = useState<any>(null);
  const [processForm, setProcessForm] = useState({ referenceNumber: '', processedAt: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user && id) fetchBooking();
  }, [user, authLoading, id]);

  const fetchBooking = async () => {
    try {
      const data = await api.get<Booking>(`/bookings/${id}`);
      setBooking(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    try {
      await api.patch(`/payments/${selectedPayment.id}`, paymentForm);
      setShowPaymentModal(false);
      fetchBooking();
    } catch (err) {
      alert('Failed to record payment');
    }
  };

  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refundForm.amount > booking!.bookingAmount) return alert('Refund amount cannot exceed booking amount');
    try {
      await api.post(`/bookings/${id}/refunds`, refundForm);
      setShowRefundModal(false);
      fetchBooking();
      alert('Refund request submitted');
    } catch (err: any) { alert(err.message); }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/bookings/refunds/${showProcessRefund.id}/process`, processForm);
      setShowProcessRefund(null);
      fetchBooking();
    } catch (err: any) { alert(err.message); }
  };

  const handleRejectRefund = async (refundId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    try {
      await api.patch(`/bookings/refunds/${refundId}/reject`, { reason });
      fetchBooking();
    } catch (err: any) { alert(err.message); }
  };

  const generateDoc = async (type: string) => {
    try {
      // In production, this would trigger PdfGeneratorWorker
      alert(`Generating ${type}... Notification will be sent when ready.`);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!booking) return <CRMLayout><div className="empty-state">Booking not found</div></CRMLayout>;

  return (
    <CRMLayout>
      <div className="page-header">
        <div>
          <h2>Booking: #{booking.id.slice(-6).toUpperCase()}</h2>
          <p className="subtitle">{booking.unit.tower.project.name} • Tower {booking.unit.tower.name} • Unit {booking.unit.unitNumber}</p>
        </div>
        <div style={{display:'flex', gap: 12}}>
          <button className="btn btn-secondary btn-sm" onClick={() => generateDoc('Demand Letter')}>Demand Letter</button>
          <button className="btn btn-primary btn-sm" onClick={() => generateDoc('Confirmation')}>Booking Confirmation</button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24}}>
        <div className="card">
          <h3 style={{fontSize: 16, marginBottom: 16}}>Customer Details</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label" style={{marginBottom: 4}}>Name</label>
              <div style={{fontWeight: 600}}>{booking.buyerName}</div>
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label" style={{marginBottom: 4}}>Phone</label>
              <div style={{fontWeight: 600}}>{booking.buyerPhone}</div>
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label" style={{marginBottom: 4}}>Email</label>
              <div style={{fontWeight: 600}}>{booking.buyerEmail}</div>
            </div>
            <div style={{marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)'}}>
               <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>{booking.status}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{padding: 0}}>
          <div style={{padding: 20, borderBottom: '1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{fontSize: 16}}>Payment Schedule</h3>
            <span style={{fontSize: 14, fontWeight: 600}}>Total: ₹{booking.bookingAmount.toLocaleString()}</span>
          </div>
          <table className="data-table" style={{boxShadow: 'none'}}>
            <thead>
              <tr>
                <th>Installment</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {booking.payments.map((p, i) => (
                <tr key={p.id}>
                  <td>Installment {i + 1}</td>
                  <td>{new Date(p.dueDate).toLocaleDateString()}</td>
                  <td>₹{p.amount.toLocaleString()}</td>
                  <td>
                    {p.paidAt ? (
                      <span className="badge badge-success">PAID</span>
                    ) : (
                      <span className={`badge ${p.isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                        {p.isOverdue ? 'OVERDUE' : 'PENDING'}
                      </span>
                    )}
                  </td>
                  <td>
                    {!p.paidAt && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => { setSelectedPayment(p); setShowPaymentModal(true); }}
                      >
                        Record
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{marginTop: 24, padding: 0}}>
        <div style={{padding: 20, borderBottom: '1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{fontSize: 16}}>Refunds</h3>
          {(user?.role === 'TENANT_ADMIN' || user?.role === 'ACCOUNTS') && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowRefundModal(true)}>Request Refund</button>
          )}
        </div>
        <div style={{padding: '0 20px 20px'}}>
          <table className="data-table" style={{boxShadow: 'none'}}>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Processed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {booking.refunds?.length ? booking.refunds.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight: 700}}>₹{r.amount.toLocaleString()}</td>
                  <td style={{maxWidth: 200, fontSize: 13, color: 'var(--text-muted)'}}>{r.reason}</td>
                  <td>
                    <span className={`badge ${r.status === 'PROCESSED' ? 'badge-success' : r.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{fontSize: 12}}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td style={{fontSize: 12}}>{r.processedAt ? new Date(r.processedAt).toLocaleDateString() : '—'}</td>
                  <td>
                    {r.status === 'PENDING' && (user?.role === 'TENANT_ADMIN' || user?.role === 'ACCOUNTS') && (
                      <div style={{display:'flex', gap: 8}}>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowProcessRefund(r)}>Approve</button>
                        <button className="btn btn-secondary btn-sm" style={{color:'var(--danger)'}} onClick={() => handleRejectRefund(r.id)}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{textAlign:'center', padding: 20, color:'var(--text-muted)'}}>No refunds requested for this booking.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRefundModal && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
            <div className="modal-header"><h3>Request Refund</h3><button className="modal-close" onClick={() => setShowRefundModal(false)}>&times;</button></div>
            <form onSubmit={handleRequestRefund}>
              <div className="form-group">
                <label className="form-label">Amount (₹) - Max ₹{booking.bookingAmount.toLocaleString()}</label>
                <input type="number" className="form-input" required value={refundForm.amount} onChange={e => setRefundForm({...refundForm, amount: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea className="form-textarea" required value={refundForm.reason} onChange={e => setRefundForm({...refundForm, reason: e.target.value})} placeholder="Why is this being refunded?" />
              </div>
              <div style={{display:'flex', gap: 12, marginTop: 24}}>
                <button type="button" className="btn btn-secondary" style={{flex:1}} onClick={() => setShowRefundModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProcessRefund && (
        <div className="modal-overlay" onClick={() => setShowProcessRefund(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
            <div className="modal-header"><h3>Approve Refund</h3><button className="modal-close" onClick={() => setShowProcessRefund(null)}>&times;</button></div>
            <form onSubmit={handleProcessRefund}>
               <div className="form-group">
                <label className="form-label">Ref / Transaction ID</label>
                <input className="form-input" required value={processForm.referenceNumber} onChange={e => setProcessForm({...processForm, referenceNumber: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Processed Date</label>
                <input type="date" className="form-input" required value={processForm.processedAt} onChange={e => setProcessForm({...processForm, processedAt: e.target.value})} />
              </div>
              <div style={{display:'flex', gap: 12, marginTop: 24}}>
                <button type="button" className="btn btn-secondary" style={{flex:1}} onClick={() => setShowProcessRefund(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>Process Refund</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Payment - ₹{selectedPayment.amount.toLocaleString()}</h3>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select 
                  className="form-select" 
                  value={paymentForm.method} 
                  onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                >
                  <option value="UPI">UPI</option>
                  <option value="NEFT">NEFT</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reference / UTR Number</label>
                <input 
                  className="form-input" 
                  value={paymentForm.referenceNumber} 
                  onChange={e => setPaymentForm({...paymentForm, referenceNumber: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Payment</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={paymentForm.paidAt} 
                  onChange={e => setPaymentForm({...paymentForm, paidAt: e.target.value})}
                  required
                />
              </div>
              <div style={{display:'flex', gap: 12, marginTop: 24}}>
                <button type="button" className="btn btn-secondary" style={{flex:1}} onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
