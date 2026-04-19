'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Leads', href: '/leads', icon: '👥' },
  { label: 'Pipeline', href: '/pipeline', icon: '🔄' },
  { label: 'Projects', href: '/projects', icon: '🏗️' },
  { label: 'Inventory', href: '/inventory', icon: '🏢' },
  { label: 'Site Visits', href: '/site-visits', icon: '📍' },
  { label: 'Brokers', href: '/brokers', icon: '🤝' },
  { label: 'Bookings', href: '/bookings', icon: '📋' },
  { label: 'Listings', href: '/listings', icon: '📝' },
  { label: 'Analytics', href: '/analytics', icon: '📈' },
];

const bottomItems = [
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

import NotificationBell from './NotificationBell';

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
    if (!noteForm.leadId) return alert('Please select a lead');
    try {
      await api.post(`/leads/${noteForm.leadId}/notes`, { title: noteForm.title, description: noteForm.description });
      setShowNoteModal(false);
      setNoteForm({ leadId: '', title: 'Quick Note', description: '' });
      router.refresh();
    } catch (err: any) { alert(err.message); }
  };

  const handleQuickLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leads', leadForm);
      setShowLeadModal(false);
      setLeadForm({ name: '', phone: '', source: 'MANUAL' });
      router.refresh();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="crm-layout">
      <aside className={`crm-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            {!collapsed && <h1>Waterting</h1>}
            {collapsed && <h1>W</h1>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <NotificationBell />
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href || pathname?.startsWith(item.href + '/') ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <nav className="sidebar-bottom">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <span className="user-role">{user?.role?.replace(/_/g, ' ')}</span>
            </div>
          )}
          {!collapsed && (
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </aside>

      <main className="crm-content">
        {children}
        
        {/* Floating Action Button (FAB) */}
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          {fabOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
              {[
                { label: 'New Lead', icon: '👥', color: '#10B981', onClick: () => { setShowLeadModal(true); setFabOpen(false); } },
                { label: 'Add Note', icon: '📝', color: '#F59E0B', onClick: () => { setShowNoteModal(true); setFabOpen(false); } },
                { label: 'New Booking', icon: '📋', color: '#3B82F6', href: '/bookings' },
                { label: 'Schedule Visit', icon: '📍', color: '#8B5CF6', href: '/site-visits' },
              ].map((action, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{action.label}</span>
                  {action.href ? (
                    <Link 
                      href={action.href}
                      style={{ width: 44, height: 44, borderRadius: '50%', background: action.color, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textDecoration:'none' }}
                    >
                      {action.icon}
                    </Link>
                  ) : (
                    <button 
                      onClick={() => action.onClick ? action.onClick() : undefined}
                      style={{ width: 44, height: 44, borderRadius: '50%', background: action.color, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    >
                      {action.icon}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <button 
            onClick={() => setFabOpen(!fabOpen)}
            style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}
          >
            <span style={{ transform: fabOpen ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
          </button>
        </div>

        {showNoteModal && (
          <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 440}}>
              <div className="modal-header"><h3>Add Global Note</h3><button className="modal-close" onClick={() => setShowNoteModal(false)}>×</button></div>
              <form onSubmit={handleAddNote}>
                <div className="form-group">
                  <label>Select Lead *</label>
                  <select className="form-input" required value={noteForm.leadId} onChange={e => setNoteForm({...noteForm, leadId: e.target.value})}>
                    <option value="">-- Choose Lead --</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Note Title</label><input className="form-input" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} /></div>
                <div className="form-group"><label>Details</label><textarea className="form-textarea" rows={4} required value={noteForm.description} onChange={e => setNoteForm({...noteForm, description: e.target.value})} placeholder="Type note here..." /></div>
                <div style={{display:'flex', gap: 12, marginTop: 24}}>
                  <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setShowNoteModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save Note</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showLeadModal && (
          <div className="modal-overlay" onClick={() => setShowLeadModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
              <div className="modal-header"><h3>Quick New Lead</h3><button className="modal-close" onClick={() => setShowLeadModal(false)}>×</button></div>
              <form onSubmit={handleQuickLead}>
                <div className="form-group"><label>Lead Name *</label><input className="form-input" required value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} /></div>
                <div className="form-group"><label>Phone Number *</label><input className="form-input" required value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} /></div>
                <div className="form-group">
                  <label>Source</label>
                  <select className="form-input" value={leadForm.source} onChange={e => setLeadForm({...leadForm, source: e.target.value})}>
                    <option value="MANUAL">Manual Entry</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="BROKER">Broker Referral</option>
                  </select>
                </div>
                <div style={{display:'flex', gap: 12, marginTop: 24}}>
                  <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => setShowLeadModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{flex: 1}}>Create Lead</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
