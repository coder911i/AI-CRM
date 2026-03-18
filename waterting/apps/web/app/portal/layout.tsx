'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/portal/login';

  if (isLoginPage) return <>{children}</>;

  const navItems = [
    { label: 'Dashboard', href: '/portal/dashboard' },
    { label: 'Payments', href: '/portal/payments' },
    { label: 'Documents', href: '/portal/documents' },
    { label: 'Property', href: '/portal/property' },
  ];

  return (
    <div style={{minHeight: '100vh', background: 'var(--bg)'}}>
      <header style={{background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10}}>
        <div style={{maxWidth: 800, margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h1 style={{fontSize: 18, fontWeight: 800, color: 'var(--primary)'}}>Waterting Portal</h1>
          <nav style={{display: 'flex', gap: 20}}>
            {navItems.map(item => (
              <Link 
                key={item.href} 
                href={item.href} 
                style={{
                  fontSize: 14, 
                  fontWeight: 600, 
                  textDecoration: 'none', 
                  color: pathname === item.href ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main style={{maxWidth: 800, margin: '24px auto', padding: '0 20px'}}>
        {children}
      </main>
    </div>
  );
}
