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
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary selection:text-white">
      {/* Precision Sidebar Shell */}
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
                  <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1 block">MASTER_CMD</span>
               </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 mx-auto">
               <ShieldCheck size={18} />
            </div>
          )}
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link 
                 key={item.href} 
                 href={item.href} 
                 className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative ${
                   isActive 
                   ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-2' 
                   : 'text-slate-400 hover:bg-white/5 hover:text-white'
                 }`}
               >
                 <item.icon size={20} className={`shrink-0 transition-transform ${collapsed ? 'mx-auto' : ''} ${isActive ? 'scale-110' : 'group-hover:scale-110 duration-300'}`} />
                 {!collapsed && (
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-left-2 duration-300">{item.label}</span>
                 )}
                 {isActive && !collapsed && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                 )}
               </Link>
             );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-slate-950/20 space-y-4">
          <button 
             onClick={() => setCollapsed(!collapsed)}
             className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 group"
          >
             {collapsed ? <ChevronRight size={18} /> : (
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> COLLAPSE_SHELL
               </div>
             )}
          </button>
          
          <div className={`flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-rose-500/10 hover:border-rose-500/20 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-white shrink-0 group-hover:bg-rose-500 transition-colors">
               A
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-white uppercase tracking-widest truncate">SYSTEM_ROOT</div>
                <button 
                   onClick={handleLogout}
                   className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors mt-1 flex items-center gap-2"
                >
                   LOGOUT_CMD <LogOut size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <main className={`flex-1 min-h-screen transition-all duration-500 ${collapsed ? 'ml-24' : 'ml-72'} p-12 bg-white relative`}>
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-transparent opacity-30" />
         <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
         </div>
      </main>
    </div>
  );
}
