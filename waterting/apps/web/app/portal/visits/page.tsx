import { 
  CalendarClock, 
  UserCheck, 
  MapPin, 
  QrCode, 
  Activity, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  History,
  Building2,
  Calendar
} from 'lucide-react';

export default function VisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/portal/visits')
      .then(setVisits)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const upcomingVisits = visits.filter(v => new Date(v.scheduledAt) > new Date());
  const pastVisits = visits.filter(v => new Date(v.scheduledAt) <= new Date());

  return (
    <div className="max-w-[1240px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Physical Logistics</h2>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Authorized site visit synchronization</p>
        </div>
        <button className="btn btn-primary px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 flex items-center gap-3">
           Initialize Schedule <CalendarClock size={16} />
        </button>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
           <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Active Authorizations</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {upcomingVisits.map((v: any) => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="md:w-32 bg-slate-900 flex flex-col items-center justify-center py-6 text-white group-hover:bg-primary transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60">
                    {new Date(v.scheduledAt).toLocaleString('en', { month: 'short' })}
                  </span>
                  <span className="text-4xl font-black tracking-tighter">
                    {new Date(v.scheduledAt).getDate()}
                  </span>
                </div>
                <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-100 bg-emerald-50 text-emerald-600">AUTHORIZED</span>
                         <span className="text-[9px] font-black text-slate-300 font-mono tracking-tighter">REF: VS-{v.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors">{v.lead?.project?.name || 'GENERIC_INVENTORY_TOUR'}</h4>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            <Clock size={12} /> {new Date(v.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            <MapPin size={12} /> PROJECT_SITE_FLOOR
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-8 border-l border-slate-100 pl-8">
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                            <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{v.agent?.name || 'SALES_OFFICER'}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Assigned Logistician</div>
                         </div>
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 uppercase">{v.agent?.name?.charAt(0)}</div>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all">
                            <QrCode size={18} />
                         </button>
                         <button className="btn btn-secondary px-6 py-3 text-[9px] font-black uppercase tracking-widest border-slate-200">Reschedule</button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
          {upcomingVisits.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 shadow-inner text-center flex flex-col items-center gap-4">
              <Activity size={24} className="text-slate-200" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Zero active authorizations discovered in current cycle</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Historical Registry</h3>
           </div>
           <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
              Sync Full Archive <History size={12} />
           </button>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Category</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Synchronization</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol State</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Operational Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pastVisits.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-50/30 transition-all">
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-3">
                        <Building2 size={14} className="text-primary" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{v.lead?.project?.name}</span>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-slate-500 font-mono uppercase tracking-tighter">
                     {new Date(v.scheduledAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: '2-digit' })}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                       v.outcome === 'INTERESTED' 
                       ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                       : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {v.outcome || 'CONCLUDED'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                     <p className="text-[10px] text-slate-400 font-medium italic lowercase tracking-tighter truncate max-w-[240px]">{v.notes || 'NO_SIGNIFICANT_FEEDBACK_LOGGED'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pastVisits.length === 0 && (
            <div className="p-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
               Archive is currently unpopulated
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
