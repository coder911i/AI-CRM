import { 
  LayoutGrid, 
  Building2, 
  Users2, 
  Calendar, 
  Briefcase, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, href: '/owner/dashboard' },
    { label: 'My Properties', icon: Building2, href: '/owner/properties' },
    { label: 'Leads', icon: Users2, href: '/owner/leads' },
    { label: 'Visits', icon: Calendar, href: '/owner/visits' },
    { label: 'Deals', icon: Briefcase, href: '/owner/deals' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('waterting_token');
    router.push('/owner/login');
  };

  if (pathname.includes('/owner/login')) return <>{children}</>;

  return (
    <div className="crm-layout">
      <aside className={`crm-sidebar ${collapsed ? 'collapsed' : ''} border-r border-slate-200 shadow-xl`}>
        <div className="sidebar-header border-b border-slate-50 py-6 px-6">
           <div className="logo flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-primary shadow-lg scale-90">
                 <ShieldCheck size={20} />
              </div>
              {!collapsed && (
                 <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                    Waterting <span className="block text-[8px] text-slate-400">Developer Portal</span>
                 </h1>
              )}
           </div>
           <button className="collapse-btn hover:bg-slate-50 p-1.5 rounded-lg transition-colors border border-slate-100" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
           </button>
        </div>
        
        <div className="px-3 py-6 space-y-8">
           <div className="space-y-1">
              <label className={`text-[9px] font-black text-slate-300 uppercase tracking-widest px-3 mb-2 block ${collapsed ? 'text-center' : ''}`}>
                 {collapsed ? '—' : 'Main Intelligence'}
              </label>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`nav-item rounded-xl flex items-center gap-3 px-3 py-2.5 transition-all group ${
                       pathname === item.href 
                       ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                       : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`nav-icon transition-colors ${pathname === item.href ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} size={18} />
                    {!collapsed && <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>}
                  </Link>
                ))}
              </nav>
           </div>
        </div>

        <div className="mt-auto px-4 py-8 border-t border-slate-50">
           <div className={`flex items-center gap-4 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner group cursor-pointer hover:bg-primary transition-all">
                 <Activity size={20} className="group-hover:text-white" />
              </div>
              {!collapsed && (
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter truncate">Executive Partner</p>
                    <button className="text-[9px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center gap-1 mt-0.5" onClick={handleLogout}>
                       <LogOut size={10} /> Deauthorize System
                    </button>
                 </div>
              )}
           </div>
        </div>
      </aside>

      <main className="crm-content bg-slate-50/30">
        {children}
      </main>
    </div>
  );
}
