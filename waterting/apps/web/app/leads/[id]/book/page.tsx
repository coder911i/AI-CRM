'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import toast from 'react-hot-toast';
import { 
  Building2, 
  User, 
  CreditCard, 
  Layout, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  IndianRupee, 
  Clock, 
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Search,
  Grid3X3,
  FileText
} from 'lucide-react';

export default function LeadBookingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const [lead, setLead] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    bookingAmount: 100000,
    paymentMode: 'ONLINE',
    notes: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const leadData = await api.get<any>(`/leads/${params.id}`);
      setLead(leadData);
      
      // Fetch units for the project
      if (leadData.projectId) {
        const towersData = await api.get<any[]>(`/projects/${leadData.projectId}/towers`);
        const allUnits = towersData.flatMap(t => (t.units || []).map((u: any) => ({ ...u, towerName: t.name })));
        setUnits(allUnits.filter((u: any) => u.status === 'AVAILABLE'));
      } else {
        // Fallback or global units if no project assigned
        const response = await api.get<any[]>('/units');
        setUnits(response.filter((u: any) => u.status === 'AVAILABLE'));
      }
    } catch (err) {
      toast.error('Failed to initialize booking matrix');
      router.push(`/leads/${params.id}`);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) fetchData();
  }, [user, authLoading, params.id, fetchData, router]);

  const executeBooking = async () => {
    if (!selectedUnit) return toast.error('Asset selection required');
    if (bookingForm.bookingAmount <= 0) return toast.error('Invalid valuation amount');

    setSubmitting(true);
    try {
      await api.post('/bookings', {
        leadId: params.id,
        unitId: selectedUnit.id,
        bookingAmount: bookingForm.bookingAmount,
        paymentMode: bookingForm.paymentMode,
        notes: bookingForm.notes
      });
      
      // Update lead stage to BOOKING_DONE
      await api.patch(`/leads/${params.id}/stage`, { stage: 'BOOKING_DONE' });
      
      toast.success('Asset reservation protocol successful');
      router.push(`/leads/${params.id}`);
    } catch (err: any) {
      toast.error(`Protocol failure: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <CRMLayout>
        <div className="p-10 flex flex-col items-center justify-center min-h-[80vh] space-y-6">
           <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic">Initializing settlement matrix...</p>
        </div>
      </CRMLayout>
    );
  }

  if (!lead) return null;

  const filteredUnits = units.filter(u => 
    u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.towerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CRMLayout>
      <div className="bg-[var(--bg-primary)] p-10 min-h-full space-y-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-4 border-[var(--border)]">
          <div className="space-y-4">
            <button 
              onClick={() => router.push(`/leads/${params.id}`)}
              className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-widest transition-all italic"
            >
              <ArrowLeft size={14} /> REVERT_TO_ENTITY_PROFILE
            </button>
            <div>
               <div className="flex items-center gap-3 text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.25em] mb-2">
                  <div className="w-2 h-2 bg-[var(--accent)] animate-pulse" />
                  SETTLEMENT_AUTHORIZATION_PROTOCOL
               </div>
               <h1 className="text-[28px] font-black text-[var(--text-primary)] uppercase tracking-tight italic">
                  EXECUTE_BOOKING: {lead.name}
               </h1>
            </div>
          </div>
          <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] px-6 py-4 flex flex-col items-end shadow-[4px_4px_0px_0px_var(--border)]">
             <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">ASSIGNED_PROJECT</span>
             <span className="text-[14px] font-black text-[var(--accent)] uppercase italic">{lead.project?.name || 'GLOBAL_INVENTORY'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Asset Selection Segment */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[8px_8px_0px_0px_var(--border)] flex flex-col">
               <div className="px-6 py-5 border-b-2 border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                  <h3 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-3">
                     <Grid3X3 size={20} className="text-[var(--accent)]" />
                     AVAILABLE_ASSET_MATRIX
                  </h3>
                  <div className="relative group">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                     <input 
                        className="bg-[var(--bg-surface)] border-2 border-[var(--border)] pl-9 pr-4 py-1.5 text-[11px] font-black uppercase outline-none focus:border-[var(--accent)] italic transition-all" 
                        placeholder="FILTER_UNITS..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                     />
                  </div>
               </div>
               
               <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto no-scrollbar bg-[var(--bg-primary)]/20">
                  {filteredUnits.length > 0 ? filteredUnits.map(unit => (
                    <button 
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className={`p-5 border-2 text-left transition-all relative group ${
                        selectedUnit?.id === unit.id 
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-[4px_4px_0px_0px_var(--accent-light)]' 
                        : 'bg-white border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[4px_4px_0px_0px_var(--border)]'
                      }`}
                    >
                       {selectedUnit?.id === unit.id && (
                         <div className="absolute top-2 right-2">
                            <CheckCircle2 size={16} className="text-white" />
                         </div>
                       )}
                       <div className={`text-[10px] font-black uppercase mb-1 ${selectedUnit?.id === unit.id ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>{unit.towerName}</div>
                       <div className="text-[18px] font-black uppercase italic leading-none mb-4">{unit.unitNumber}</div>
                       <div className="flex flex-col gap-1 pt-3 border-t border-current border-dashed opacity-80">
                          <span className="text-[10px] font-black uppercase italic">{unit.type.replace('_', ' ')}</span>
                          <span className="text-[12px] font-black font-mono">₹{(unit.totalPrice/100000).toFixed(1)}L</span>
                       </div>
                    </button>
                  )) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-[var(--border)] bg-white opacity-50">
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] italic">Zero available assets detected in current matrix segment</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Configuration & Settlement Segment */}
          <div className="lg:col-span-5 space-y-10">
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[10px_10px_0px_0px_var(--border)] overflow-hidden">
               <div className="px-6 py-5 border-b-2 border-[var(--border)] bg-[var(--bg-elevated)]">
                  <h3 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-3">
                     <CreditCard size={20} className="text-[var(--accent)]" />
                     VALUATION_&_SETTLEMENT_CONFIG
                  </h3>
               </div>
               
               <div className="p-8 space-y-8">
                  {!selectedUnit ? (
                    <div className="py-20 text-center border-2 border-dashed border-[var(--border)] bg-[var(--bg-primary)]/30">
                       <ShieldCheck size={40} className="mx-auto text-[var(--text-muted)] opacity-20 mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] italic">Awaiting asset selection for configuration authorization</p>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                       <div className="bg-[var(--accent-light)] border-l-8 border-[var(--accent)] p-6 flex justify-between items-center">
                          <div>
                             <label className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest block mb-1">TARGET_ASSET_TOTAL_VALUE</label>
                             <div className="text-[26px] font-black text-[var(--text-primary)] font-mono italic">₹{selectedUnit.totalPrice.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-[14px] font-black text-[var(--accent)] uppercase italic">{selectedUnit.unitNumber}</div>
                             <div className="text-[9px] font-black text-[var(--text-muted)] uppercase italic tracking-tighter">{selectedUnit.towerName}</div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">SETTLEMENT_AMOUNT (₹)</label>
                            <div className="relative group">
                               <IndianRupee size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                               <input 
                                 type="number"
                                 className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] pl-12 pr-4 py-4 text-[16px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono italic transition-all" 
                                 value={bookingForm.bookingAmount}
                                 onChange={e => setBookingForm({...bookingForm, bookingAmount: parseInt(e.target.value)})}
                               />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">TRANSACTION_MODE_PROTOCOL</label>
                            <select 
                               className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-4 text-[14px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase italic appearance-none cursor-pointer"
                               value={bookingForm.paymentMode}
                               onChange={e => setBookingForm({...bookingForm, paymentMode: e.target.value})}
                            >
                               {['ONLINE', 'CHEQUE', 'NEFT', 'CASH_LEDGER'].map(m => (
                                 <option key={m} value={m}>{m.replace('_', ' ')}</option>
                               ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">TACTICAL_SETTLEMENT_NOTES</label>
                            <textarea 
                               className="w-full h-24 bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-4 text-[13px] font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase italic placeholder:text-[var(--text-muted)] resize-none" 
                               placeholder="INPUT_TRANSACTION_CONTEXT..."
                               value={bookingForm.notes}
                               onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
                            />
                          </div>
                       </div>

                       <div className="pt-8 border-t-2 border-[var(--border)] border-dashed">
                          <div className="flex justify-between items-center mb-8">
                             <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                                <ShieldCheck size={18} />
                                <span className="text-[11px] font-black uppercase italic">Authorization Secure</span>
                             </div>
                             <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">TIMESTAMP: {new Date().toLocaleTimeString().toUpperCase()}</div>
                          </div>
                          
                          <button 
                             disabled={submitting}
                             onClick={executeBooking}
                             className="w-full py-6 bg-[var(--danger)] border-2 border-[var(--danger)] text-white text-[16px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-[var(--danger)] transition-all italic shadow-[10px_10px_0px_0px_var(--danger-bg)] flex items-center justify-center gap-5"
                          >
                             {submitting ? <Loader2 className="animate-spin" /> : <Zap size={22} className="animate-pulse" />} AUTHORIZE_FINAL_SETTLEMENT
                          </button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
