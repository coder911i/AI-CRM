'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { 
  Handshake, 
  ShieldAlert, 
  Clock, 
  ArrowRightLeft, 
  Activity, 
  FileText, 
  MoreHorizontal, 
  User, 
  Building2, 
  ChevronRight,
  TrendingUp,
  Search
} from 'lucide-react';

export default function AdminDeals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/deals').then(res => {
      setDeals(Array.isArray(res) ? res : []);
      setLoading(false);
    }).catch(() => {
      setDeals([]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-[var(--bg-primary)] p-6 min-h-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div>
           <h2 className="text-[24px] font-bold text-[var(--text-primary)] uppercase tracking-wide italic">Allocation Command</h2>
           <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mt-1">Authorized revenue supervision and allocation intervention</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH TRANSACTIONS..." 
                className="bg-[var(--bg-surface)] border border-[var(--border)] pl-10 pr-4 py-2 text-[10px] font-bold tracking-wider uppercase outline-none focus:border-[var(--accent)] transition-all w-64"
              />
           </div>
           <button className="bg-[var(--accent-light)] text-[var(--accent)] px-6 py-2 border-2 border-[var(--accent)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-2">
              Audit Logs <FileText size={14} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Pipeline', value: deals.length, icon: TrendingUp, color: 'text-[var(--accent)]' },
          { label: 'Oversight Alerts', value: deals.filter(d => d.fraudFlag).length, icon: ShieldAlert, color: 'text-[var(--danger)]' },
          { label: 'Allocation Swap', value: '24H', icon: ArrowRightLeft, color: 'text-[var(--success)]' },
          { label: 'Registry Uptime', value: '100%', icon: Activity, color: 'text-[var(--accent)]' },
        ].map((kpi, i) => (
          <div key={i} className="bg-[var(--bg-surface)] p-6 border border-[var(--border)] flex items-center gap-4 hover:border-[var(--accent)] transition-all">
             <div className={`p-2 border border-[var(--border)] ${kpi.color}`}>
                <kpi.icon size={20} />
             </div>
             <div>
                <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{kpi.label}</div>
                <div className="text-[18px] font-bold text-[var(--text-primary)] tracking-tight uppercase">{kpi.value}</div>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
           <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <Handshake size={14} className="text-[var(--accent)]" />
              Corporate Allocation Master Registry
           </h3>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[var(--success)] animate-pulse" />
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider italic">Live Ledger Synchronization</span>
           </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
             <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Aggregating Transactional Data...</span>
          </div>
        ) : deals.length === 0 ? (
          <div className="p-32 text-center flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                <Activity size={32} />
             </div>
             <div className="space-y-1">
                <h4 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Registry Vacuum</h4>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight italic">Zero active transactions discovered.</p>
             </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Transaction Hash</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Asset Identity</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Logistician</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">State</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase">Sync</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase text-right">Oversight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {deals.map((d: any) => (
                  <tr key={d.id} className="hover:bg-[var(--bg-elevated)] transition-all group/row">
                    <td className="px-4 py-4 text-[11px] font-bold text-[var(--text-primary)] font-mono uppercase">
                       {d.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)] shrink-0">L</div>
                          <div className="flex flex-col">
                             <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1">{d.lead.name}</span>
                             <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase font-mono">{d.lead.phone}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-2">
                          <User size={12} className="text-[var(--text-muted)]" />
                          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">{d.broker?.name || 'GENERIC_BUFFER'}</span>
                       </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border leading-none ${
                         d.fraudFlag 
                         ? 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)] animate-pulse' 
                         : d.status === 'CLOSED' 
                         ? 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]' 
                         : 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]'
                      }`}>
                        {d.status} {d.fraudFlag ? '(FLAGGED)' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase italic">
                          <Clock size={12} /> {new Date(d.updatedAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                       </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="px-4 py-2 bg-[var(--accent-light)] border-2 border-[var(--accent)] text-[var(--accent)] text-[10px] font-bold uppercase hover:bg-[var(--bg-elevated)] opacity-0 group-hover/row:opacity-100 flex items-center gap-2 ml-auto">
                        Protocol Intervene <ChevronRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
