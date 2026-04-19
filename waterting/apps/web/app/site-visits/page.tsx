'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function SiteVisitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState<any>(null);
  const [feedback, setFeedback] = useState({ outcome: 'INTERESTED', notes: '', followUpDate: '', rating: 5 });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchVisits();
  }, [user, authLoading]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/site-visits');
      setVisits(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await api.patch(`/site-visits/${id}/checkin`, {});
      fetchVisits();
      alert('Checked in successfully');
    } catch (err: any) { alert(err.message); }
  };

  const handleNoShow = async (id: string) => {
    if (!confirm('Mark this visit as No Show?')) return;
    try {
      await api.patch(`/site-visits/${id}/checkout`, { outcome: 'NO_SHOW', notes: 'Client did not arrive' });
      fetchVisits();
      alert('Marked as No Show. Lead moved back to Contacted.');
    } catch (err: any) { alert(err.message); }
  };

  const handleCheckOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.notes) return alert('Feedback notes are required');
    try {
      await api.patch(`/site-visits/${showCheckout.id}/checkout`, feedback);
      setShowCheckout(null);
      setFeedback({ outcome: 'INTERESTED', notes: '', followUpDate: '', rating: 5 });
      fetchVisits();
      alert('Visit feedback saved');
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  const getStatusBadge = (v: any) => {
    if (v.outcome === 'NO_SHOW') return <span className="badge badge-cold">NO SHOW</span>;
    if (v.outcome) return <span className="badge badge-success">{v.outcome.replace(/_/g, ' ')}</span>;
    if (v.checkInTime && !v.checkOutTime) return <span className="badge badge-warning">IN PROGRESS</span>;
    return <span className="badge badge-info">SCHEDULED</span>;
  };

  return (
    <CRMLayout>
      <div className="page-header">
        <div>
          <h2>Site Visits</h2>
          <p className="subtitle">{visits.length} tracked visits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visits.map(v => (
          <div key={v.id} className="card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <div className="font-bold text-slate-900">{v.lead?.name}</div>
                 <div className="text-xs text-slate-500">{v.lead?.project?.name || 'No Project'}</div>
               </div>
               {getStatusBadge(v)}
            </div>
            
            <div className="space-y-2 mb-6">
               <div className="flex items-center gap-2 text-sm text-slate-600">
                 <span>👤</span> {v.agent?.name || 'Unassigned Agent'}
               </div>
               <div className="flex items-center gap-2 text-sm text-slate-600">
                 <span>📅</span> {new Date(v.scheduledAt).toLocaleString()}
               </div>
               {v.checkInTime && (
                 <div className="text-xs text-slate-400">Checked in at {new Date(v.checkInTime).toLocaleTimeString()}</div>
               )}
            </div>

            <div className="flex gap-2">
               {!v.checkInTime && !v.outcome && (
                 <>
                   <button className="btn btn-primary btn-sm flex-1" onClick={() => handleCheckIn(v.id)}>Check In</button>
                   <button className="btn btn-secondary btn-sm" onClick={() => handleNoShow(v.id)}>No Show</button>
                 </>
               )}
               {v.checkInTime && !v.checkOutTime && (
                 <button className="btn btn-warning btn-sm w-full" onClick={() => setShowCheckout(v)}>Check Out</button>
               )}
               {v.outcome === 'NO_SHOW' && (
                 <button className="btn btn-secondary btn-sm w-full" onClick={() => router.push(`/leads/${v.leadId}`)}>Reschedule</button>
               )}
               {v.outcome && v.outcome !== 'NO_SHOW' && (
                 <button className="btn btn-secondary btn-sm w-full" onClick={() => alert(`Outcome: ${v.outcome}\n\nNotes: ${v.notes}`)}>View Feedback</button>
               )}
            </div>
          </div>
        ))}
        {visits.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 italic">No site visits scheduled.</div>
        )}
      </div>

      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: 440}}>
            <div className="modal-header">
              <h3>Visit Feedback</h3>
              {/* No close button allowed per requirement 6C - forced feedback */}
            </div>
            <p className="text-xs text-slate-400 mb-6 font-semibold uppercase tracking-wider">Required to complete checkout</p>
            <form onSubmit={handleCheckOutSubmit}>
              <div className="form-group">
                <label className="form-label">Outcome *</label>
                <div className="grid grid-cols-2 gap-2">
                   {['INTERESTED', 'BOOKED', 'NEED_MORE_TIME', 'NOT_INTERESTED', 'NO_SHOW'].map(opt => (
                     <label key={opt} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${feedback.outcome === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                       <input type="radio" value={opt} checked={feedback.outcome === opt} onChange={e => setFeedback({...feedback, outcome: e.target.value})} className="hidden" />
                       <span className="text-xs font-bold">{opt.replace(/_/g, ' ')}</span>
                     </label>
                   ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes *</label>
                <textarea className="form-textarea" required rows={3} value={feedback.notes} onChange={e => setFeedback({...feedback, notes: e.target.value})} placeholder="What did the client say?" />
              </div>
              <div className="form-group">
                <label className="form-label">Follow-up Date (Optional)</label>
                <input type="date" className="form-input" value={feedback.followUpDate} onChange={e => setFeedback({...feedback, followUpDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Lead Rating ({feedback.rating}/5)</label>
                <input type="range" min="1" max="5" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" value={feedback.rating} onChange={e => setFeedback({...feedback, rating: parseInt(e.target.value)})} />
              </div>
              <div style={{marginTop: 24}}>
                <button type="submit" className="btn btn-primary w-full py-3 shadow-lg shadow-blue-500/20" disabled={!feedback.notes}>Submit Feedback & Checkout</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
