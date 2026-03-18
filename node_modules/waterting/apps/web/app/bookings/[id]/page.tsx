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
