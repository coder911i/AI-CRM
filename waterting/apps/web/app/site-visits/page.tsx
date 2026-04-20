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

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;

  const getStatusBadge = (v: any) => {
    if (v.outcome === 'NO_SHOW') return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border bg-rose-50 text-rose-600 border-rose-100">NO SHOW</span>;
    if (v.outcome) return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">{v.outcome.replace(/_/g, ' ')}</span>;
    if (v.checkInTime && !v.checkOutTime) return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border bg-amber-50 text-amber-600 border-amber-100 animate-pulse">IN PROGRESS</span>;
    return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border bg-slate-50 text-slate-500 border-slate-100">SCHEDULED</span>;
  };

  return (
    <CRMLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                 <MapPin size={28} className="text-primary" />
                 Operational Logistics
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Real-time tracking of {visits.length} scheduled occupancy visits</p>
           </div>
           <button className="btn btn-primary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 shadow-xl shadow-primary/20" onClick={() => setShowQrModal(true)}>
              <QrCode size={16} /> Scan Protocol Hash
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visits.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
               <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-primary" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">VS-{v.id.slice(-6)}</span>
                  </div>
                  {getStatusBadge(v)}
               </div>
               
               <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors">{v.lead?.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5 flex items-center gap-1">
                       <MapPin size={10} /> {v.lead?.project?.name || 'GENERIC_INVENTORY'}
                    </p>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        <UserCheck size={14} className="text-slate-300" />
                        {v.agent?.name || 'UNASSIGNED_LOGISTICIAN'}
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        <CalendarClock size={14} className="text-slate-300" />
                        <span className="font-mono text-slate-900">{new Date(v.scheduledAt).toLocaleString()}</span>
                     </div>
                     {v.checkInTime && (
                       <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter bg-emerald-50 px-2 py-1 rounded">
                          <CheckCircle2 size={10} /> Initialized: {new Date(v.checkInTime).toLocaleTimeString()}
                       </div>
                     )}
                  </div>

                  <div className="flex gap-2 pt-2">
                     {!v.checkInTime && !v.outcome && (
                       <>
                         <button className="flex-1 btn btn-primary py-2.5 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/10" onClick={() => handleCheckIn(v.id)}>Manual Check-In</button>
                         <button className="btn btn-secondary py-2.5 px-3 text-[9px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity" onClick={() => handleNoShow(v.id)}>No-Show</button>
                       </>
                     )}
                     {v.checkInTime && !v.checkOutTime && (
                       <button className="w-full btn btn-primary py-2.5 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={() => setShowCheckout(v)}>Conclude Visit</button>
                     )}
                     {v.outcome === 'NO_SHOW' && (
                       <button className="w-full btn btn-secondary py-2.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2" onClick={() => router.push(`/leads/${v.leadId}`)}>
                          Reschedule Outcome <ChevronRight size={12} />
                       </button>
                     )}
                     {v.outcome && v.outcome !== 'NO_SHOW' && (
                       <button className="w-full btn btn-secondary py-2.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-primary/5 group-hover:text-primary transition-all" onClick={() => alert(`Outcome: ${v.outcome}\n\nNotes: ${v.notes}`)}>
                          View Intelligence <Eye size={12} />
                       </button>
                     )}
                  </div>
               </div>
            </div>
          ))}
          
          {visits.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner flex flex-col items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                  <Activity size={32} />
               </div>
               <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Logistic Void</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter max-w-[220px] mx-auto mt-1">No operational site visits discovered in current synchronization cycle.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Authorized Entry</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Physical Verification Protocol</p>
               </div>
               <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400" onClick={() => setShowQrModal(false)}>
                  <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleQrCheckIn} className="p-8 space-y-6">
               <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter leading-relaxed">Input the digital verification hash from the client's asset portal to initialize the structural visit.</p>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Hash</label>
                  <div className="relative">
                     <QrCode size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                     <input autoFocus className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/10 transition-all font-mono placeholder:text-slate-200" value={qrToken} onChange={e => setQrToken(e.target.value)} placeholder="000-XXX-000" />
                  </div>
               </div>
               <button type="submit" className="w-full btn btn-primary py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                  AUTHORIZE PHYSICAL ENTRY
               </button>
            </form>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-900">
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Post-Visit Intelligence</h3>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5 italic">Structural feedback required for conclusion</p>
            </div>
            
            <form onSubmit={handleCheckOutSubmit} className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <TrendingUp size={12} /> Acquisition Trajectory *
                </label>
                <div className="grid grid-cols-2 gap-2">
                   {['INTERESTED', 'BOOKED', 'NEED_MORE_TIME', 'NOT_INTERESTED', 'NO_SHOW'].map(opt => (
                     <label key={opt} className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
                        feedback.outcome === opt 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600'
                     }`}>
                       <input type="radio" value={opt} checked={feedback.outcome === opt} onChange={e => setFeedback({...feedback, outcome: e.target.value})} className="hidden" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-center leading-none">{opt.replace(/_/g, ' ')}</span>
                     </label>
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <MessageSquare size={12} /> Strategic Observations *
                </label>
                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all font-sans placeholder:text-slate-200" required rows={3} value={feedback.notes} onChange={e => setFeedback({...feedback, notes: e.target.value})} placeholder="Input key verbal signals and resistance markers..." />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <History size={12} /> Follow-Up Offset
                    </label>
                    <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black focus:ring-2 focus:ring-primary/10 transition-all uppercase" value={feedback.followUpDate} onChange={e => setFeedback({...feedback, followUpDate: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Star size={12} /> Lead Potency ({feedback.rating}/5)
                    </label>
                    <div className="flex items-center gap-4 h-[46px]">
                       <input type="range" min="1" max="5" className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" value={feedback.rating} onChange={e => setFeedback({...feedback, rating: parseInt(e.target.value)})} />
                       <span className="text-sm font-black text-slate-900 font-mono">{feedback.rating}.0</span>
                    </div>
                 </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <button type="submit" className="w-full btn btn-primary py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={!feedback.notes}>
                   FINALIZE VISIT INTELLIGENCE
                </button>
                <p className="text-[8px] text-slate-300 font-bold text-center mt-4 uppercase tracking-tighter">DATA WILL BE SYNCHRONIZED WITH LEAD TIMELINE IMMEDIATELY</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
