'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';
import CRMLayout from '@/components/CRMLayout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
  Target,
  Loader2,
  Clock
} from 'lucide-react';

import { formatCompactCurrency, formatDate } from '@/lib/utils';

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
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30D');

  const fetchStats = useCallback(async (range: string = '30D') => {
    try {
      const data = await api.get<DashboardStats>(`/dashboard/stats?range=${range}`);
      setStats(data);
    } catch (err: any) {
      toast.error('Failed to synchronize operational intelligence');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      fetchStats(timeRange);
    }
  }, [user, authLoading, router, fetchStats, timeRange]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchStats(timeRange).then(() => {
      toast.success('Matrix synchronization successful');
    });
  };

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
      <div className="bg-[var(--bg-primary)] min-h-full p-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-4 border-[var(--border)]">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
             <div className="flex items-center gap-2 text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em] mb-3">
                <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
                Operational_Intelligence_Core
             </div>
             <h1 className="text-[26px] font-black text-[var(--text-primary)] uppercase tracking-tight italic">Executive_Control_Matrix</h1>
             <p className="text-[var(--text-secondary)] text-[11px] font-bold uppercase mt-2 italic">Authorized_Proxy: {user?.name?.toUpperCase() || 'ROOT_ADMIN'}</p>
          </motion.div>
          <div className="flex gap-4">
             <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={16} />
                <select 
                   value={timeRange}
                   onChange={(e) => setTimeRange(e.target.value)}
                   className="pl-12 pr-10 py-3 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[11px] font-black uppercase italic outline-none focus:border-[var(--accent)] appearance-none cursor-pointer transition-all"
                >
                   <option value="7D">OPERATIONAL_WINDOW: 7D</option>
                   <option value="30D">OPERATIONAL_WINDOW: 30D</option>
                   <option value="90D">OPERATIONAL_WINDOW: 90D</option>
                   <option value="ALL">OPERATIONAL_WINDOW: TOTAL</option>
                </select>
             </div>
             <button 
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="px-6 py-3 bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] text-[11px] font-black uppercase italic hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2"
             >
                {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} REFRESH_MATRIX
             </button>
             <button 
                onClick={() => router.push('/leads')}
                className="px-8 py-3 bg-[var(--accent)] border-2 border-[var(--accent)] text-white text-[11px] font-black uppercase italic hover:bg-white hover:text-[var(--accent)] transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_var(--accent-light)]"
             >
                <PlusCircle size={18} /> INITIALIZE_INTAKE
             </button>
          </div>
        </div>

        {!loading && (stats?.staleLeadsCount ?? 0) > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--danger-bg)] border-2 border-[var(--danger)] p-6 flex items-center justify-between shadow-[8px_8px_0px_0px_var(--danger-bg)]"
          >
            <div className="flex items-center gap-5 text-[var(--danger)]">
              <AlertCircle size={28} />
              <div className="text-[11px] font-black uppercase tracking-widest leading-relaxed italic">
                CRITICAL_ALERT: {stats?.staleLeadsCount} IDENTITIES EXCEEDED ENGAGEMENT_THRESHOLD. <br/>
                <span className="text-[9px] opacity-70 italic tracking-tighter">IMMEDIATE CORRECTIVE PROTOCOL REQUIRED.</span>
              </div>
            </div>
            <button 
               onClick={() => router.push('/leads?filter=stale')} 
               className="flex items-center gap-3 text-white bg-[var(--danger)] text-[10px] font-black uppercase px-6 py-2 hover:bg-white hover:text-[var(--danger)] border-2 border-[var(--danger)] transition-all italic"
            >
              REMEDIATE_FLOW <ArrowUpRight size={16} />
            </button>
          </motion.div>
        )}

        <AnimatePresence mode='wait'>
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
               {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 animate-pulse bg-[var(--bg-elevated)] border-2 border-[var(--border)] shadow-[4px_4px_0px_0px_var(--border)]" />)}
             </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
            >
              {[
                { label: 'Entity_Base', value: stats?.totalLeads, icon: Users, color: 'text-[var(--accent)]' },
                { label: 'Fresh_Intake', value: stats?.newLeads, icon: Sparkles, color: 'text-[var(--success)]' },
                { label: 'Active_Pipeline', value: stats?.activeLeads, icon: RefreshCcw, color: 'text-[var(--warning)]' },
                { label: 'Closed_Deals', value: stats?.totalBookings, icon: Target, color: 'text-[var(--accent)]' },
                { label: 'Daily_Visits', value: stats?.todaySiteVisits, icon: MapPin, color: 'text-[var(--accent)]' },
                { label: 'Net_Value_Index', value: formatCompactCurrency(stats?.totalRevenue ?? 0), icon: Coins, color: 'text-[var(--text-primary)]' },
              ].map((stat, idx) => (
                <motion.div key={idx} variants={item} className="bg-[var(--bg-surface)] border-2 border-[var(--border)] p-6 transition-all flex flex-col justify-between h-40 hover:border-[var(--accent)] group shadow-[6px_6px_0px_0px_var(--border)] hover:shadow-[6px_6px_0px_0px_var(--accent-light)]">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic">{stat.label}</span>
                    <stat.icon size={20} className={`${stat.color} group-hover:scale-125 transition-transform`} />
                  </div>
                  <div className="space-y-4">
                    <div className="text-[32px] font-black tabular-nums text-[var(--text-primary)] font-mono italic leading-none">{stat.value ?? 0}</div>
                    <div className="h-2 w-full bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: '70%' }} 
                          className="h-full bg-[var(--accent)]" 
                       />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {!loading && (stats?.hotLeads?.length ?? 0) > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[var(--bg-surface)] border-2 border-[var(--border)] p-10 text-[var(--text-primary)] relative overflow-hidden shadow-[12px_12px_0px_0px_var(--border)]">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12"><Flame size={180} /></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                  <div>
                    <h3 className="text-[16px] font-black flex items-center gap-4 uppercase tracking-widest italic">
                       <Flame size={24} className="text-[var(--warning)] animate-pulse" />
                       Intelligence_Matrix: High_Velocity_Targets
                    </h3>
                    <p className="text-[var(--text-secondary)] text-[11px] mt-2 font-black italic uppercase tracking-tight opacity-70">Predictive neural scoring identifying immediate conversion opportunities.</p>
                  </div>
                  <div className="bg-[var(--bg-elevated)] px-6 py-3 border-2 border-[var(--border)] text-[10px] font-black uppercase tracking-widest italic text-[var(--accent)]">
                     SCORING_MATRIX:_NOMINAL
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {stats?.hotLeads?.slice(0, 4).map((lead: any) => (
                    <div 
                      key={lead.id} 
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      className="bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border-2 border-[var(--border)] p-6 cursor-pointer transition-all hover:border-[var(--accent)] flex flex-col justify-between h-36 group shadow-[4px_4px_0px_0px_var(--border)]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-black text-[15px] text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors italic leading-none">{lead.name}</div>
                          <div className="text-[10px] text-[var(--text-secondary)] mt-2 font-mono italic opacity-60">{lead.phone}</div>
                        </div>
                        <div className="text-[var(--accent)] text-[22px] font-black font-mono italic">
                          {lead.score || 95}<span className="text-[11px] opacity-40 ml-0.5">%</span>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="text-[9px] bg-[var(--bg-elevated)] border border-[var(--border)] px-3 py-1 text-[var(--text-secondary)] font-black uppercase tracking-tighter italic">{lead.source}</span>
                        <div className="h-px flex-1 bg-[var(--border)]" />
                        <span className="text-[10px] text-[var(--success)] font-black uppercase flex items-center gap-2 italic tracking-tighter">
                           <div className="w-2 h-2 bg-[var(--success)] animate-pulse" /> TARGET_READY
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {!loading && (
              <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] shadow-[12px_12px_0px_0px_var(--border)] overflow-hidden">
                <div className="flex items-center justify-between border-b-2 border-[var(--border)] bg-[var(--bg-elevated)] px-8 py-5">
                  <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest italic flex items-center gap-4">
                     <BarChart3 size={20} className="text-[var(--accent)]" />
                     Primary_Operational_Ledger
                  </h3>
                  <button onClick={() => router.push('/leads')} className="text-[var(--accent)] text-[10px] font-black uppercase border-2 border-[var(--accent)] px-6 py-2 hover:bg-[var(--accent)] hover:text-white transition-all italic tracking-widest">FULL_SYNC_LEDGER &rarr;</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--bg-elevated)]">
                          <th className="px-8 py-5 border-r border-[var(--border)]">Entity_Identity_Label</th>
                          <th className="px-8 py-5 border-r border-[var(--border)]">Origin_Vector</th>
                          <th className="px-8 py-5 border-r border-[var(--border)]">Phase_State</th>
                          <th className="px-8 py-5">Proxy_Custodian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-[var(--border)]">
                        {stats?.recentLeads?.map((lead: any) => (
                          <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors group">
                            <td className="px-8 py-6 border-r border-[var(--border)]">
                              <div className="font-black text-[var(--text-primary)] text-[14px] group-hover:text-[var(--accent)] transition-colors uppercase italic leading-none">{lead.name}</div>
                              <div className="text-[10px] text-[var(--text-secondary)] mt-2 font-mono italic opacity-60">{lead.phone}</div>
                            </td>
                            <td className="px-8 py-6 border-r border-[var(--border)]">
                              <span className="inline-flex items-center px-4 py-1.5 text-[10px] font-black uppercase bg-[var(--bg-surface)] border-2 border-[var(--border)] tracking-widest italic">
                                {lead.source}
                              </span>
                            </td>
                            <td className="px-8 py-6 border-r border-[var(--border)]">
                              <span className="inline-flex items-center px-4 py-1.5 text-[10px] font-black uppercase bg-[var(--accent-light)] text-[var(--accent)] border-2 border-[var(--accent)] tracking-widest italic">
                                {stageLabels[lead.stage] || lead.stage}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-[var(--text-secondary)] text-[12px] font-black italic uppercase tracking-tight">{lead.assignedTo?.name || 'VOID_ASSIGNMENT'}</td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-12">
            {!loading && (
              <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] p-8 shadow-[12px_12px_0px_0px_var(--border)]">
                <div className="flex items-center justify-between mb-10 pb-5 border-b-2 border-[var(--border)] border-dashed">
                   <h3 className="text-[14px] font-black uppercase flex items-center gap-4 text-[var(--text-primary)] tracking-widest italic">
                     <Target size={20} className="text-[var(--accent)]" />
                     Pipeline_Logic_Status
                   </h3>
                </div>
                <div className="space-y-10">
                  {stats?.stageDistribution?.map((s) => (
                    <div key={s.stage} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic">{stageLabels[s.stage] || s.stage}</span>
                        <span className="text-[13px] font-black text-[var(--text-primary)] font-mono italic">{s.count}</span>
                      </div>
                      <div className="h-2.5 w-full bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${(s.count / (stats.totalLeads || 1)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-[var(--accent)] shadow-[2px_0px_4px_rgba(0,0,0,0.1)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12 pt-8 border-t-2 border-[var(--border)] border-dashed flex justify-between items-center text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic">
                   <span>Aggregated_Assets_Count</span>
                   <span className="text-[var(--text-primary)] font-mono italic text-[18px]">{stats?.totalLeads}</span>
                </div>
              </div>
            )}

            {!loading && (
              <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] p-8 shadow-[12px_12px_0px_0px_var(--border)]">
                 <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase mb-10 flex items-center gap-4 tracking-widest italic">
                   <CalendarDays size={22} className="text-[var(--accent)]" />
                   Settlement_Ledger
                 </h3>
                 <div className="space-y-6">
                    {stats?.upcomingPayments?.length ? stats.upcomingPayments.map((p: any) => (
                      <div 
                         key={p.id} 
                         onClick={() => router.push(`/bookings/${p.bookingId}`)}
                         className="p-6 bg-[var(--bg-elevated)] border-2 border-[var(--border)] hover:border-[var(--accent)] transition-all group cursor-pointer shadow-[4px_4px_0px_0px_var(--border)] hover:shadow-[4px_4px_0px_0px_var(--accent-light)]"
                      >
                        <div className="flex justify-between items-start mb-4">
                           <span className="font-black text-[var(--text-primary)] text-[20px] font-mono italic group-hover:text-[var(--accent)] transition-colors">₹{p.amount.toLocaleString()}</span>
                           <span className="text-[10px] font-black text-[var(--accent)] bg-[var(--accent-light)] px-3 py-1.5 border-2 border-[var(--accent)] uppercase tracking-tighter italic">{formatDate(p.dueDate)}</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest italic opacity-70">Unit {p.booking?.unit?.unitNumber || 'NULL'} • {p.booking?.buyerName || 'ANONYMOUS'}</div>
                      </div>
                    )) : (
                      <div className="text-[11px] text-[var(--text-muted)] text-center py-16 italic bg-[var(--bg-primary)] border-4 border-dashed border-[var(--border)] uppercase font-black tracking-widest opacity-40">
                        STATUS_NORMAL:_ZERO_OVERDUE_SETTLEMENTS
                      </div>
                    )}
                 </div>
                 <button onClick={() => router.push('/bookings')} className="w-full mt-10 py-4 text-[11px] font-black uppercase text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all border-2 border-[var(--border)] italic tracking-widest">OPEN_FINANCIAL_MATRIX &rarr;</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
