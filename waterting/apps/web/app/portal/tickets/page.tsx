'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await api.get<any[]>('/portal/tickets');
      setTickets(data);
    } catch (err) {
      router.push('/portal/login');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/portal/tickets', newTicket);
      setShowCreate(false);
      setNewTicket({ subject: '', description: '' });
      loadTickets();
    } catch (err) {
      alert('Failed to create ticket');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Support Tickets</h2>
          <p className="subtitle">We're here to help you</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create New Ticket</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tickets.map((ticket: any) => (
            <div key={ticket.id} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: 16, fontWeight: 700 }}>{ticket.subject}</h4>
                <span className={`badge ${ticket.status === 'OPEN' ? 'badge-warning' : 'badge-success'}`}>
                  {ticket.status}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ticket.description}
              </p>
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>ID: {ticket.id}</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No tickets found.
            </div>
          )}
        </div>

        <div className="card" style={{ background: '#F9FAFB', borderStyle: 'dashed' }}>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
            <h4>Select a ticket to view messages</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Our support team usually responds within 24 hours.</p>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Support Ticket</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <form onSubmit={createTicket}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  required 
                  placeholder="e.g. Payment receipt not received"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  value={newTicket.description}
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  required
                  placeholder="Describe your issue in detail..."
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
