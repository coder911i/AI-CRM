'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Analytics', icon: '📈', href: '/admin/analytics' },
    { label: 'Users', icon: '👥', href: '/admin/users' },
    { label: 'Properties', icon: '🏠', href: '/admin/properties' },
    { label: 'Deals', icon: '💎', href: '/admin/deals' },
    { label: 'Fraud', icon: '🚨', href: '/admin/fraud' },
    { label: 'Settings', icon: '⚙️', href: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('waterting_token');
    router.push('/admin/login');
  };

  if (pathname.includes('/admin/login')) return <>{children}</>;

  return (
    <div className="crm-layout">
      <aside className={`crm-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo"><h1>Waterting God</h1></div>
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
          <div className="user-avatar">A</div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-email">Super Admin</span>
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
