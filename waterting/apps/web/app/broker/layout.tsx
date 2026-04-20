'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: '📊', href: '/broker/dashboard' },
    { label: 'My Leads', icon: '👥', href: '/broker/leads' },
    { label: 'Visits', icon: '📅', href: '/broker/visits' },
    { label: 'Commissions', icon: '💰', href: '/broker/commissions' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('waterting_token');
    router.push('/broker/login');
  };

  if (pathname.includes('/broker/login')) return <>{children}</>;

  return (
    <div className="crm-layout">
      <aside className={`crm-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo"><h1>Waterting</h1></div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
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
          <div className="user-avatar">B</div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-email">Broker Portal</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </aside>

      <main className="crm-content">
        {children}
      </main>
    </div>
  );
}
