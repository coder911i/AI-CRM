import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
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
  StickyNote,
  ShieldCheck,
  Search,
  X,
  Loader2
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
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', source: 'MANUAL' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showNoteModal) {
      api.get<any[]>('/leads?limit=100').then(setLeads).catch(console.error);
    }
  }, [showNoteModal]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.leadId) return toast.error('Please select a target lead');
    if (!noteForm.description.trim()) return toast.error('Note description cannot be empty');
    
    setLoading(true);
    try {
      await api.post(`/leads/${noteForm.leadId}/notes`, { title: noteForm.title, description: noteForm.description });
      toast.success('Note appended to lead protocol');
      setShowNoteModal(false);
      setNoteForm({ leadId: '', title: 'Quick Note', description: '' });
      router.refresh();
    } catch (err: any) { 
      toast.error(err.message || 'Failed to sync note');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name.trim()) return toast.error('Lead identity label required');
    if (!leadForm.phone.trim()) return toast.error('Communication protocol required');
    
    setLoading(true);
    try {
      await api.post('/leads', leadForm);
      toast.success('Lead initialized in matrix');
      setShowLeadModal(false);
      setLeadForm({ name: '', phone: '', email: '', source: 'MANUAL' });
      router.refresh();
    } catch (err: any) { 
      toast.error(err.message || 'Failed to commit lead');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Session terminated');
      router.push('/login');
    } catch (err: any) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] font-sans">
      <aside 
        className={`bg-[var(--bg-primary)] border-r border-[var(--border)] h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-500 ease-in-out ${
          collapsed ? 'w-24' : 'w-64'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)]">
          {!collapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-700">
               <div className="w-8 h-8 bg-[var(--accent-light)] border-2 border-[var(--accent)] flex items-center justify-center text-[var(--accent)]">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <h1 className="text-[14px] font-bold text-[var(--text-primary)] leading-none">WATERTING</h1>
                  <span className="text-[11px] font-normal italic text-[var(--text-muted)] mt-1 block uppercase">Admin_Suite</span>
               </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-[var(--accent-light)] border-2 border-[var(--accent)] flex items-center justify-center text-[var(--accent)] mx-auto">
               <ShieldCheck size={18} />
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
             const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
             return (
               <Link 
                 key={item.href} 
                 href={item.href} 
                 className={`transition-all group relative flex items-center gap-3 px-4 py-3 text-[14px] border-l-[3px] transition-colors w-full ${
                   isActive 
                   ? 'font-bold text-[var(--accent)] bg-[var(--accent-light)] border-[var(--accent)]' 
                   : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border-transparent'
                 }`}
               >
                 <item.icon size={18} className={`shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                 {!collapsed && (
                   <span className="animate-in slide-in-from-left-2 duration-300 truncate tracking-tight">{item.label}</span>
                 )}
               </Link>
             );
          })}
        </nav>

        <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-surface)] space-y-4">
          <Link 
             href="/settings"
             className={`flex items-center gap-3 px-4 py-3 text-[14px] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] bg-[var(--bg-surface)] w-full transition-all ${collapsed ? 'justify-center' : ''}`}
          >
             <Settings size={18} />
             {!collapsed && <span className="tracking-tight font-bold">SYSTEM_SETTINGS</span>}
          </Link>

          <button 
             onClick={() => setCollapsed(!collapsed)}
             className="w-full py-3 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors flex items-center justify-center group"
          >
             {collapsed ? <ChevronRight size={18} /> : (
               <div className="flex items-center gap-2 text-[12px] font-bold uppercase italic">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Collapse_Menu
               </div>
             )}
          </button>
          
          <div className={`flex items-center gap-4 p-4 bg-[var(--bg-surface)] border border-[var(--border)] w-full ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center text-[14px] font-black text-[var(--accent)] shrink-0">
               {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-black text-[var(--text-primary)] truncate uppercase">{user?.email?.split('@')[0]}</div>
                <button 
                   onClick={handleLogout}
                   className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors mt-1 flex items-center gap-1.5 uppercase italic"
                >
                   Termination_Protocol <LogOut size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className={`bg-[var(--bg-primary)] flex-1 overflow-auto min-h-screen transition-all duration-500 ${collapsed ? 'ml-24' : 'ml-64'} relative`}>
        <header className="bg-[var(--bg-surface)] border-b-2 border-[var(--border)] h-16 flex items-center justify-between px-8">
           <div className="flex items-center gap-6">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" size={14} />
                 <input 
                   type="text" 
                   placeholder="SEARCH_MATRIX..." 
                   className="bg-[var(--bg-surface)] border-2 border-[var(--border)] pl-10 pr-6 py-2 text-[12px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all w-80 uppercase italic"
                 />
              </div>
           </div>
           <NotificationBell />
        </header>

        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
           {children}
        </div>
        
        <div className="fixed bottom-10 right-10 z-40 flex flex-col items-end gap-4">
          {fabOpen && (
            <div className="flex flex-col gap-3 mb-4 animate-in slide-in-from-bottom-5 duration-300">
              {[
                { label: 'INITIALIZE_LEAD', icon: Users, onClick: () => { setShowLeadModal(true); setFabOpen(false); } },
                { label: 'APPEND_NOTE', icon: StickyNote, onClick: () => { setShowNoteModal(true); setFabOpen(false); } },
                { label: 'SCHEDULE_VISIT', icon: MapPin, href: '/site-visits' },
                { label: 'EXECUTE_BOOKING', icon: ClipboardList, href: '/bookings' },
              ].map((action, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => action.onClick?.() || (action.href && (router.push(action.href), setFabOpen(false)))}>
                  <span className="bg-[var(--bg-surface)] px-4 py-2 text-[11px] font-black text-[var(--text-primary)] border-2 border-[var(--border)] scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all uppercase italic shadow-[4px_4px_0px_0px_var(--border)]">
                     {action.label}
                  </span>
                  <div className={`w-14 h-14 flex items-center justify-center transition-all group-hover:scale-110 group-hover:-translate-y-1 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] shadow-[4px_4px_0px_0px_var(--border)]`}>
                     <action.icon size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            onClick={() => setFabOpen(!fabOpen)}
            className={`w-16 h-16 bg-[var(--accent)] text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-[6px_6px_0px_0px_var(--accent-light)] ${fabOpen ? 'rotate-45' : ''}`}
          >
            <Plus size={32} />
          </button>
        </div>

        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowNoteModal(false)}>
            <div className="bg-[var(--bg-surface)] border-4 border-[var(--border)] w-full max-w-lg shadow-[15px_15px_0px_0px_var(--border)] overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="px-8 py-6 border-b-4 border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                 <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest italic flex items-center gap-3">
                    <StickyNote size={20} className="text-[var(--accent)]" /> Append_Global_Note
                 </h3>
                 <button onClick={() => setShowNoteModal(false)} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddNote} className="p-8 space-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Target_Lead_Identity</label>
                  <select className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-4 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all appearance-none cursor-pointer uppercase italic" required value={noteForm.leadId} onChange={e => setNoteForm({...noteForm, leadId: e.target.value})}>
                    <option value="">SELECT_LEAD_RECORD...</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name} [{l.phone}]</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Protocol_Title</label>
                  <input className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-4 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all uppercase italic" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} maxLength={50} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Annotation_Data</label>
                  <textarea className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-4 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all resize-none uppercase italic" rows={5} required value={noteForm.description} onChange={e => setNoteForm({...noteForm, description: e.target.value})} placeholder="INPUT_COMMENT_STREAM..." />
                </div>
                <div className="flex gap-6 pt-6 border-t-2 border-[var(--border)] border-dashed">
                   <button type="button" className="px-8 py-4 text-[12px] font-black text-[var(--text-muted)] hover:text-[var(--danger)] uppercase italic tracking-widest transition-all" onClick={() => setShowNoteModal(false)}>ABORT_PROTOCOL</button>
                   <button type="submit" disabled={loading} className="flex-1 py-4 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[12px] font-black hover:bg-white hover:text-[var(--accent)] transition-all flex items-center justify-center gap-2 uppercase italic shadow-[6px_6px_0px_0px_var(--accent-light)]">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : 'COMMIT_LOG_ENTRY'}
                   </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showLeadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg-primary)]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowLeadModal(false)}>
            <div className="bg-[var(--bg-surface)] border-4 border-[var(--border)] w-full max-w-lg shadow-[15px_15px_0px_0px_var(--border)] overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="px-8 py-6 border-b-4 border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                 <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest italic flex items-center gap-3">
                    <Users size={20} className="text-[var(--accent)]" /> Initialize_Entity_Intake
                 </h3>
                 <button onClick={() => setShowLeadModal(false)} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleQuickLead} className="p-8 space-y-8">
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Legal_Identity_Label</label>
                   <input className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-4 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all uppercase italic" required value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} placeholder="ENTITY_NAME_STRING..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Comms_Sync_Frequency (Phone)</label>
                   <input className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-4 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all font-mono italic" required value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} placeholder="+91 ..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Digital_Anchor (Email)</label>
                   <input type="email" className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-4 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all font-mono uppercase italic" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} placeholder="ENTITY@DOMAIN.COM" />
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Origin_Vector_Class</label>
                   <select className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] px-5 py-4 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all appearance-none cursor-pointer uppercase italic" value={leadForm.source} onChange={e => setLeadForm({...leadForm, source: e.target.value})}>
                      <option value="MANUAL">DIRECT_REFERRAL</option>
                      <option value="WHATSAPP">WHATSAPP_INBOUND</option>
                      <option value="BROKER">PARTNER_NETWORK</option>
                   </select>
                </div>
                <div className="flex gap-6 pt-6 border-t-2 border-[var(--border)] border-dashed">
                   <button type="button" className="px-8 py-4 text-[12px] font-black text-[var(--text-muted)] hover:text-[var(--danger)] uppercase italic tracking-widest transition-all" onClick={() => setShowLeadModal(false)}>ABORT_INTAKE</button>
                   <button type="submit" disabled={loading} className="flex-1 py-4 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[12px] font-black hover:bg-white hover:text-[var(--accent)] transition-all flex items-center justify-center gap-2 uppercase italic shadow-[6px_6px_0px_0px_var(--accent-light)]">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : 'AUTHORIZE_COMMIT'}
                   </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
