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

interface Dispute {
  id: string;
  leadId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  resolution?: string;
  createdAt: string;
}

export default function BrokerDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [broker, setBroker] = useState<Broker | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab ] = useState<'leads' | 'disputes'>('leads');
  
  // Modal states
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [newDisputeLeadId, setNewDisputeLeadId] = useState('');
  const [newDisputeReason, setNewDisputeReason] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user && id) fetchBroker();
  }, [user, authLoading, id]);

  useEffect(() => {
    if (user && id && activeTab === 'disputes') fetchDisputes();
  }, [activeTab]);

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

  const fetchDisputes = async () => {
    try {
      const data = await api.get<Dispute[]>(`/brokers/${id}/disputes`);
      setDisputes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlagDispute = async () => {
    if (!newDisputeLeadId || !newDisputeReason) return;
    try {
      await api.post(`/brokers/${id}/disputes`, {
        leadId: newDisputeLeadId,
        reason: newDisputeReason
      });
      setShowDisputeModal(false);
      setNewDisputeLeadId('');
      setNewDisputeReason('');
      fetchDisputes();
    } catch (err) {
      alert('Failed to flag dispute');
    }
  };

  const toggleStatus = async () => {
    if (!broker) return;
    try {
      if (!broker.isActive) {
        await api.post(`/brokers/${broker.id}/approve`, {});
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
        <div style={{display:'flex', gap: 12}}>
          <button className="btn btn-secondary" onClick={() => setShowDisputeModal(true)}>Flag Dispute</button>
          {!broker.isActive && (
            <button className="btn btn-primary" onClick={toggleStatus}>Approve Broker</button>
          )}
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24}}>
        <div style={{display:'flex', flexDirection:'column', gap: 24}}>
          <div className="card shadow-sm">
            <h3 style={{fontSize: 16, marginBottom: 16}}>Broker Profile</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <div><label className="form-label" style={{fontSize:10, textTransform:'uppercase'}}>Phone</label><div style={{fontWeight: 600}}>{broker.phone}</div></div>
              <div><label className="form-label" style={{fontSize:10, textTransform:'uppercase'}}>Email</label><div style={{fontWeight: 600}}>{broker.email || 'N/A'}</div></div>
              <div><label className="form-label" style={{fontSize:10, textTransform:'uppercase'}}>RERA</label><div style={{fontWeight: 600}}>{broker.reraNumber || 'Not Provided'}</div></div>
              <div><label className="form-label" style={{fontSize:10, textTransform:'uppercase'}}>Commission</label><div style={{fontWeight: 700, color:'var(--primary)'}}>{broker.commissionPct}%</div></div>
            </div>
          </div>

          <div className="card shadow-sm" style={{textAlign:'center'}}>
            <h3 style={{fontSize: 14, marginBottom: 16}}>Referral Assets</h3>
            <img src={qrUrl} alt="QR" style={{width: 160, height: 160, margin: '0 auto', display: 'block', borderRadius: 12, border:'1px solid var(--border)'}} />
            <div style={{marginTop: 16, padding: '10px', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: 8, fontSize: 13, fontWeight: 700}}>
              {broker.referralCode}
            </div>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap: 24}}>
          <div className="card" style={{padding: 0, overflow: 'hidden'}}>
            <div style={{display:'flex', background: 'var(--bg)', borderBottom: '1px solid var(--border)'}}>
              <button 
                onClick={() => setActiveTab('leads')}
                style={{
                  padding: '16px 24px', 
                  border: 'none', 
                  background: activeTab === 'leads' ? 'var(--card-bg)' : 'transparent',
                  borderBottom: activeTab === 'leads' ? '2px solid var(--primary)' : 'none',
                  fontWeight: activeTab === 'leads' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                Referred Leads ({broker.leads.length})
              </button>
              <button 
                onClick={() => setActiveTab('disputes')}
                style={{
                  padding: '16px 24px', 
                  border: 'none', 
                  background: activeTab === 'disputes' ? 'var(--card-bg)' : 'transparent',
                  borderBottom: activeTab === 'disputes' ? '2px solid var(--primary)' : 'none',
                  fontWeight: activeTab === 'disputes' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                Disputes & Flags
              </button>
            </div>

            {activeTab === 'leads' && (
              <table className="data-table" style={{boxShadow:'none'}}>
                <thead>
                  <tr><th>Lead Name</th><th>Stage</th><th>Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {broker.leads.map(lead => (
                    <tr key={lead.id}>
                      <td style={{fontWeight: 600}}>{lead.name}</td>
                      <td><span className="badge badge-info">{lead.stage}</span></td>
                      <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => router.push(`/leads/${lead.id}`)}>View</button></td>
                    </tr>
                  ))}
                  {broker.leads.length === 0 && (
                    <tr><td colSpan={4} style={{textAlign:'center', padding:40, color:'var(--text-muted)'}}>No referrals found.</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'disputes' && (
              <div style={{padding: 20}}>
                {disputes.map(d => (
                  <div key={d.id} style={{padding: 16, border: '1px solid var(--border)', borderRadius: 12, marginBottom: 12}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom: 8}}>
                      <div style={{fontWeight: 700}}>Lead ID: {d.leadId}</div>
                      <span className={`badge badge-${d.status.toLowerCase()}`}>{d.status}</span>
                    </div>
                    <p style={{fontSize: 13, color:'var(--text-muted)'}}>{d.reason}</p>
                    {d.resolution && (
                      <div style={{marginTop: 12, padding: 10, background: 'rgba(var(--success-rgb), 0.1)', borderRadius: 6, fontSize: 12}}>
                        <strong>Resolution:</strong> {d.resolution}
                      </div>
                    )}
                  </div>
                ))}
                {disputes.length === 0 && (
                  <div style={{textAlign:'center', padding:40, color:'var(--text-muted)'}}>No active disputes.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDisputeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Flag Commission Dispute</h3>
              <button className="modal-close" onClick={() => setShowDisputeModal(false)}>&times;</button>
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label className="form-label">Select Lead</label>
              <select className="form-select" value={newDisputeLeadId} onChange={(e) => setNewDisputeLeadId(e.target.value)}>
                <option value="">Choose Lead</option>
                {broker.leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Dispute Reason</label>
              <textarea 
                className="form-input" 
                rows={3} 
                value={newDisputeReason} 
                onChange={(e) => setNewDisputeReason(e.target.value)}
                placeholder="Ex: Commission was not credited for booking done on..."
              />
            </div>
            <div style={{display:'flex', gap: 12, marginTop: 24}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={() => setShowDisputeModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{flex:1}} onClick={handleFlagDispute}>Submit Flag</button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
