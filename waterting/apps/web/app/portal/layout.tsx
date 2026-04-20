'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  FileText, 
  Heart, 
  MapPin, 
  LifeBuoy, 
  Building2, 
  LogOut, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Chatbot } from '@/components/portal/Chatbot';

const navItems = [
  { label: 'Overview', href: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'Payments', href: '/portal/payments', icon: CreditCard },
  { label: 'Documents', href: '/portal/documents', icon: FileText },
  { label: 'Wishlist', href: '/portal/wishlist', icon: Heart },
  { label: 'Visits', href: '/portal/visits', icon: MapPin },
  { label: 'Support', href: '/portal/tickets', icon: LifeBuoy },
  { label: 'Property', href: '/portal/property', icon: Building2 },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/portal/login';

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
           <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-primary/20">W</div>
                    <h1 className="text-sm font-black text-white tracking-widest uppercase hidden md:block">Waterting <span className="text-slate-500">Asset Portal</span></h1>
                 </div>
                 <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block" />
                 <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                    <ShieldCheck size={12} className="text-emerald-500" /> Authorized Access Only
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 bg-slate-800/30 px-3 py-1.5 rounded-xl border border-slate-700/30">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[8px] font-black text-white">U</div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block">Authenticated User</span>
                    <ChevronDown size={12} className="text-slate-500" />
                 </div>
                 <button className="p-2 text-slate-500 hover:text-white transition-colors" onClick={() => { localStorage.removeItem('waterting_portal_token'); window.location.href = '/portal/login'; }}>
                    <LogOut size={18} />
                 </button>
              </div>
           </div>
        </div>
        <div className="bg-slate-900/50 border-t border-slate-800/50 backdrop-blur-md">
           <div className="max-w-7xl mx-auto px-4 md:px-8">
              <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                 {navItems.map(item => (
                   <Link 
                     key={item.href} 
                     href={item.href} 
                     className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                       pathname === item.href 
                       ? 'text-white border-primary bg-primary/5' 
                       : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                     }`}
                   >
                     <item.icon size={14} className={pathname === item.href ? 'text-primary' : 'text-slate-500'} />
                     {item.label}
                   </Link>
                 ))}
              </nav>
           </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 md:px-8 min-h-[calc(100vh-140px)]">
        {children}
      </main>
      <Chatbot />
    </div>
  );
}
