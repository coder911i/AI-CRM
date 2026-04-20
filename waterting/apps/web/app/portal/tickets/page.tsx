'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  History, 
  Clock, 
  ChevronRight, 
  X,
  PlusCircle,
  HelpCircle,
  Activity
} from 'lucide-react';

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
    <div className="max-w-[1240px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase font-mono">Response Log</h2>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Authorized support and resolution terminal</p>
        </div>
        <button className="btn btn-primary px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 flex items-center gap-3" onClick={() => setShowCreate(true)}>
           Initialize Request <Plus size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Synchronization Active ({tickets.length} Threads)</span>
          </div>
          {tickets.map((ticket: any) => (
            <div key={ticket.id} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <ChevronRight size={14} className="text-primary" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors pr-8">{ticket.subject}</h4>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border leading-none ${
                    ticket.status === 'OPEN' 
                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium line-clamp-1 italic pr-4">
                {ticket.description}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 px-6 py-3">
                <span className="text-[9px] font-black text-slate-300 font-mono tracking-tighter uppercase">ID: {ticket.id.slice(-8)}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                   <Clock size={10} /> {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 shadow-inner text-center flex flex-col items-center gap-4">
              <Activity size={24} className="text-slate-200" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Zero unresolved requests discovered</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center gap-8 group">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
             <MessageSquare size={32} />
          </div>
          <div className="space-y-2">
             <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">Awaiting Selection</h4>
             <p className="text-[11px] text-slate-400 font-medium italic uppercase tracking-tighter max-w-[320px] mx-auto leading-relaxed">System is standing by for thread selection. Support responses are typically synchronized within a 24-hour cycle.</p>
          </div>
          <div className="flex gap-4 pt-4">
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">SL-A Validated</span>
             </div>
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <History size={14} className="text-primary" />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">99.9% Uptime</span>
             </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Protocol Initiation</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Initialize Strategic Discovery</p>
               </div>
               <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400" onClick={() => setShowCreate(false)}>
                  <X size={20} />
               </button>
            </div>
            
            <form onSubmit={createTicket} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Header</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/10 transition-all uppercase placeholder:text-slate-200" 
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  required 
                  placeholder="E.G. ASSET DISCREPANCY"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observed Discrepancy</label>
                <textarea 
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-200" 
                  rows={4}
                  value={newTicket.description}
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  required
                  placeholder="Input detailed observation log..."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" className="flex-1 btn btn-secondary py-4 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setShowCreate(false)}>Abort</button>
                <button type="submit" className="flex-[2] btn btn-primary py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">Initialize Feed</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
