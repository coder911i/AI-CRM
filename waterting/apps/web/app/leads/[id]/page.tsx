'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  FileText, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Plus,
  Send,
  Zap,
  Target,
  BrainCircuit,
  Quote,
  Building,
  Target as TargetIcon,
  X
} from 'lucide-react';

export default function LeadDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [showLogCall, setShowLogCall] = useState(false);
  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [callForm, setCallForm] = useState({ outcome: 'Answered & Interested', duration: 5, notes: '', followUpDate: '' });
  const [visitForm, setVisitForm] = useState({ scheduledAt: '', agentId: '', notes: '' });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) {
      api.get<any>(`/leads/${params.id}`).then(setLead).catch(() => router.push('/leads')).finally(() => setLoading(false));
    }
  }, [user, authLoading, params.id]);

  useEffect(() => {
    if (user) {
      api.get<any[]>(`/auth/users`).then(setStaff).catch(console.error);
    }
  }, [user]);

  const fetchLead = () => api.get<any>(`/leads/${params.id}`).then(setLead).catch(console.error);

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      await api.post(`/leads/${params.id}/activities`, { type: 'NOTE', title: 'Manual Note Recorded', description: noteText });
      setNoteText('');
      fetchLead();
    } catch (err: any) { alert(err.message); }
  };

  const logCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/leads/${params.id}/activities`, {
        type: 'CALL',
        title: `Communication Outbound: ${callForm.outcome}`,
        description: callForm.notes,
        metadata: { duration: callForm.duration, outcome: callForm.outcome, followUpDate: callForm.followUpDate }
      });
      setShowLogCall(false);
      fetchLead();
    } catch (err: any) { alert(err.message); }
  };

  const scheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/site-visits`, {
        leadId: params.id,
        agentId: visitForm.agentId,
        scheduledAt: new Date(visitForm.scheduledAt).toISOString(),
        notes: visitForm.notes
      });
      setShowScheduleVisit(false);
      fetchLead();
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!lead) return null;

  const whatsapp = `https://wa.me/${lead.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, I'm following up about your inquiry${lead.project?.name ? ` for ${lead.project.name}` : ''}. Are you still interested?`)}`;

  return (
    <CRMLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-2">
               <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
               Live Prospect Engagement
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lead.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-slate-400 font-medium">
               <span className="flex items-center gap-1.5 text-sm bg-slate-50 px-2 py-1 rounded border border-slate-200/50"><Phone size={14} className="text-primary" /> {lead.phone}</span>
               {lead.email && <span className="flex items-center gap-1.5 text-sm bg-slate-50 px-2 py-1 rounded border border-slate-200/50"><Mail size={14} className="text-primary" /> {lead.email}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-secondary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 border-slate-200 shadow-sm" onClick={() => setShowLogCall(true)}>
               <Phone size={14} /> Log Outbound
            </button>
            <button className="btn btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 shadow-md" onClick={() => setShowScheduleVisit(true)}>
               <MapPin size={14} /> Schedule Deployment
            </button>
            <a href={whatsapp} target="_blank" className="btn btn-success flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 shadow-sm bg-emerald-600 text-white border-0">
               <MessageSquare size={14} /> WhatsApp
            </a>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 border border-slate-200 transition-colors">
               <MoreVertical size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Metadata Profile</h3>
                 <RotateCcw size={14} className="text-slate-300 cursor-pointer hover:text-primary transition-colors" />
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Pipeline Phase</label>
                    <select 
                      className="form-select text-xs font-bold uppercase tracking-tighter h-9 bg-slate-50 border-slate-200" 
                      value={lead.stage}
                      onChange={(e) => {
                        api.patch(`/leads/${lead.id}/stage`, { stage: e.target.value })
                          .then(() => fetchLead())
                          .catch(err => alert(err.message));
                      }}
                    >
                      {['NEW_LEAD', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'NEGOTIATION', 'BOOKING_DONE', 'LOST'].map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Entity Source</label>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200 w-full justify-center">
                       <ExternalLink size={12} /> {lead.source}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-50 space-y-4 text-sm font-medium">
                   <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 text-xs flex items-center gap-2"><TargetIcon size={14} /> Intake Score</span>
                      <span className="text-primary font-black font-mono tracking-tighter">{lead.score || 0}%</span>
                   </div>
                   <div className="flex justify-between items-center group">
                      <span className="text-slate-400 text-xs flex items-center gap-2"><Building size={14} /> Assigned Project</span>
                      <span className="text-slate-900 text-xs font-bold group-hover:text-primary transition-colors">{lead.project?.name || 'Unspecified'}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs flex items-center gap-2"><Target size={14} /> Budget Scope</span>
                      <span className="text-slate-900 text-xs font-bold">{lead.budgetMin ? `₹${lead.budgetMin.toLocaleString()} – ₹${lead.budgetMax?.toLocaleString()}` : 'Not Defined'}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs flex items-center gap-2"><Clock size={14} /> Acquisition Timeline</span>
                      <span className="text-slate-900 text-xs font-bold uppercase tracking-tighter">{lead.timeline || 'TDB'}</span>
                   </div>
                </div>
              </div>
            </div>

            <AIPanels leadId={lead.id} />

            {lead.notes && (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 relative">
                <Quote className="absolute top-4 right-4 text-slate-100" size={32} strokeWidth={4} />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Initial Context</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium italic relative z-10">{lead.notes}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
               <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Plus size={16} className="text-primary" />
                     Append Intelligence Note
                  </h3>
               </div>
               <div className="p-6">
                  <div className="relative group">
                    <textarea 
                      className="form-textarea w-full h-32 text-sm font-medium border-slate-200 focus:border-primary/50 transition-all bg-white" 
                      placeholder="Identify key takeaways from recent interaction..." 
                      value={noteText} 
                      onChange={e => setNoteText(e.target.value)} 
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                       <button className="p-2 hover:bg-slate-50 text-slate-400 rounded-lg transition-colors border border-slate-100 bg-white">
                          <MoreVertical size={16} />
                       </button>
                       <button className="btn btn-primary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6" onClick={addNote}>
                          <Send size={14} /> Commit Entry
                       </button>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
               <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Clock size={16} className="text-primary" />
                     Engagement History Matrix
                  </h3>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                     Chronological Order
                  </div>
               </div>
               <div className="divide-y divide-slate-50">
                  {lead.activities?.length ? lead.activities.map((a: any) => {
                    const getIcon = () => {
                      switch(a.type) {
                        case 'CALL': return <Phone size={16} className="text-primary" />;
                        case 'EMAIL': return <Mail size={16} className="text-indigo-500" />;
                        case 'WHATSAPP': return <MessageSquare size={16} className="text-emerald-500" />;
                        case 'STAGE_CHANGE': return <RotateCcw size={16} className="text-amber-500" />;
                        case 'VISIT_SCHEDULED': return <Calendar size={16} className="text-sky-500" />;
                        case 'VISIT_COMPLETED': return <CheckCircle2 size={16} className="text-emerald-600" />;
                        case 'AI_ACTION': return <Sparkles size={16} className="text-violet-500" />;
                        case 'DOCUMENT_SHARED': return <FileText size={16} className="text-slate-500" />;
                        default: return <FileText size={16} className="text-slate-400" />;
                      }
                    };
                    
                    return (
                      <div key={a.id} className="p-6 flex gap-5 hover:bg-slate-50/40 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                          {getIcon()}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[13px] font-black text-slate-900 tracking-tight">{a.title}</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                               <Clock size={10} />
                               {new Date(a.createdAt).toLocaleDateString()} at {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {a.description && <p className="text-xs text-slate-500 leading-relaxed font-medium">{a.description}</p>}
                          {a.metadata && Object.keys(a.metadata).length > 0 && (
                            <div className="flex gap-2 flex-wrap pt-1">
                              {a.metadata.duration && <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded flex items-center gap-1"><Clock size={10} /> {a.metadata.duration}m Duration</span>}
                              {a.metadata.outcome && <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={10} /> {a.metadata.outcome}</span>}
                              {a.metadata.followUpDate && <span className="text-[9px] font-black uppercase bg-primary-light text-primary px-2 py-0.5 rounded border border-primary/20 flex items-center gap-1"><Calendar size={10} /> Follow-up {new Date(a.metadata.followUpDate).toLocaleDateString()}</span>}
                            </div>
                          )}
                          <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                             <div className="w-4 h-4 rounded-full bg-slate-200 overflow-hidden text-[8px] flex items-center justify-center font-black text-slate-600">
                                {a.user?.name ? a.user.name[0] : 'S'}
                             </div>
                             Matrix User: {a.user?.name || 'System Auto-Log'}
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="py-20 text-center space-y-4">
                       <Clock size={48} className="mx-auto text-slate-100" />
                       <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inert Data Matrix</h4>
                          <p className="text-[11px] text-slate-400 font-medium italic mt-1">No engagement activities have been registered for this entity yet.</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {showLogCall && (
        <div className="modal-overlay" onClick={() => setShowLogCall(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 450}}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <Phone size={18} className="text-primary" />
                 Authorize Call Log
              </h3>
              <button className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setShowLogCall(false)}>
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={logCall} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Outcome Status</label>
                  <select className="form-select h-10 border-slate-200 font-bold text-xs" value={callForm.outcome} onChange={e => setCallForm({...callForm, outcome: e.target.value})}>
                    {['Answered & Interested', 'Answered & Not Interested', 'No Answer', 'Busy', 'Wrong Number', 'Callback Requested'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (m)</label>
                  <input type="number" className="form-input h-10 border-slate-200" value={callForm.duration} onChange={e => setCallForm({...callForm, duration: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tactical Notes</label>
                <textarea className="form-textarea h-24 border-slate-200" value={callForm.notes} onChange={e => setCallForm({...callForm, notes: e.target.value})} placeholder="Outline meeting highlights or objections..." />
              </div>
              <div className="form-group">
                <label className="form-label">Follow-up Protocols</label>
                <input type="date" className="form-input h-10 border-slate-200" value={callForm.followUpDate} onChange={e => setCallForm({...callForm, followUpDate: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                 <button type="button" className="btn btn-secondary flex-1 font-bold uppercase text-[11px]" onClick={() => setShowLogCall(false)}>Discard</button>
                 <button type="submit" className="btn btn-primary flex-1 font-bold uppercase text-[11px]">Authorize Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleVisit && (
        <div className="modal-overlay" onClick={() => setShowScheduleVisit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 450}}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <Calendar size={18} className="text-primary" />
                 Schedule Site Deployment
              </h3>
              <button className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 border-0 bg-transparent cursor-pointer" onClick={() => setShowScheduleVisit(false)}>
                 <X size={20} />
              </button>
            </div>
            <form onSubmit={scheduleVisit} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Deployment Timestamp</label>
                <input type="datetime-local" className="form-input h-10 border-slate-200" required value={visitForm.scheduledAt} onChange={e => setVisitForm({...visitForm, scheduledAt: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Lead Custodian (Agent)</label>
                <select className="form-select h-10 border-slate-200 font-bold text-xs" required value={visitForm.agentId} onChange={e => setVisitForm({...visitForm, agentId: e.target.value})}>
                  <option value="">Select Primary Proxy</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role.split('_').slice(-1)})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Strategic Instructions</label>
                <textarea className="form-textarea h-24 border-slate-200" value={visitForm.notes} onChange={e => setVisitForm({...visitForm, notes: e.target.value})} placeholder="Identify specific requirements for this visit..." />
              </div>
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                 <button type="button" className="btn btn-secondary flex-1 font-bold uppercase text-[11px]" onClick={() => setShowScheduleVisit(false)}>Discard</button>
                 <button type="submit" className="btn btn-primary flex-1 font-bold uppercase text-[11px]">Authorize Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}

function AIPanels({ leadId }: { leadId: string }) {
  const [brief, setBrief] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>(`/leads/${leadId}/ai-brief`),
      api.get<any>(`/leads/${leadId}/ai-summary`),
      api.get<any[]>(`/leads/${leadId}/recommendations`)
    ]).then(([b, s, r]) => {
      setBrief(b);
      setSummary(s.summary);
      setRecs(r);
    }).catch(err => {
      console.warn("AI Data load incomplete", err);
    }).finally(() => setLoading(false));
  }, [leadId]);

  if (loading) return <div className="bg-white rounded-xl border border-slate-200/60 p-12 text-center text-slate-300"><RotateCcw className="mx-auto animate-spin" size={24} /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative border border-slate-800">
        <div className="absolute top-0 right-0 p-4"><BrainCircuit size={40} className="text-blue-500/10" strokeWidth={3} /></div>
        
        <div className="p-6 border-b border-slate-800 bg-slate-800/20">
           <div className="flex justify-between items-start">
             <div>
               <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-400" />
                  Neural Intelligence Matrix
               </h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">Current Confidence: {brief?.confidence || 'High'}</p>
             </div>
             <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] font-black">
                v4.8 ENGINE
             </div>
           </div>
        </div>

        <div className="p-6">
           <div className="flex items-center gap-6 mb-8 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center text-2xl font-black text-white bg-slate-900 shadow-inner">
                 {brief?.score || 95}%
              </div>
              <div>
                 <div className="text-xl font-black text-white tracking-tight uppercase leading-none">{brief?.label || 'HOT PROSPECT'}</div>
                 <div className="mt-2 h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${brief?.score || 95}%` }} />
                 </div>
              </div>
           </div>

           <div className="space-y-5">
              <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">AI Engagement Reasoning</label>
                 <p className="text-xs text-slate-300 leading-relaxed font-medium">{brief?.scoreExplanation || "User exhibits high frequency engagement patterns and specific interest in premium segments."}</p>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-lg">
                 <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5 block">Recommended Protocol</label>
                 <div className="flex items-center gap-3">
                    <Zap size={16} className="text-blue-400" />
                    <span className="text-xs font-black text-white uppercase tracking-tighter">Immediate callback required within 15m</span>
                 </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Dynamic Engagement Script</label>
                 <p className="text-xs font-bold text-slate-200 leading-relaxed italic">"{brief?.suggestedOpener || `Hello Michael, I noticed your interest in the 3BHK premium units at Baspa...`}"</p>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 relative">
         <div className="absolute top-4 right-4"><BrainCircuit size={16} className="text-primary/10" /></div>
         <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Building size={14} className="text-primary" />
            Strategic Summarization
         </h3>
         <div className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
            {summary || "Loading comprehensive entity summary..."}
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
         <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
               <TargetIcon size={14} className="text-primary" />
               Automated Recommendations
            </h3>
         </div>
         <div className="divide-y divide-slate-50">
           {recs.length > 0 ? recs.map(unit => (
             <div key={unit.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
               <div className="space-y-1">
                 <div className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-widest">{unit.unitNumber}</div>
                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{unit.type?.replace('_', ' ') || 'TYPE-X'} • ₹{(unit.totalPrice/100000).toFixed(0)}L</div>
               </div>
               <button className="text-[10px] font-black text-primary hover:bg-blue-50 px-3 py-1.5 rounded transition-all border border-blue-100 uppercase tracking-widest">
                 Issue Quote
               </button>
             </div>
           )) : (
             <div className="p-8 text-center text-[11px] text-slate-400 font-medium italic">No strategic unit matches identified.</div>
           )}
         </div>
      </div>
    </div>
  );
}
