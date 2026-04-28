'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  BarChart3, 
  Users2, 
  Building2, 
  Handshake, 
  ShieldAlert, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  ShieldCheck, 
  Zap, 
  Globe
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'INTELLIGENCE', icon: BarChart3, href: '/admin/analytics' },
    { label: 'USER_REGISTRY', icon: Users2, href: '/admin/users' },
    { label: 'PORTFOLIO_MASTER', icon: Building2, href: '/admin/properties' },
    { label: 'REVENUE_COMMAND', icon: Handshake, href: '/admin/deals' },
    { label: 'SECURITY_AUDIT', icon: ShieldAlert, href: '/admin/fraud' },
    { label: 'SYSTEM_LOGIC', icon: Settings, href: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('waterting_token');
    router.push('/admin/login');
  };

  if (pathname.includes('/admin/login')) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] font-mono selection:bg-[var(--accent)] selection:text-[var(--bg-surface)]">
      {/* Precision Sidebar Shell */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-[var(--bg-surface)] z-[100] transition-all duration-300 flex flex-col border-r border-[var(--border)] ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          {!collapsed && (
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 border-2 border-[var(--accent)] flex items-center justify-center text-[var(--accent)]">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <h1 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider leading-none">WATERTING</h1>
                  <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest mt-1 block">MASTER_CMD</span>
               </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 border-2 border-[var(--accent)] flex items-center justify-center text-[var(--accent)] mx-auto">
               <ShieldCheck size={18} />
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 mt-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link 
                 key={item.href} 
                 href={item.href} 
                 className={`flex items-center gap-3 px-3 py-3 border border-transparent transition-all group relative ${
                   isActive 
                   ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]' 
                   : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                 }`}
               >
                 <item.icon size={18} className={`shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                 {!collapsed && (
                   <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                 )}
               </Link>
             );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-elevated)] space-y-3">
          <button 
             onClick={() => setCollapsed(!collapsed)}
             className="w-full py-2 bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all group"
          >
             {collapsed ? <ChevronRight size={18} /> : (
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <ChevronLeft size={14} /> COLLAPSE_SHELL
               </div>
             )}
          </button>
          
          <div className={`flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--border)] group ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)] shrink-0 group-hover:bg-[var(--accent)] group-hover:text-[var(--bg-surface)] transition-all">
               A
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider truncate">SYSTEM_ROOT</div>
                <button 
                   onClick={handleLogout}
                   className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--danger)] transition-colors mt-1 flex items-center gap-2"
                >
                   LOGOUT_CMD <LogOut size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className={`flex-1 min-h-screen transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} bg-[var(--bg-primary)]`}>
          <div className="animate-in fade-in duration-500 h-full">
            {children}
          </div>
      </main>
    </div>
  );
}
