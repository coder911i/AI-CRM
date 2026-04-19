'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/builder/dashboard', icon: '📈' },
    { label: 'My Projects', href: '/builder/projects', icon: '🏗️' },
    { label: 'Inventory', href: '/builder/inventory', icon: '🏢' },
    { label: 'Leads', href: '/builder/leads', icon: '👥' },
    { label: 'Bookings', href: '/builder/bookings', icon: '🖋️' },
    { label: 'Ads & Marketing', href: '/builder/ads', icon: '📣' },
    { label: 'Team', href: '/builder/team', icon: '🤝' },
  ];

  return (
    <div className="crm-layout">
      <aside className="crm-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <h1>BuilderHub</h1>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="logout-btn" style={{ width: '100%' }} onClick={() => window.location.href = '/login'}>
            Switch to CRM
          </button>
        </div>
      </aside>
      <main className="crm-content">
        {children}
      </main>
    </div>
  );
}
