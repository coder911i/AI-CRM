'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  isOverdue: boolean;
}

export default function PortalPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Payment[]>('/portal/payments')
      .then(setPayments)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <h2 style={{fontSize: 20, fontWeight: 700, marginBottom: 20}}>Payment Schedule</h2>
      <div className="card" style={{padding: 0}}>
        {payments.map((p, i) => (
          <div key={p.id} style={{padding: 20, borderBottom: i === payments.length - 1 ? 'none' : '1px solid var(--border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span style={{fontWeight: 700}}>Installment {i + 1}</span>
              <span className={`badge ${p.paidAt ? 'badge-success' : p.isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                {p.paidAt ? 'Paid' : p.isOverdue ? 'Overdue' : 'Pending'}
              </span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)'}}>
              <span>Amount: ₹{p.amount.toLocaleString()}</span>
              <span>Due Date: {new Date(p.dueDate).toLocaleDateString()}</span>
            </div>
            {!p.paidAt && (
              <div style={{marginTop: 16, display: 'flex', gap: 12}}>
                 <button className="btn btn-primary btn-sm" style={{flex: 1}}>Pay via UPI</button>
                 <button className="btn btn-secondary btn-sm" style={{flex: 1}}>Bank Details</button>
              </div>
            )}
          </div>
        ))}
        {payments.length === 0 && (
          <div style={{padding: 40, textAlign: 'center', color: 'var(--text-muted)'}}>No payment records found.</div>
        )}
      </div>
    </div>
  );
}
