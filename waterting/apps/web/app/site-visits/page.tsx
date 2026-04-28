'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import { 
  QrCode, 
  UserCheck, 
  CalendarClock, 
  Activity, 
  ChevronRight, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  X,
  History,
  TrendingUp,
  Star,
  MessageSquare,
  Eye
} from 'lucide-react';

export default function SiteVisitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrToken, setQrToken] = useState('');
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
    } catch (err: any) { alert(err.message); }
  };

  const handleNoShow = async (id: string) => {
    if (!confirm('Mark this visit as No Show?')) return;
    try {
      await api.patch(`/site-visits/${id}/checkout`, { outcome: 'NO_SHOW', notes: 'Client did not arrive' });
      fetchVisits();
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
    } catch (err: any) { alert(err.message); }
  };

  const handleQrCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrToken) return;
    try {
      await api.patch('/site-visits/qr-checkin', { token: qrToken });
      setShowQrModal(false);
      setQrToken('');
      fetchVisits();
    } catch (err: any) { alert(err.message || 'Invalid token'); }
  };

  if (authLoading || loading) return (
    <CRMLayout>
      <div className="p-8 space-y-8 bg-[var(--bg-primary)] min-h-screen">
        <div className="h-12 w-64 animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 animate-pulse bg-[var(--bg-elevated)] border border-[var(--border)]"></div>)}
        </div>
      </div>
    </CRMLayout>
  );

  const getStatusBadge = (v: any) => {
    if (v.outcome === 'NO_SHOW') return <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)] italic">NO_SHOW_DETECTION</span>;
    if (v.outcome) return <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)] italic">{v.outcome.replace(/_/g, ' ')}</span>;
    if (v.checkInTime && !v.checkOutTime) return <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)] animate-pulse italic">PHASE_IN_PROGRESS</span>;
    return <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] italic">PROTOCOL_SCHEDULED</span>;
  };

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-8 min-h-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-4 border-[var(--border)]">
           <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-3">
                 <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                 Operational Logistics Core
              </div>
              <h1 className="text-[24px] font-black text-[var(--text-primary)] uppercase tracking-tight italic flex items-center gap-4">
                 <MapPin size={24} className="text-[var(--accent)]" />
                 Occupancy Deployment Ledger
              </h1>
              <p className="text-[var(--text-secondary)] text-[11px] font-bold uppercase mt-2 italic">Monitoring {visits.length} active synchronization protocols in real-time</p>
           </div>
           <button className="px-8 py-4 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[var(--accent)] transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_var(--accent-light)] italic" onClick={() => setShowQrModal(true)}>
              <QrCode size={18} /> INITIALIZE SCAN PROTOCOL
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visits.map(v => (
            <div key={v.id} className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[6px_6px_0px_0px_var(--border)] group">
               <div className="p-4 border-b-2 border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase font-mono tracking-tighter">REF_LOG_VS-{v.id.slice(-6).toUpperCase()}</span>
                  </div>
                  {getStatusBadge(v)}
               </div>
               
               <div className="p-6 space-y-8">
                  <div>
                    <h3 className="text-[18px] font-black text-[var(--text-primary)] uppercase group-hover:text-[var(--accent)] transition-colors italic leading-none">{v.lead?.name}</h3>
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mt-2 flex items-center gap-1.5 italic">
                       <Building size={12} /> {v.lead?.project?.name || 'CENTRAL_ASSET_MATRIX'}
                    </p>
                  </div>

                  <div className="space-y-4 border-l-2 border-[var(--accent-light)] pl-4">
                     <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">
                        <UserCheck size={16} className="text-[var(--accent)]" />
                        Custodian: {v.agent?.name || 'UNASSIGNED_PROXY'}
                     </div>
                     <div className="flex items-center gap-3 text-[12px] font-black text-[var(--text-primary)] uppercase">
                        <CalendarClock size={16} className="text-[var(--accent)]" />
                        <span className="font-mono tracking-tighter bg-[var(--bg-elevated)] px-2 py-1">{new Date(v.scheduledAt).toLocaleString().toUpperCase()}</span>
                     </div>
                     {v.checkInTime && (
                       <div className="flex items-center gap-2 text-[10px] font-black text-[var(--success)] uppercase border-2 border-[var(--success)] bg-[var(--success-bg)] px-3 py-1.5 italic">
                          <CheckCircle2 size={12} /> INITIALIZED: {new Date(v.checkInTime).toLocaleTimeString().toUpperCase()}
                       </div>
                     )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border)] border-dashed">
                     {!v.checkInTime && !v.outcome && (
                       <>
                         <button className="w-full py-4 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all italic" onClick={() => handleCheckIn(v.id)}>MANUAL_INITIALIZE</button>
                         <button className="w-full py-3 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] hover:border-[var(--danger)] transition-all italic" onClick={() => handleNoShow(v.id)}>LOG_VOID_ENTRY</button>
                       </>
                     )}
                     {v.checkInTime && !v.checkOutTime && (
                       <button className="w-full py-4 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all italic" onClick={() => setShowCheckout(v)}>CONCLUDE_PROTOCOL</button>
                     )}
                     {v.outcome === 'NO_SHOW' && (
                       <button className="w-full py-4 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--bg-elevated)] transition-all flex items-center justify-center gap-3 italic" onClick={() => router.push(`/leads/${v.leadId}`)}>
                          PHASE_RESCHEDULE <ChevronRight size={14} />
                       </button>
                     )}
                     {v.outcome && v.outcome !== 'NO_SHOW' && (
                       <button className="w-full py-4 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--bg-elevated)] transition-all flex items-center justify-center gap-3 italic" onClick={() => alert(`Outcome: ${v.outcome}\n\nNotes: ${v.notes}`)}>
                          INTELLIGENCE_AUDIT <Eye size={14} />
                       </button>
                     )}
                  </div>
               </div>
            </div>
          ))}
          
          {visits.length === 0 && (
            <div className="col-span-full py-48 text-center bg-[var(--bg-surface)] border-4 border-dashed border-[var(--border)] flex flex-col items-center gap-6">
               <div className="w-20 h-20 bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] border-2 border-[var(--border)]">
                  <Activity size={40} />
               </div>
               <div>
                  <h4 className="text-[16px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">LOGISTIC_VOID_DETECTED</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] font-bold uppercase mt-2 italic max-w-[300px] mx-auto opacity-60">No operational deployment protocols currently indexed in matrix.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowQrModal(false)}>
          <div className="bg-[var(--bg-surface)] w-full max-w-md border-4 border-[var(--border)] shadow-[10px_10px_0px_0px_var(--border)] overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="px-8 py-6 border-b-4 border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
               <div>
                  <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Authorized Entry Matrix</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-1 tracking-tighter">Physical Verification Protocol [VER_9.4]</p>
               </div>
               <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" onClick={() => setShowQrModal(false)}>
                  <X size={24} />
               </button>
            </div>
            
            <form onSubmit={handleQrCheckIn} className="p-8 space-y-8">
               <div className="bg-[var(--accent-light)] border border-[var(--accent)] p-4 text-[11px] text-[var(--accent)] font-bold uppercase leading-relaxed italic border-l-4">
                  Input the digital verification hash from the client portal to initialize occupancy synchronization.
               </div>
               <div className="space-y-3">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                     Protocol Hash
                  </label>
                  <div className="relative">
                     <QrCode size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                     <input autoFocus className="w-full pl-14 pr-6 py-5 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[16px] font-black text-[var(--text-primary)] focus:border-[var(--accent)] outline-none font-mono placeholder:text-[var(--text-muted)] uppercase italic" value={qrToken} onChange={e => setQrToken(e.target.value)} placeholder="000-XXX-000" />
                  </div>
               </div>
               <button type="submit" className="w-full py-5 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[12px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-[var(--accent)] transition-all italic shadow-[4px_4px_0px_0px_var(--accent-light)]">
                  AUTHORIZE PHYSICAL ENTRY
               </button>
            </form>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCheckout(null)}>
          <div className="bg-[var(--bg-surface)] w-full max-w-lg border-4 border-[var(--border)] shadow-[10px_10px_0px_0px_var(--border)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b-4 border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
               <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Mission De-Brief Intelligence</h3>
               <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" onClick={() => setShowCheckout(null)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCheckOutSubmit} className="p-8 space-y-10">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                   Acquisition Trajectory
                </label>
                <div className="grid grid-cols-2 gap-3">
                   {['INTERESTED', 'BOOKED', 'NEED_MORE_TIME', 'NOT_INTERESTED', 'NO_SHOW'].map(opt => (
                     <label key={opt} className={`flex items-center justify-center p-4 border-2 cursor-pointer transition-all ${
                        feedback.outcome === opt 
                        ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] shadow-[3px_3px_0px_0px_var(--accent)]' 
                        : 'border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                     }`}>
                       <input type="radio" value={opt} checked={feedback.outcome === opt} onChange={e => setFeedback({...feedback, outcome: e.target.value})} className="hidden" />
                       <span className="text-[10px] font-black uppercase text-center tracking-tighter">{opt.replace(/_/g, ' ')}</span>
                     </label>
                   ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                   Tactical Observations
                </label>
                <textarea className="w-full px-5 py-4 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none uppercase italic placeholder:text-[var(--text-muted)]" required rows={4} value={feedback.notes} onChange={e => setFeedback({...feedback, notes: e.target.value})} placeholder="Input critical mission signals..." />
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-[var(--border)]" />
                       Follow-Up Offset
                    </label>
                    <input type="date" className="w-full px-5 py-3 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[12px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase" value={feedback.followUpDate} onChange={e => setFeedback({...feedback, followUpDate: e.target.value})} />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-[var(--border)]" />
                       Intensity Index ({feedback.rating}.0)
                    </label>
                    <div className="flex items-center gap-6 h-[46px] bg-[var(--bg-elevated)] border-2 border-[var(--border)] px-4">
                       <input type="range" min="1" max="5" className="flex-1 h-2 bg-[var(--bg-primary)] appearance-none cursor-pointer accent-[var(--accent)] border border-[var(--border)]" value={feedback.rating} onChange={e => setFeedback({...feedback, rating: parseInt(e.target.value)})} />
                       <span className="text-[14px] font-black text-[var(--text-primary)] font-mono italic">{feedback.rating}.0</span>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t-2 border-[var(--border)]">
                <button type="submit" className="w-full py-5 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[13px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-[var(--accent)] transition-all italic shadow-[6px_6px_0px_0px_var(--accent-light)]" disabled={!feedback.notes}>
                   FINALIZE MISSION INTELLIGENCE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
