'use client';

import { useEffect, useState } from 'react';
import CRMLayout from '@/components/CRMLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  activeLeads: number;
  totalBookings: number;
  totalRevenue: number;
  todaySiteVisits: number;
  recentLeads: any[];
  stageDistribution: { stage: string; count: number }[];
}

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-800/10 rounded-xl ${className}`}></div>
);

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

  const formatCurrency = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
  const stageLabels: Record<string, string> = {
    NEW_LEAD: 'New', CONTACTED: 'Contacted', INTERESTED: 'Interested',
    VISIT_SCHEDULED: 'Visit Sched.', VISIT_DONE: 'Visit Done',
    NEGOTIATION: 'Negotiation', BOOKING_DONE: 'Booked', LOST: 'Lost',
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <CRMLayout>
      <div className="p-1 sm:p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div initial={{ filter: 'blur(10px)', opacity: 0 }} animate={{ filter: 'blur(0px)', opacity: 1 }}>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user?.name?.split(' ')[0] || 'User'}! Here&apos;s your daily overview.</p>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/leads/new')}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            + Create New Lead
          </motion.button>
        </div>

        {/* Stats Grid */}
        <AnimatePresence mode='wait'>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
               {/* Minimalist waiting state */}
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
            >
              {[
                { label: 'Total Leads', value: stats?.totalLeads, icon: '👥', color: 'bg-blue-50 text-blue-600' },
                { label: 'New Leads', value: stats?.newLeads, icon: '✨', color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Active Pipeline', value: stats?.activeLeads, icon: '📋', color: 'bg-amber-50 text-amber-600' },
                { label: 'Bookings', value: stats?.totalBookings, icon: '📊', color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Revenue', value: formatCurrency(stats?.totalRevenue ?? 0), icon: '💰', color: 'bg-rose-50 text-rose-600' },
                { label: 'Today Visits', value: stats?.todaySiteVisits, icon: '📍', color: 'bg-sky-50 text-sky-600' },
              ].map((stat, idx) => (
                <motion.div key={idx} variants={item} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-xl mb-4`}>
                    {stat.icon}
                  </div>
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{stat.value ?? 0}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!loading && (
              <motion.div initial={{ y: 20, filter: 'blur(10px)', opacity: 0 }} animate={{ y: 0, filter: 'blur(0px)', opacity: 1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-bottom flex items-center justify-between border-b border-slate-50">
                  <h3 className="font-bold text-slate-900">Recent Prospects</h3>
                  <button onClick={() => router.push('/leads')} className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                          <th className="px-8 py-4">Name</th>
                          <th className="px-8 py-4">Source</th>
                          <th className="px-8 py-4">Status</th>
                          <th className="px-8 py-4">Agent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {stats?.recentLeads?.map((lead: any) => (
                          <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="hover:bg-slate-50/50 cursor-pointer transition-colors group">
                            <td className="px-8 py-4">
                              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{lead.name}</div>
                              <div className="text-xs text-slate-400">{lead.phone}</div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                {lead.source}
                              </span>
                            </td>
                            <td className="px-8 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {stageLabels[lead.stage] || lead.stage}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-slate-600 text-sm">{lead.assignedTo?.name || 'Unassigned'}</td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            {!loading && (
              <motion.div initial={{ x: 20, filter: 'blur(10px)', opacity: 0 }} animate={{ x: 0, filter: 'blur(0px)', opacity: 1 }} className="bg-[#020617] text-white rounded-3xl p-8 shadow-xl shadow-slate-900/20">
                <h3 className="text-lg font-bold mb-6">Pipeline Health</h3>
                <div className="space-y-6">
                  {stats?.stageDistribution?.map((s) => (
                    <div key={s.stage} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{stageLabels[s.stage] || s.stage}</span>
                        <span className="font-bold">{s.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${(s.count / (stats.totalLeads || 1)) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
