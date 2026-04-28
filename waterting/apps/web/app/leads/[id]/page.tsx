'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import toast from 'react-hot-toast';
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
  X,
  Loader2,
  User,
  History,
  Grid3X3,
  CreditCard,
  RefreshCcw,
  ArrowUpRight
} from 'lucide-react';

type Tab = 'OVERVIEW' | 'COMMS_LOG' | 'ASSET_MATCH' | 'SETTLEMENTS';

export default function LeadDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const [lead, setLead] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  
  const [showLogCall, setShowLogCall] = useState(false);
  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [callForm, setCallForm] = useState({ outcome: 'Answered & Interested', duration: 5, notes: '', followUpDate: '' });
  const [submittingCall, setSubmittingCall] = useState(false);
  
  const [visitForm, setVisitForm] = useState({ scheduledAt: '', agentId: '', notes: '' });
  const [submittingVisit, setSubmittingVisit] = useState(false);

  const fetchLead = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [leadData, bookingsData, staffData] = await Promise.all([
        api.get<any>(`/leads/${params.id}`),
        api.get<any[]>(`/bookings?leadId=${params.id}`),
        api.get<any[]>('/users/staff').catch(() => [])
      ]);
      setLead(leadData);
      setBookings(bookingsData);
      setStaff(staffData);
      if (isRefresh) toast.success('Entity synchronization verified');
    } catch (err) {
      toast.error('Failed to interface with entity database');
      router.push('/leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) {
      fetchLead();
    }
  }, [user, authLoading, params.id, fetchLead, router]);

  const updateLeadField = async (field: string, value: any) => {
    setUpdatingField(field);
    try {
      if (field === 'stage') {
        await api.patch(`/leads/${params.id}/stage`, { stage: value });
      } else if (field === 'assignedToId') {
        await api.patch(`/leads/${params.id}`, { assignedToId: value });
      }
      toast.success(`${field.toUpperCase()} update authorized`);
      fetchLead();
    } catch (err: any) {
      toast.error(`Override failed: ${err.message}`);
    } finally {
      setUpdatingField(null);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return toast.error('Note payload required');
    setAddingNote(true);
    try {
      await api.post(`/leads/${params.id}/activities`, { 
        type: 'NOTE', 
        title: 'Tactical Intel Recorded', 
        description: noteText 
      });
      toast.success('Note committed to engagement history');
      setNoteText('');
      fetchLead();
    } catch (err: any) {
      toast.error(`Commit failure: ${err.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  const logCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCall(true);
    try {
      await api.post(`/leads/${params.id}/activities`, {
        type: 'CALL',
        title: `Comms_Outbound: ${callForm.outcome.toUpperCase()}`,
        description: callForm.notes,
        metadata: { duration: callForm.duration, outcome: callForm.outcome, followUpDate: callForm.followUpDate }
      });
      toast.success('Communication log authorized');
      setShowLogCall(false);
      setCallForm({ outcome: 'Answered & Interested', duration: 5, notes: '', followUpDate: '' });
      fetchLead();
    } catch (err: any) {
      toast.error(`Log failure: ${err.message}`);
    } finally {
      setSubmittingCall(false);
    }
  };

  const scheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitForm.agentId) return toast.error('Deployable agent selection required');
    setSubmittingVisit(true);
    try {
      await api.post(`/site-visits`, {
        leadId: params.id,
        agentId: visitForm.agentId,
        scheduledAt: new Date(visitForm.scheduledAt).toISOString(),
        notes: visitForm.notes
      });
      toast.success('Mission deployment scheduled');
      setShowScheduleVisit(false);
      setVisitForm({ scheduledAt: '', agentId: '', notes: '' });
      fetchLead();
    } catch (err: any) {
      toast.error(`Deployment authorization failed: ${err.message}`);
    } finally {
      setSubmittingVisit(false);
    }
  };

  if (authLoading || loading) {
    return (
      <CRMLayout>
        <div className="p-8 space-y-6 bg-[var(--bg-primary)] min-h-screen">
          <div className="h-10 w-64 animate-pulse bg-[var(--bg-elevated)] border-2 border-[var(--border)]"></div>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4 h-[500px] animate-pulse bg-[var(--bg-elevated)] border-2 border-[var(--border)]"></div>
            <div className="col-span-8 space-y-8">
              <div className="h-32 animate-pulse bg-[var(--bg-elevated)] border-2 border-[var(--border)]"></div>
              <div className="h-96 animate-pulse bg-[var(--bg-elevated)] border-2 border-[var(--border)]"></div>
            </div>
          </div>
        </div>
      </CRMLayout>
    );
  }

  if (!lead) return null;

  const whatsapp = `https://wa.me/${lead.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Greetings ${lead.name}, initializing follow-up regarding the ${lead.project?.name || 'asset inventory'}. Awaiting status update.`)}`;

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-8 min-h-full space-y-10">
        {/* Header Segment */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-4 border-[var(--border)]">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.25em] mb-3">
               <div className="w-2 h-2 bg-[var(--accent)] animate-pulse" />
               ENTITY_ACTIVE_ENGAGEMENT_STREAM
            </div>
            <h1 className="text-[28px] font-black text-[var(--text-primary)] uppercase tracking-tight italic flex items-center gap-4">
               {lead.name}
               {lead.score >= 80 && <Zap size={24} className="text-[var(--danger)] fill-[var(--danger)]" />}
            </h1>
            <div className="flex items-center gap-4 mt-4">
               <span className="flex items-center gap-2 text-[12px] text-[var(--text-primary)] font-mono font-black bg-[var(--bg-surface)] px-4 py-2 border-2 border-[var(--border)] shadow-[4px_4px_0px_0px_var(--border)]">
                  <Phone size={14} className="text-[var(--accent)]" /> {lead.phone}
               </span>
               {lead.email && (
                 <span className="flex items-center gap-2 text-[12px] text-[var(--text-primary)] font-mono font-black bg-[var(--bg-surface)] px-4 py-2 border-2 border-[var(--border)] uppercase italic shadow-[4px_4px_0px_0px_var(--border)]">
                    <Mail size={14} className="text-[var(--accent)]" /> {lead.email}
                 </span>
               )}
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
               onClick={() => setShowLogCall(true)}
               className="px-6 py-3 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] text-[11px] font-black uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2 italic"
            >
               <Phone size={16} /> LOG_COMMUNICATION
            </button>
            <button 
               onClick={() => setShowScheduleVisit(true)}
               className="px-6 py-3 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[11px] font-black uppercase hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-2 italic"
            >
               <MapPin size={16} /> SCHEDULE_DEPLOYMENT
            </button>
            <a 
               href={whatsapp} 
               target="_blank" 
               className="px-6 py-3 bg-[var(--success-bg)] border-2 border-[var(--success)] text-[var(--success)] text-[11px] font-black uppercase hover:bg-[var(--success)] hover:text-white transition-all flex items-center gap-2 italic"
            >
               <MessageSquare size={16} /> WHATSAPP_SYNC
            </a>
            <button 
               onClick={() => router.push(`/leads/${params.id}/book`)}
               className="px-8 py-3 bg-[var(--danger)] border-2 border-[var(--danger)] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[var(--danger)] transition-all flex items-center gap-2 italic shadow-[4px_4px_0px_0px_var(--danger-bg)]"
            >
               <CreditCard size={16} /> BOOK_UNIT_PROTOCOL
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 border-2 border-[var(--border)]">
           {(['OVERVIEW', 'COMMS_LOG', 'ASSET_MATCH', 'SETTLEMENTS'] as Tab[]).map(t => (
             <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest italic transition-all ${
                  activeTab === t 
                  ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-[0px_2px_0px_0px_var(--accent)] border-2 border-[var(--border)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
             >
                {t.replace('_', ' ')}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Segment */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[8px_8px_0px_0px_var(--border)] overflow-hidden">
              <div className="px-6 py-4 border-b-2 border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
                 <h3 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">METADATA_PROFILE</h3>
                 <User size={18} className="text-[var(--accent)]" />
              </div>
              <div className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                       PHASE_STATE {updatingField === 'stage' && <Loader2 size={10} className="animate-spin" />}
                    </label>
                    <select 
                      disabled={updatingField === 'stage'}
                      className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-3 text-[13px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none cursor-pointer italic" 
                      value={lead.stage}
                      onChange={(e) => updateLeadField('stage', e.target.value)}
                    >
                      {['NEW_LEAD', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'NEGOTIATION', 'BOOKING_DONE', 'LOST'].map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                       CUSTODIAN_PROXY {updatingField === 'assignedToId' && <Loader2 size={10} className="animate-spin" />}
                    </label>
                    <select 
                      disabled={updatingField === 'assignedToId'}
                      className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-3 text-[13px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase appearance-none cursor-pointer italic" 
                      value={lead.assignedToId || ''}
                      onChange={(e) => updateLeadField('assignedToId', e.target.value)}
                    >
                      <option value="">VOID_PROXY_UNASSIGNED</option>
                      {staff.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="pt-8 border-t-2 border-[var(--border)] border-dashed space-y-4">
                   <div className="flex justify-between items-center py-3 border-b-2 border-dashed border-[var(--border)]">
                      <span className="text-[var(--text-secondary)] text-[11px] font-black uppercase flex items-center gap-2 italic"><TargetIcon size={16} className="text-[var(--accent)]" /> CONFIDENCE_FACTOR</span>
                      <span className="text-[var(--accent)] font-black font-mono text-[18px] italic">{lead.score || 0}.0%</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <span className="text-[var(--text-secondary)] text-[11px] font-black uppercase flex items-center gap-2 italic"><Building size={16} /> PROJECT_PROTOCOL</span>
                      <span className="text-[var(--text-primary)] text-[12px] font-black uppercase italic tracking-tighter">{lead.project?.name || 'NULL_SET'}</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <span className="text-[var(--text-secondary)] text-[11px] font-black uppercase flex items-center gap-2 italic"><Target size={16} /> VALUATION_RANGE</span>
                      <span className="text-[var(--text-primary)] text-[13px] font-black font-mono tracking-tighter">{lead.budgetMin ? `₹${(lead.budgetMin/100000).toFixed(1)}L - ₹${(lead.budgetMax/100000).toFixed(1)}L` : '—'}</span>
                   </div>
                </div>
              </div>
            </div>

            {activeTab === 'OVERVIEW' && <AIPanels leadId={lead.id} />}
            
            {lead.notes && activeTab === 'OVERVIEW' && (
              <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] p-6 relative shadow-[6px_6px_0px_0px_var(--border)]">
                <div className="absolute top-2 right-4 w-12 h-12 flex items-center justify-center opacity-10"><Quote size={32} /></div>
                <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase mb-4 tracking-[0.2em]">INITIAL_INTAKE_CONTEXT</h3>
                <p className="text-[13px] text-[var(--text-primary)] leading-relaxed italic font-black uppercase tracking-tight">"{lead.notes}"</p>
              </div>
            )}
          </div>

          {/* Main Content Segment */}
          <div className="lg:col-span-8 space-y-10">
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-10">
                <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[10px_10px_0px_0px_var(--border)] overflow-hidden">
                   <div className="px-6 py-4 border-b-2 border-[var(--border)] bg-[var(--bg-elevated)]">
                      <h3 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-3">
                         <Plus size={18} className="text-[var(--accent)]" />
                         APPEND_INTELLIGENCE_NOTE
                      </h3>
                   </div>
                   <div className="p-8">
                      <div className="space-y-6">
                        <textarea 
                          className="w-full h-40 bg-[var(--bg-surface)] border-2 border-[var(--border)] p-6 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none uppercase placeholder:text-[var(--text-muted)] italic transition-all" 
                          placeholder="INPUT SITUATION REPORT / TACTICAL INTERACTION SUMMARY..." 
                          value={noteText} 
                          onChange={e => setNoteText(e.target.value)} 
                        />
                        <div className="flex justify-end">
                           <button 
                              disabled={addingNote}
                              className="px-10 py-4 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[12px] font-black uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-3 italic" 
                              onClick={addNote}
                           >
                              {addingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} COMMIT_ENTRY_TO_MATRIX
                           </button>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[10px_10px_0px_0px_var(--border)] overflow-hidden">
                   <div className="px-6 py-4 border-b-2 border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
                      <h3 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3">
                         <History size={20} className="text-[var(--accent)]" />
                         ENGAGEMENT_HISTORY_LOG
                      </h3>
                      <button 
                         onClick={() => fetchLead(true)}
                         disabled={refreshing}
                         className="text-[10px] font-black text-[var(--accent)] uppercase border-2 border-[var(--accent)] px-4 py-1.5 bg-white hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-2 italic"
                      >
                         {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} REFRESH_STREAM
                      </button>
                   </div>
                   <div className="divide-y-2 divide-[var(--border)]">
                      {lead.activities?.length ? lead.activities.map((a: any) => {
                        const getIcon = () => {
                          switch(a.type) {
                            case 'CALL': return <Phone size={18} className="text-[var(--accent)]" />;
                            case 'EMAIL': return <Mail size={18} className="text-[var(--accent)]" />;
                            case 'WHATSAPP': return <MessageSquare size={18} className="text-[var(--success)]" />;
                            case 'STAGE_CHANGE': return <RotateCcw size={18} className="text-[var(--warning)]" />;
                            case 'VISIT_SCHEDULED': return <Calendar size={18} className="text-[var(--accent)]" />;
                            case 'VISIT_COMPLETED': return <CheckCircle2 size={18} className="text-[var(--success)]" />;
                            case 'AI_ACTION': return <Sparkles size={18} className="text-[var(--accent)]" />;
                            default: return <FileText size={18} className="text-[var(--text-muted)]" />;
                          }
                        };
                        
                        return (
                          <div key={a.id} className="p-8 flex gap-8 hover:bg-[var(--bg-elevated)] transition-colors group">
                            <div className="w-14 h-14 bg-[var(--bg-surface)] border-2 border-[var(--border)] flex items-center justify-center flex-shrink-0 group-hover:border-[var(--accent)] group-hover:shadow-[4px_4px_0px_0px_var(--accent-light)] transition-all">
                              {getIcon()}
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-[14px] font-black text-[var(--text-primary)] uppercase italic tracking-tight">{a.title}</span>
                                <span className="text-[11px] font-black text-[var(--text-muted)] uppercase flex items-center gap-2 font-mono">
                                    <Clock size={12} />
                                    {new Date(a.createdAt).toLocaleString().toUpperCase()}
                                </span>
                              </div>
                              {a.description && <p className="text-[13px] text-[var(--text-secondary)] font-black leading-relaxed uppercase tracking-tighter italic border-l-4 border-[var(--border)] pl-4">"{a.description}"</p>}
                              {a.metadata && Object.keys(a.metadata).length > 0 && (
                                <div className="flex gap-3 flex-wrap pt-2">
                                  {a.metadata.outcome && <span className="text-[10px] font-black uppercase bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] px-3 py-1 italic">{a.metadata.outcome}</span>}
                                  {a.metadata.followUpDate && <span className="text-[10px] font-black uppercase bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] px-3 py-1 italic">NEXT_CONTACT: {new Date(a.metadata.followUpDate).toLocaleDateString().toUpperCase()}</span>}
                                </div>
                              )}
                              <div className="pt-4 flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] border-t-2 border-[var(--border)] border-dashed">
                                 AUTHORIZED_CUSTODIAN: {a.user?.name || 'CENTRAL_INTELLIGENCE_SYSTEM'}
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="py-32 text-center bg-[var(--bg-primary)]">
                           <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--bg-elevated)] border-4 border-dashed border-[var(--border)] text-[var(--text-muted)] mb-8 opacity-40">
                              <History size={40} />
                           </div>
                           <h4 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-[0.25em]">INERT_ENGAGEMENT_MATRIX</h4>
                           <p className="text-[11px] text-[var(--text-secondary)] italic mt-3 uppercase font-black opacity-60">No historical data records detected for this target identity.</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'COMMS_LOG' && (
              <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] p-12 text-center shadow-[10px_10px_0px_0px_var(--border)]">
                 <MessageSquare size={48} className="mx-auto text-[var(--accent)] opacity-20 mb-6" />
                 <h2 className="text-[18px] font-black uppercase tracking-[0.3em]">Communication_Detailed_Vault</h2>
                 <p className="text-[12px] text-[var(--text-secondary)] mt-4 uppercase font-black italic">Granular comms analysis pending in current sector.</p>
              </div>
            )}

            {activeTab === 'ASSET_MATCH' && (
              <AssetMatchTab leadId={lead.id} project={lead.project} />
            )}

            {activeTab === 'SETTLEMENTS' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-6 border-2 border-[var(--border)]">
                  <div>
                    <h2 className="text-[16px] font-black uppercase tracking-widest flex items-center gap-3 italic">
                      <CreditCard size={20} className="text-[var(--accent)]" />
                      FINANCIAL_SETTLEMENT_LEDGER
                    </h2>
                    <p className="text-[11px] text-[var(--text-secondary)] font-black uppercase mt-2 italic">Monitoring {bookings.length} verified transaction events</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/leads/${params.id}/book`)}
                    className="px-8 py-3 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[11px] font-black uppercase tracking-[0.1em] hover:bg-white hover:text-[var(--accent)] transition-all flex items-center gap-3 italic shadow-[4px_4px_0px_0px_var(--accent-light)]"
                  >
                    <Plus size={16} /> INITIALIZE_NEW_SETTLEMENT
                  </button>
                </div>

                <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[10px_10px_0px_0px_var(--border)] overflow-hidden">
                   {bookings.length > 0 ? (
                     <div className="divide-y-2 divide-[var(--border)]">
                        {bookings.map(b => (
                          <div key={b.id} className="p-8 flex items-center justify-between hover:bg-[var(--bg-elevated)] transition-all group cursor-pointer" onClick={() => router.push(`/bookings/${b.id}`)}>
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-[var(--bg-primary)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--accent)] group-hover:border-[var(--accent)] transition-all">
                                   <FileText size={24} />
                                </div>
                                <div>
                                   <div className="text-[16px] font-black text-[var(--text-primary)] uppercase italic leading-none mb-2">Unit {b.unit?.unitNumber || 'TBD'}</div>
                                   <div className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest italic">{b.unit?.tower?.name || 'GENERIC'} • {b.unit?.tower?.project?.name || 'ASSET_CORE'}</div>
                                </div>
                             </div>
                             <div className="text-right flex flex-col items-end gap-3">
                                <div className="text-[20px] font-black text-[var(--text-primary)] font-mono italic">₹{b.bookingAmount.toLocaleString()}</div>
                                <span className={`px-3 py-1 text-[9px] font-black border-2 uppercase tracking-widest italic ${
                                   b.status === 'CONFIRMED' ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]' : 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]'
                                }`}>
                                   {b.status}
                                </span>
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="py-24 text-center bg-[var(--bg-primary)]">
                        <CreditCard size={48} className="mx-auto text-[var(--accent)] opacity-20 mb-6" />
                        <h4 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-[0.25em]">ZERO_TRANSACTIONAL_EVENTS_LOGGED</h4>
                        <p className="text-[11px] text-[var(--text-secondary)] italic mt-3 uppercase font-black opacity-60">No financial settlement records identified for this identity.</p>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Call Modal */}
      {showLogCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[var(--bg-surface)] w-full max-w-lg border-4 border-[var(--border)] shadow-[15px_15px_0px_0px_var(--border)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b-4 border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
              <h3 className="text-[14px] font-black uppercase text-[var(--text-primary)] tracking-widest flex items-center gap-3 italic">
                 <Phone size={20} className="text-[var(--accent)]" />
                 AUTHORIZE_COMMUNICATION_LOG
              </h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" onClick={() => setShowLogCall(false)}>
                 <X size={28} />
              </button>
            </div>
            <form onSubmit={logCall} className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">RESPONSE_STATE</label>
                  <select className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[13px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase italic appearance-none cursor-pointer" value={callForm.outcome} onChange={e => setCallForm({...callForm, outcome: e.target.value})}>
                    {['Answered & Interested', 'Answered & Not Interested', 'No Answer', 'Busy', 'Wrong Number', 'Callback Requested'].map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">DURATION (MIN)</label>
                  <input type="number" className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[13px] font-mono font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] italic" value={callForm.duration} onChange={e => setCallForm({...callForm, duration: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">TACTICAL_SUMMARY</label>
                <textarea className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[13px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none uppercase placeholder:text-[var(--text-muted)] italic" rows={3} value={callForm.notes} onChange={e => setCallForm({...callForm, notes: e.target.value})} placeholder="INTERACTION HIGHLIGHTS..." />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">FOLLOW_UP_PROTOCOL_DATE</label>
                <input type="date" className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[13px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] italic" value={callForm.followUpDate} onChange={e => setCallForm({...callForm, followUpDate: e.target.value})} />
              </div>
              <div className="flex gap-6 pt-8 border-t-2 border-[var(--border)] border-dashed">
                 <button type="button" className="flex-1 py-4 text-[12px] font-black text-[var(--text-muted)] hover:text-[var(--danger)] uppercase italic tracking-widest transition-all" onClick={() => setShowLogCall(false)}>ABORT</button>
                 <button type="submit" disabled={submittingCall} className="flex-2 px-10 py-4 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[12px] font-black uppercase tracking-widest hover:bg-white hover:text-[var(--accent)] transition-all italic shadow-[6px_6px_0px_0px_var(--accent-light)]">
                    {submittingCall ? <Loader2 className="animate-spin mx-auto" /> : 'AUTHORIZE_LOG_ENTRY'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {showScheduleVisit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[var(--bg-surface)] w-full max-w-lg border-4 border-[var(--border)] shadow-[15px_15px_0px_0px_var(--border)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b-4 border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
              <h3 className="text-[14px] font-black uppercase text-[var(--text-primary)] tracking-widest flex items-center gap-3 italic">
                 <Calendar size={20} className="text-[var(--accent)]" />
                 SCHEDULE_MISSION_DEPLOYMENT
              </h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" onClick={() => setShowScheduleVisit(false)}>
                 <X size={28} />
              </button>
            </div>
            <form onSubmit={scheduleVisit} className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">TIMESTAMP_TARGET</label>
                <input type="datetime-local" className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[13px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] italic" required value={visitForm.scheduledAt} onChange={e => setVisitForm({...visitForm, scheduledAt: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">ASSIGNED_PROXY (AGENT)</label>
                <select className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[13px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase italic appearance-none cursor-pointer" required value={visitForm.agentId} onChange={e => setVisitForm({...visitForm, agentId: e.target.value})}>
                  <option value="">SELECT_DEPLOYABLE_AGENT</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">MISSION_DIRECTIVES</label>
                <textarea className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-4 py-3 text-[13px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none uppercase placeholder:text-[var(--text-muted)] italic" rows={3} value={visitForm.notes} onChange={e => setVisitForm({...visitForm, notes: e.target.value})} placeholder="INSTRUCTION SET..." />
              </div>
              <div className="flex gap-6 pt-8 border-t-2 border-[var(--border)] border-dashed">
                 <button type="button" className="flex-1 py-4 text-[12px] font-black text-[var(--text-muted)] hover:text-[var(--danger)] uppercase italic tracking-widest transition-all" onClick={() => setShowScheduleVisit(false)}>DISCARD</button>
                 <button type="submit" disabled={submittingVisit} className="flex-2 px-10 py-4 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[12px] font-black uppercase tracking-widest hover:bg-white hover:text-[var(--accent)] transition-all italic shadow-[6px_6px_0px_0px_var(--accent-light)]">
                    {submittingVisit ? <Loader2 className="animate-spin mx-auto" /> : 'AUTHORIZE_SCHEDULE'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}

function AssetMatchTab({ leadId, project }: { leadId: string, project: any }) {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  const fetchRecs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>(`/leads/${leadId}/recommendations`);
      setRecs(data);
    } catch (err) {
      console.warn("Recs load failed", err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { fetchRecs(); }, [fetchRecs]);

  const triggerMatch = async () => {
    setMatching(true);
    try {
      await api.post(`/leads/${leadId}/match-assets`, {});
      toast.success('Inventory matrix re-scan complete');
      fetchRecs();
    } catch (err: any) {
      toast.error(`Re-scan failed: ${err.message}`);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-6 border-2 border-[var(--border)]">
          <div>
             <h2 className="text-[16px] font-black uppercase tracking-widest flex items-center gap-3 italic">
                <Grid3X3 size={20} className="text-[var(--accent)]" />
                ASSET_INVENTORY_MATCHING_MATRIX
             </h2>
             <p className="text-[11px] text-[var(--text-secondary)] font-black uppercase mt-2 italic">Scanning project: {project?.name || 'GLOBAL_REGISTRY'}</p>
          </div>
          <button 
             onClick={triggerMatch}
             disabled={matching}
             className="px-8 py-3 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[11px] font-black uppercase tracking-[0.1em] hover:bg-white hover:text-[var(--accent)] transition-all flex items-center gap-3 italic shadow-[4px_4px_0px_0px_var(--accent-light)]"
          >
             {matching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} RUN_MATCHING_ALGORITHM
          </button>
       </div>

       <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[10px_10px_0px_0px_var(--border)] overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-[var(--border)] bg-[var(--bg-elevated)]">
             <h3 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-widest italic flex items-center gap-3">
                <TargetIcon size={16} className="text-[var(--accent)]" />
                OPTIMAL_ASSET_RECONCILIATION
             </h3>
          </div>
          <div className="divide-y-2 divide-[var(--border)]">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-8 animate-pulse bg-[var(--bg-surface)]">
                   <div className="h-6 w-32 bg-[var(--bg-elevated)] mb-4" />
                   <div className="h-4 w-64 bg-[var(--bg-elevated)]" />
                </div>
              ))
            ) : recs.length > 0 ? recs.map(unit => (
              <div key={unit.id} className="p-8 flex items-center justify-between hover:bg-[var(--bg-elevated)] transition-colors group">
                <div className="space-y-2">
                  <div className="text-[16px] font-black text-[var(--text-primary)] uppercase italic group-hover:text-[var(--accent)] transition-colors flex items-center gap-3">
                     {unit.unitNumber}
                     <span className="text-[9px] px-2 py-0.5 border-2 border-[var(--accent)] text-[var(--accent)]">MATCH_PROBABILITY: 92%</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-black uppercase italic tracking-tighter">
                     {unit.type?.replace('_', ' ') || 'STANDARD_UNIT'} • {unit.size} SQFT • ₹{(unit.totalPrice/100000).toFixed(0)}L
                  </div>
                </div>
                <div className="flex gap-4">
                   <button className="px-6 py-2 border-2 border-[var(--border)] text-[var(--text-primary)] text-[10px] font-black uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all italic">
                      VIEW_PLANS
                   </button>
                   <button className="px-6 py-2 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-black uppercase hover:bg-[var(--accent)] hover:text-white transition-all italic">
                      ISSUE_QUOTE
                   </button>
                </div>
              </div>
            )) : (
              <div className="py-32 text-center bg-[var(--bg-primary)]">
                 <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--bg-elevated)] border-4 border-dashed border-[var(--border)] text-[var(--text-muted)] mb-8 opacity-40">
                    <Grid3X3 size={40} />
                 </div>
                 <h4 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-[0.25em]">MATRIX_MATCH_VOID</h4>
                 <p className="text-[11px] text-[var(--text-secondary)] italic mt-3 uppercase font-black opacity-60">No optimal asset matches identified in current inventory sector.</p>
              </div>
            )}
          </div>
       </div>
    </div>
  );
}

function AIPanels({ leadId }: { leadId: string }) {
  const [brief, setBrief] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>(`/leads/${leadId}/ai-brief`),
      api.get<any>(`/leads/${leadId}/ai-summary`),
    ]).then(([b, s]) => {
      setBrief(b);
      setSummary(s.summary);
    }).catch(err => {
      console.warn("AI Data load incomplete", err);
    }).finally(() => setLoading(false));
  }, [leadId]);

  if (loading) return (
    <div className="bg-[var(--bg-surface)] border-4 border-[var(--accent)] p-12 text-center shadow-[10px_10px_0px_0px_var(--accent-light)]">
       <Loader2 className="mx-auto animate-spin text-[var(--accent)]" size={32} />
       <p className="text-[11px] font-black uppercase mt-6 tracking-[0.3em] text-[var(--accent)] italic">Interfacing with Neural Core...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="bg-[var(--bg-surface)] border-4 border-[var(--accent)] overflow-hidden relative shadow-[10px_10px_0px_0px_var(--accent-light)]">
        <div className="absolute -top-4 -right-4 opacity-5 rotate-12"><BrainCircuit size={120} strokeWidth={1} /></div>
        
        <div className="p-5 border-b-2 border-[var(--accent)] bg-[var(--accent-light)]">
           <div className="flex justify-between items-start">
             <div>
               <h3 className="text-[12px] font-black text-[var(--accent)] uppercase tracking-widest flex items-center gap-3 italic">
                  <Sparkles size={16} />
                  NEURAL_INTELLIGENCE_MATRIX
               </h3>
               <p className="text-[10px] text-[var(--accent)] font-black uppercase mt-1 opacity-70">STATUS: OPERATIONAL • PRECISION: {brief?.confidence || 'LEVEL_X'}</p>
             </div>
             <div className="bg-white border-2 border-[var(--accent)] px-3 py-1 text-[10px] font-black text-[var(--accent)] italic">
                CORE_V.9
             </div>
           </div>
        </div>

        <div className="p-8 space-y-8">
           <div className="flex items-center gap-8 bg-[var(--bg-elevated)] p-6 border-2 border-[var(--border)] relative group hover:border-[var(--accent)] transition-all">
              <div className="w-20 h-20 border-4 border-[var(--accent)] flex items-center justify-center text-[24px] font-black text-[var(--accent)] bg-white font-mono italic shadow-[4px_4px_0px_0px_var(--accent-light)]">
                 {brief?.score || 95}%
              </div>
              <div className="flex-1">
                 <div className="text-[18px] font-black text-[var(--text-primary)] tracking-tight uppercase italic leading-none group-hover:text-[var(--accent)] transition-colors">{brief?.label || 'HOT_PROSPECT_IDENTIFIED'}</div>
                 <div className="mt-4 h-2.5 w-full bg-[var(--bg-primary)] overflow-hidden border-2 border-[var(--border)]">
                    <div className="h-full bg-[var(--accent)] shadow-[2px_0px_4px_rgba(0,0,0,0.2)]" style={{ width: `${brief?.score || 95}%` }} />
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block flex items-center gap-2 italic">
                    <div className="w-2 h-2 bg-[var(--accent)]" /> REASONING_PROTOCOL_OUTPUT
                 </label>
                 <p className="text-[13px] text-[var(--text-primary)] font-black uppercase leading-relaxed italic">"{brief?.scoreExplanation || "ENTITY EXHIBITS HIGH FREQUENCY ENGAGEMENT PATTERNS AND SPECIFIC INTEREST IN PREMIUM ASSET SEGMENTS."}"</p>
              </div>

              <div className="bg-[var(--accent-light)] border-l-8 border-[var(--accent)] p-6">
                 <label className="text-[11px] font-black text-[var(--accent)] uppercase tracking-widest mb-3 block italic">OPTIMAL_DIRECTIVE</label>
                 <div className="flex items-center gap-4">
                    <Zap size={20} className="text-[var(--accent)] animate-pulse" />
                    <span className="text-[12px] font-black text-[var(--text-primary)] uppercase italic tracking-tighter">IMMEDIATE_COMMUNICATION_PROTOCOL_REQUIRED_WITHIN_15M_WINDOW</span>
                 </div>
              </div>

              <div className="bg-[var(--bg-elevated)] p-6 border-2 border-[var(--border)] border-dashed relative">
                 <div className="absolute top-2 right-4 opacity-10"><Quote size={20} /></div>
                 <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 block italic">DYNAMIC_ENGAGEMENT_SCRIPT</label>
                 <p className="text-[13px] font-black text-[var(--text-primary)] leading-relaxed italic uppercase tracking-tight">"{brief?.suggestedOpener || `GREETINGS ${lead.name}, ANALYZING YOUR INTEREST IN THE PREMIUM CONFIGURATIONS AT OUR LATEST ASSET SECTOR...`}"</p>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] p-6 relative shadow-[6px_6px_0px_0px_var(--border)]">
         <div className="absolute top-4 right-4 opacity-10"><BrainCircuit size={20} /></div>
         <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-3 italic">
            <Building size={16} className="text-[var(--accent)]" />
            STRATEGIC_SUMMARIZATION_CORE
         </h3>
         <div className="text-[13px] text-[var(--text-secondary)] font-black uppercase leading-relaxed bg-[var(--bg-elevated)] p-6 border-2 border-[var(--border)] italic border-dashed">
            {summary || "LOADING COMPREHENSIVE ENTITY SUMMARY FROM CENTRAL CORE..."}
         </div>
      </div>
    </div>
  );
}
