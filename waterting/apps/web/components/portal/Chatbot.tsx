import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  ChevronRight,
  Minimize2,
  Terminal
} from 'lucide-react';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Authorized. I am WATERTING_CORE intelligence. Providing strategic asset data.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { response } = await api.post<any>('/portal/chatbot/message', { message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error in synchronization circuit. Retry protocol.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[2000] font-sans selection:bg-primary selection:text-white">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white shadow-2xl shadow-slate-900/40 hover:bg-primary hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageSquare size={24} className="relative z-10 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </button>
      ) : (
        <div className="w-96 h-[600px] bg-white rounded-[2rem] shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-500">
          {/* Header */}
          <div className="bg-slate-900 p-6 flex justify-between items-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none">WATERTING_CORE</h3>
                   <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Synchronized</span>
                   </div>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="bg-white/5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500 transition-all border border-white/5 relative z-10">
                <Minimize2 size={16} />
             </button>
          </div>

          {/* Intelligence Stream */}
          <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto no-scrollbar bg-slate-50/50 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.role === 'bot' && (
                  <div className="flex items-center gap-2 mb-2">
                     <Terminal size={10} className="text-slate-400" />
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SYSTEM_RESPONSE</span>
                  </div>
                )}
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-semibold leading-relaxed transition-all ${
                  m.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none shadow-xl shadow-slate-900/10 border border-slate-900' 
                  : 'bg-white text-slate-900 rounded-tl-none border border-slate-200 shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex flex-col items-start space-y-2 animate-pulse">
                <div className="flex items-center gap-2">
                   <Cpu size={10} className="text-primary animate-spin" />
                   <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] italic">Synchronizing_Logic...</span>
                </div>
                <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                   <div className="w-1/2 h-full bg-primary animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            )}
          </div>

          {/* Logic Input Phase */}
          <form onSubmit={sendMessage} className="p-6 border-t border-slate-100 bg-white shadow-2xl relative">
            <div className="absolute -top-[1.5px] left-0 w-full h-[1.5px] bg-primary/20" />
            <div className="flex gap-4">
               <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    placeholder="ENTER_QUERY_PROTOCOL..." 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 transition-all transition-shadow group-hover:border-primary/20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                     <Sparkles size={14} />
                  </div>
               </div>
               <button 
                 type="submit" 
                 className="bg-slate-900 text-white px-6 rounded-xl shadow-xl shadow-slate-900/10 hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center border border-slate-900"
                 disabled={loading}
               >
                 <Send size={18} />
               </button>
            </div>
            <div className="flex justify-center mt-4">
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Authorized_Encryption_Active</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
