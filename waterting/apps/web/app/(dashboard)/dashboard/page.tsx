import { 
  Users, 
  Sparkles, 
  RefreshCcw, 
  BarChart3, 
  MapPin, 
  Coins, 
  AlertCircle, 
  Flame, 
  ArrowUpRight,
  PlusCircle,
  CalendarDays,
  Target
} from 'lucide-react';

import { formatCurrency, formatCompactCurrency, formatDate } from '@/lib/utils';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  activeLeads: number;
  totalBookings: number;
  totalRevenue: number;
  todaySiteVisits: number;
  recentLeads: any[];
  hotLeads: any[];
  staleLeadsCount: number;
  upcomingPayments: any[];
  stageDistribution: { stage: string; count: number }[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      api.get<DashboardStats>('/dashboard/stats')
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const stageLabels: Record<string, string> = {
    NEW_LEAD: 'New', CONTACTED: 'Contacted', INTERESTED: 'Interested',
    VISIT_SCHEDULED: 'Visit Sched.', VISIT_DONE: 'Visit Done',
    NEGOTIATION: 'Negotiation', BOOKING_DONE: 'Booked', LOST: 'Lost',
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <CRMLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium">Monitoring CRM vitals for {user?.name || 'Administrator'}</p>
          </motion.div>
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => router.push('/leads')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:bg-primary-dark transition-all"
          >
            <PlusCircle size={16} />
            Initialize New Lead
          </motion.button>
        </div>

        {/* Stale Leads Warning */}
        {!loading && (stats?.staleLeadsCount ?? 0) > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <div className="text-sm font-semibold">
                Critical: {stats?.staleLeadsCount} Leads have exceeded the 72-hour contact threshold.
              </div>
            </div>
            <button onClick={() => router.push('/leads?filter=stale')} className="flex items-center gap-1 text-red-600 text-xs font-black uppercase tracking-widest hover:underline">
              Remediate Now <ArrowUpRight size={14} />
            </button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <AnimatePresence mode='wait'>
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
               {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-xl" />)}
             </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5"
            >
              {[
                { label: 'Total Base', value: stats?.totalLeads, icon: Users, color: 'text-blue-600 bg-blue-50' },
                { label: 'Fresh Intake', value: stats?.newLeads, icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Active Pipeline', value: stats?.activeLeads, icon: RefreshCcw, color: 'text-amber-600 bg-amber-50' },
                { label: 'Closed Deals', value: stats?.totalBookings, icon: Target, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Daily Visits', value: stats?.todaySiteVisits, icon: MapPin, color: 'text-sky-600 bg-sky-50' },
                { label: 'Net Value', value: formatCompactCurrency(stats?.totalRevenue ?? 0), icon: Coins, color: 'text-slate-900 bg-slate-100' },
              ].map((stat, idx) => (
                <motion.div key={idx} variants={item} className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">{stat.label}</span>
                    <stat.icon size={16} className={stat.color.split(' ')[0]} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 leading-none">{stat.value ?? 0}</div>
                    <div className="mt-2 h-1 w-8 bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full w-2/3 ${stat.color.split(' ')[0].replace('text', 'bg')}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* AI High Engagement Section */}
            {!loading && (stats?.hotLeads?.length ?? 0) > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/20 transition-all" />
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h3 className="text-lg font-black flex items-center gap-2">
                       <Flame size={18} className="text-orange-500" />
                       Intelligence Insights: High Engagement
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 font-medium italic">Advanced scoring indicates high conversion probability for these prospects.</p>
                  </div>
                  <div className="bg-slate-800 px-3 py-1 rounded text-[10px] font-black border border-slate-700 tracking-tighter">PREDICTIVE SCORE</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {stats?.hotLeads?.slice(0, 4).map((lead: any) => (
                    <div 
                      key={lead.id} 
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500/50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-sm text-slate-100">{lead.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.phone}</div>
                        </div>
                        <div className="text-blue-400 text-xs font-black">
                          {lead.score || 95}%
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className="text-[9px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-bold uppercase tracking-widest">{lead.source}</span>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                           <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                           Priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {!loading && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Intake Ledger</h3>
                  <button onClick={() => router.push('/leads')} className="text-primary text-[11px] font-black uppercase tracking-tighter hover:underline">Full Audit &rarr;</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-50/80">
                          <th className="px-6 py-3 border-b border-slate-100">Identity</th>
                          <th className="px-6 py-3 border-b border-slate-100">Origin</th>
                          <th className="px-6 py-3 border-b border-slate-100">Phase</th>
                          <th className="px-6 py-3 border-b border-slate-100">Custodian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats?.recentLeads?.map((lead: any) => (
                          <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="hover:bg-slate-50/80 cursor-pointer transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{lead.name}</div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">{lead.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600 border border-slate-200">
                                {lead.source}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-blue-50 text-primary border border-blue-100">
                                {stageLabels[lead.stage] || lead.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs font-medium italic">{lead.assignedTo?.name || 'Unassigned'}</td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {!loading && (
              <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-7 shadow-xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                   <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                     <BarChart3 size={16} className="text-blue-500" />
                     Pipeline Logic
                   </h3>
                </div>
                <div className="space-y-6">
                  {stats?.stageDistribution?.map((s) => (
                    <div key={s.stage} className="space-y-2.5">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stageLabels[s.stage] || s.stage}</span>
                        <span className="text-xs font-mono font-bold text-slate-300">{s.count}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${(s.count / (stats.totalLeads || 1)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-500">
                   <span>TOTAL ASSETS</span>
                   <span className="text-white font-mono">{stats?.totalLeads}</span>
                </div>
              </div>
            )}

            {!loading && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-7">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <CalendarDays size={16} className="text-primary" />
                   Settlements
                 </h3>
                 <div className="space-y-4">
                    {stats?.upcomingPayments?.length ? stats.upcomingPayments.map((p: any) => (
                      <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                           <span className="font-black text-slate-900 text-sm tracking-tight">₹{p.amount.toLocaleString()}</span>
                           <span className="text-[9px] font-black text-primary bg-primary-light px-2 py-0.5 rounded uppercase border border-primary/20">{formatDate(p.dueDate)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Unit {p.booking.unit.unitNumber} • {p.booking.buyerName}</div>
                      </div>
                    )) : (
                      <div className="text-xs text-slate-400 text-center py-6 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">No overdue settlements.</div>
                    )}
                 </div>
                 <button onClick={() => router.push('/bookings')} className="w-full mt-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors border border-slate-100 rounded-lg">Open Ledger &rarr;</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
