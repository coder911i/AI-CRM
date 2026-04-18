export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#020617] z-[9999] flex flex-col items-center justify-center">
      {/* Premium Loader */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      <p className="mt-6 text-slate-400 text-sm font-medium tracking-widest uppercase animate-pulse">
        Optimizing Experience...
      </p>
    </div>
  );
}
