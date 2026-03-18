'use client';

import React, { useState, useEffect } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import { useRouter, useParams } from 'next/navigation';

interface Lead {
  id: string;
  name: string;
  stage: string;
  createdAt: string;
}

interface Broker {
  id: string;
  name: string;
  email: string;
  phone: string;
  reraNumber: string;
  referralCode: string;
  isActive: boolean;
  commissionPct: number;
  leads: Lead[];
  _count?: { leads: number };
}

export default function BrokerDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user && id) fetchBroker();
  }, [user, authLoading, id]);

  const fetchBroker = async () => {
    try {
      const data = await api.get<Broker>(`/brokers/${id}`);
      setBroker(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!broker) return;
    try {
      if (!broker.isActive) {
        await api.post(`/brokers/${broker.id}/approve`, {});
      } else {
        // Implement deactivation if needed
      }
      fetchBroker();
    } catch (err) {
      alert('Action failed');
    }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!broker) return <CRMLayout><div className="empty-state">Broker not found</div></CRMLayout>;

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  const qrUrl = `${apiBase}/brokers/${broker.id}/qr`;

  return (
    <CRMLayout>
      <div className="page-header">
        <div>
          <div style={{display:'flex', alignItems:'center', gap: 12}}>
            <h2>{broker.name}</h2>
            <span className={`badge ${broker.isActive ? 'badge-success' : 'badge-warning'}`}>
              {broker.isActive ? 'ACTIVE' : 'PENDING APPROVAL'}
            </span>
          </div>
          <p className="subtitle">Broker ID: {broker.id.slice(-6).toUpperCase()}</p>
        </div>
        {!broker.isActive && (
          <button className="btn btn-primary" onClick={toggleStatus}>Approve Broker</button>
        )}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24}}>
        <div style={{display:'flex', flexDirection:'column', gap: 24}}>
          <div className="card">
            <h3 style={{fontSize: 16, marginBottom: 16}}>Broker Profile</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label" style={{marginBottom:4}}>Phone</label>
                <div style={{fontWeight: 600}}>{broker.phone}</div>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label" style={{marginBottom:4}}>Email</label>
                <div style={{fontWeight: 600}}>{broker.email || 'N/A'}</div>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label" style={{marginBottom:4}}>RERA Number</label>
                <div style={{fontWeight: 600}}>{broker.reraNumber || 'Not Provided'}</div>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label" style={{marginBottom:4}}>Commission Rate</label>
                <div style={{fontWeight: 600, color:'var(--primary)'}}>{broker.commissionPct}%</div>
              </div>
            </div>
          </div>

          <div className="card" style={{textAlign:'center'}}>
            <h3 style={{fontSize: 16, marginBottom: 16}}>Referral QR Code</h3>
            <img 
              src={qrUrl} 
              alt="Referral QR" 
              style={{width: 200, height: 200, margin: '0 auto', display: 'block', borderRadius: 8, border:'1px solid var(--border)'}} 
            />
            <p style={{fontSize: 12, color:'var(--text-muted)', marginTop: 12}}>Share this code with leads to automatically track referrals</p>
            <div style={{marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: 13, fontWeight: 600}}>
              {broker.referralCode}
            </div>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap: 24}}>
          <div className="stats-grid">
            <div className="card">
              <div className="card-header">Total Leads</div>
              <div className="card-value">{broker._count?.leads || broker.leads.length}</div>
            </div>
            <div className="card">
              <div className="card-header">Bookings</div>
              <div className="card-value">0</div>
            </div>
            <div className="card">
              <div className="card-header">Commission Earned</div>
              <div className="card-value">₹0</div>
            </div>
          </div>

          <div className="card" style={{padding: 0}}>
            <div style={{padding: 20, borderBottom: '1px solid var(--border)'}}>
              <h3 style={{fontSize: 16}}>Referred Leads</h3>
            </div>
            <table className="data-table" style={{boxShadow:'none'}}>
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Current Stage</th>
                  <th>Referred on</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {broker.leads.map(lead => (
                  <tr key={lead.id}>
                    <td style={{fontWeight: 600}}>{lead.name}</td>
                    <td><span className={`badge badge-info`}>{lead.stage}</span></td>
                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/leads/${lead.id}`)}>View</button>
                    </td>
                  </tr>
                ))}
                {broker.leads.length === 0 && (
                  <tr><td colSpan={4} style={{textAlign:'center', padding:40, color:'var(--text-muted)'}}>No referrals found for this broker.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
