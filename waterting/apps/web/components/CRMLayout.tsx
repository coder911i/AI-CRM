'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Leads', href: '/leads', icon: '👥' },
  { label: 'Pipeline', href: '/pipeline', icon: '🔄' },
  { label: 'Projects', href: '/projects', icon: '🏗️' },
  { label: 'Inventory', href: '/inventory', icon: '🏢' },
  { label: 'Site Visits', href: '/site-visits', icon: '📍' },
  { label: 'Brokers', href: '/brokers', icon: '🤝' },
  { label: 'Bookings', href: '/bookings', icon: '📋' },
  { label: 'Analytics', href: '/analytics', icon: '📈' },
];

const bottomItems = [
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="crm-layout">
      <aside className={`crm-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            {!collapsed && <h1>Waterting</h1>}
            {collapsed && <h1>W</h1>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
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
      </main>
    </div>
  );
}
