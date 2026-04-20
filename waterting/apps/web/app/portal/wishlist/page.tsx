import { 
  Heart, 
  Building2, 
  ClipboardList, 
  MapPin, 
  IndianRupee, 
  MessageSquare, 
  ArrowRight, 
  Trash2,
  Share2,
  FileSearch,
  Activity
} from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/portal/wishlist')
      .then(setWishlist)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (id: string) => {
    try {
      await api.delete(`/portal/wishlist/${id}`);
      setWishlist(wishlist.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="max-w-[1240px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Portfolio Watchlist</h2>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">High-intent asset selection registry</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
           <Activity size={14} className="text-emerald-500" />
           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">{wishlist.length} Assets Tracked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wishlist.map((item: any) => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
            <div className="h-[220px] bg-slate-50 relative group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
               <div className="absolute top-4 right-4 z-20 flex gap-2">
                 <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-100 shadow-lg hover:text-slate-900 transition-colors">
                   <Share2 size={16} />
                 </button>
                 <button 
                   onClick={() => removeItem(item.id)}
                   className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-rose-500 border border-slate-100 shadow-lg hover:bg-rose-50 transition-all"
                 >
                   <Heart size={16} fill="currentColor" />
                 </button>
               </div>
               
               <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50 animate-pulse border-b border-slate-100">
                  <Building2 size={48} className="group-hover:scale-110 transition-transform duration-500" />
               </div>
            </div>

            <div className="p-8 flex-1 flex flex-col gap-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase group-hover:text-primary transition-colors">{item.project?.name || item.property?.title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1 italic">
                   <MapPin size={10} /> {item.project?.location || item.property?.location}
                </p>
              </div>
              
              <div className="flex items-center justify-between py-4 border-y border-slate-50">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Valuation</span>
                   <div className="text-xl font-black text-slate-900 tracking-tighter font-mono flex items-center">
                     <IndianRupee size={16} className="text-slate-400" /> {(item.project?.basePrice || item.property?.price || 0).toLocaleString()}
                   </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-primary/20 bg-primary/5 text-primary">
                  {item.project?.type || item.property?.type || 'RESIDENTIAL'}
                </span>
              </div>

              <div className="flex gap-3 mt-auto pt-2">
                <button className="flex-[1.5] btn btn-primary py-3.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                   Initialize Inquiry <MessageSquare size={12} />
                </button>
                <button className="flex-1 btn btn-secondary py-3.5 text-[9px] font-black uppercase tracking-widest group-hover:bg-slate-900 group-hover:text-white transition-all">
                   Full Dossier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {wishlist.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner p-20 text-center flex flex-col items-center gap-8 group">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
             <ClipboardList size={48} />
          </div>
          <div className="space-y-2">
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Registry Vacuum</h3>
             <p className="text-[11px] text-slate-400 font-medium italic uppercase tracking-tighter max-w-[320px] mx-auto leading-relaxed">System discovery indicates zero high-priority assets have been categorized for tracking. Initialize discovery to proceed.</p>
          </div>
          <Link href="/portal/dashboard" className="btn btn-primary px-10 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 flex items-center gap-3">
             Discovery Matrix <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
