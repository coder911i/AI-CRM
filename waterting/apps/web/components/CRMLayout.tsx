'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import { 
  LayoutDashboard, 
  Users, 
  RefreshCcw, 
  Pickaxe, 
  Building2, 
  MapPin, 
  Handshake, 
  ClipboardList, 
  FileText, 
  BarChart3, 
  Settings,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  StickyNote,
  Zap,
  ShieldCheck,
  Search,
  Bell,
  X,
  Target,
  ArrowUpRight
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const navItems = [
  { label: 'STRATEGIC_VIEW', href: '/dashboard', icon: LayoutDashboard },
  { label: 'LEAD_REGISTRY', href: '/leads', icon: Users },
  { label: 'OPERATIONAL_FLOW', href: '/pipeline', icon: RefreshCcw },
  { label: 'DEVELOPMENT_CORE', href: '/projects', icon: Pickaxe },
  { label: 'ASSET_MANAGEMENT', href: '/inventory', icon: Building2 },
  { label: 'VISIT_LOGISTICS', href: '/site-visits', icon: MapPin },
  { label: 'PARTNER_NETWORK', href: '/brokers', icon: Handshake },
  { label: 'EXECUTION_BOOKINGS', href: '/bookings', icon: ClipboardList },
  { label: 'MARKET_LISTINGS', href: '/listings', icon: FileText },
  { label: 'INTELLIGENCE_SUITE', href: '/analytics', icon: BarChart3 },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [noteForm, setNoteForm] = useState({ leadId: '', title: 'Quick Note', description: '' });
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', source: 'MANUAL' });

  useEffect(() => {
    if (showNoteModal) {
      api.get<any[]>('/leads?limit=100').then(setLeads).catch(console.error);
    }
  }, [showNoteModal]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.leadId) return;
    try {
      await api.post(`/leads/${noteForm.leadId}/notes`, { title: noteForm.title, description: noteForm.description });
      setShowNoteModal(false);
      setNoteForm({ leadId: '', title: 'Quick Note', description: '' });
      router.refresh();
    } catch (err: any) { console.error(err.message); }
  };

  const handleQuickLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leads', leadForm);
      setShowLeadModal(false);
      setLeadForm({ name: '', phone: '', source: 'MANUAL' });
      router.refresh();
    } catch (err: any) { console.error(err.message); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary selection:text-white">
      {/* High-Density Administrative Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-slate-900 z-[100] transition-all duration-500 ease-in-out flex flex-col border-r border-white/5 shadow-2xl ${
          collapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/20">
          {!collapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-700">
               <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <h1 className="text-sm font-black text-white tracking-[0.2em] leading-none">WATERTING</h1>
                  <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1 block">ADMIN_SUITE</span>
               </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 mx-auto">
               <ShieldCheck size={18} />
            </div>
          )}
        </div>

        <nav className="flex-1 p-6 space-y-1.5 mt-4 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
             const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
             return (
               <Link 
                 key={item.href} 
                 href={item.href} 
                 className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative ${
                   isActive 
                   ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-2' 
                   : 'text-slate-400 hover:bg-white/5 hover:text-white'
                 }`}
               >
                 <item.icon size={18} className={`shrink-0 transition-transform ${collapsed ? 'mx-auto' : ''} ${isActive ? 'scale-110' : 'group-hover:scale-110 duration-300'}`} />
                 {!collapsed && (
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-left-2 duration-300 truncate">{item.label}</span>
                 )}
               </Link>
             );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-slate-950/20 space-y-4">
          <Link 
             href="/settings"
             className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-slate-400 hover:bg-white/5 hover:text-white ${collapsed ? 'justify-center' : ''}`}
          >
             <Settings size={18} />
             {!collapsed && <span className="text-[9px] font-black uppercase tracking-[0.2em]">SYSTEM_LOGIC</span>}
          </Link>

          <button 
             onClick={() => setCollapsed(!collapsed)}
             className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 group"
          >
             {collapsed ? <ChevronRight size={18} /> : (
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> COLLAPSE_CMD
               </div>
             )}
          </button>
          
          <div className={`flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group transition-all ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-white shrink-0">
               {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-white uppercase tracking-widest truncate">{user?.email?.split('@')[0]}</div>
                <button 
                   onClick={logout}
                   className="text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors mt-1 flex items-center gap-1.5"
                >
                   LOGOUT_CMD <LogOut size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Primary Context Workspace */}
      <main className={`flex-1 min-h-screen transition-all duration-500 ${collapsed ? 'ml-24' : 'ml-72'} p-12 bg-white relative`}>
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
           <div className="flex items-center gap-6">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" size={14} />
                 <input 
                   type="text" 
                   placeholder="SEARCH_REGISTRY..." 
                   className="bg-slate-50 border border-slate-100 pl-10 pr-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase outline-none focus:ring-4 focus:ring-primary/5 transition-all w-64 shadow-inner"
                 />
              </div>
           </div>
           <NotificationBell />
        </header>

        <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
           {children}
        </div>
        
        {/* Elite Administrative Quick-Action Trigger */}
        <div className="fixed bottom-10 right-10 z-[1000] flex flex-col items-end gap-4">
          {fabOpen && (
            <div className="flex flex-col gap-3 mb-4 animate-in slide-in-from-bottom-5 duration-300">
              {[
                { label: 'INITIALIZE_LEAD', icon: Users, color: 'bg-emerald-500', onClick: () => { setShowLeadModal(true); setFabOpen(false); } },
                { label: 'APPEND_NOTE', icon: StickyNote, color: 'bg-amber-500', onClick: () => { setShowNoteModal(true); setFabOpen(false); } },
                { label: 'SCHEDULE_VISIT', icon: MapPin, color: 'bg-indigo-500', href: '/site-visits' },
                { label: 'EXECUTE_BOOKING', icon: ClipboardList, color: 'bg-primary', href: '/bookings' },
              ].map((action, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => action.onClick?.() || (action.href && router.push(action.href))}>
                  <span className="bg-white px-4 py-2 rounded-xl shadow-xl text-[9px] font-black text-slate-900 uppercase tracking-widest border border-slate-100 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">
                     {action.label}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 group-hover:-translate-y-1 ${action.color}`}>
                     <action.icon size={18} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            onClick={() => setFabOpen(!fabOpen)}
            className={`w-16 h-16 rounded-[2rem] bg-slate-900 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center border border-white/10 ${fabOpen ? 'rotate-45 bg-rose-500 ring-4 ring-rose-500/20' : ''}`}
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Operational Modality Layers */}
        {showNoteModal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowNoteModal(false)}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <StickyNote size={14} className="text-amber-500" /> APPEND_GLOBAL_NOTE
                 </h3>
                 <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddNote} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TARGET_LEAD_IDENTITY</label>
                  <select className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none" required value={noteForm.leadId} onChange={e => setNoteForm({...noteForm, leadId: e.target.value})}>
                    <option value="">SELECT_LEAD_DURABLE_ID</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name} [{l.phone}]</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BRIEF_TITLE</label>
                  <input className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-tight outline-none focus:ring-4 focus:ring-primary/5 transition-all" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} maxLength={50} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DETAILED_ANNOTATION</label>
                  <textarea className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-xs font-medium tracking-tight outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none" rows={4} required value={noteForm.description} onChange={e => setNoteForm({...noteForm, description: e.target.value})} placeholder="INTERNAL_COMMENT_STREAM..." />
                </div>
                <div className="flex gap-4 pt-4 border-t border-slate-50">
                   <button type="button" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors" onClick={() => setShowNoteModal(false)}>ABORT_PHASE</button>
                   <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all">SAVE_LOG</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showLeadModal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowLeadModal(false)}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Users size={14} className="text-emerald-500" /> INITIALIZE_NEW_LEAD
                 </h3>
                 <button onClick={() => setShowLeadModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleQuickLead} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LEGAL_IDENTITY_NAME</label>
                   <input className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-tight outline-none focus:ring-4 focus:ring-primary/5 transition-all" required value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} placeholder="e.g. ALPHA_USER" />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">COMMUNICATION_PROTOCOL_PHONE</label>
                   <input className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-xs font-mono font-bold tracking-tight outline-none focus:ring-4 focus:ring-primary/5 transition-all" required value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} placeholder="+91 ..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ACQUISITION_CHANNEL</label>
                   <select className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none" value={leadForm.source} onChange={e => setLeadForm({...leadForm, source: e.target.value})}>
                      <option value="MANUAL">DIRECT_REFFERAL</option>
                      <option value="WHATSAPP">WHATSAPP_INBOUND</option>
                      <option value="BROKER">PARTNER_PORTAL</option>
                   </select>
                </div>
                <div className="flex gap-4 pt-4 border-t border-slate-50">
                   <button type="button" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors" onClick={() => setShowLeadModal(false)}>ABORT_INITIALIZATION</button>
                   <button type="submit" className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-slate-900 transition-all border border-emerald-500">COMMIT_LEAD</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
