'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/portal/login';

  if (isLoginPage) return <>{children}</>;

  const navItems = [
    { label: 'Overview', href: '/portal/dashboard', icon: '📊' },
    { label: 'Payments', href: '/portal/payments', icon: '💳' },
    { label: 'Documents', href: '/portal/documents', icon: '📄' },
    { label: 'Wishlist', href: '/portal/wishlist', icon: '❤️' },
    { label: 'Visits', href: '/portal/visits', icon: '📍' },
    { label: 'Support', href: '/portal/tickets', icon: '💬' },
    { label: 'Property', href: '/portal/property', icon: '🏠' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--navy)', color: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>W</div>
            <h1 style={{ fontSize: 18, fontWeight: 800 }}>Waterting Portal</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('waterting_portal_token'); window.location.href = '/portal/login'; }}>Logout</button>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0, overflowX: 'auto' }}>
            {navItems.map(item => (
              <Link 
                key={item.href} 
                href={item.href} 
                style={{
                  padding: '12px 16px',
                  fontSize: 13, 
                  fontWeight: 600, 
                  textDecoration: 'none', 
                  color: pathname === item.href ? '#fff' : 'rgba(255,255,255,0.6)',
                  borderBottom: `2px solid ${pathname === item.href ? 'var(--primary)' : 'transparent'}`,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 1200, margin: '24px auto', padding: '0 20px' }}>
        {children}
      </main>
    </div>
  );
}
