'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--bg-primary)]">
      <div className="relative z-10 flex flex-col items-center justify-center p-12 max-w-sm w-full mx-auto border-4 border-[var(--border)] bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
        {/* Fixed Size Technical Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="relative w-24 h-24"
        >
          <div className="w-full h-full bg-[var(--bg-elevated)] border-4 border-[var(--accent)] flex items-center justify-center">
            <svg className="w-12 h-12 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="absolute inset-0 border-4 border-[var(--accent-light)] animate-ping opacity-20"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
             <div className="w-2 h-2 bg-[var(--accent)]" />
             <div className="w-2 h-2 bg-[var(--accent-light)]" />
             <div className="w-2 h-2 bg-[var(--border)]" />
          </div>
          <h2 className="text-[var(--text-primary)] text-[16px] font-black tracking-[0.4em] uppercase italic">Waterting_Core</h2>
          <p className="text-[var(--text-secondary)] text-[10px] mt-3 font-black tracking-[0.2em] uppercase italic bg-[var(--bg-elevated)] px-4 py-1.5 border border-[var(--border)]">Establishing_Secure_Sync_Protocol...</p>
        </motion.div>
      </div>
      
      {/* Background Matrix Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}
