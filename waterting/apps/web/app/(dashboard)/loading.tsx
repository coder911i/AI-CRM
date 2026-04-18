'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#020617]">
      <div className="relative z-10 flex flex-col items-center justify-center p-10 max-w-sm w-full mx-auto">
        {/* Fixed Size Pulse Icon */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-20 h-20"
        >
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-blue-500/10 animate-ping"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 text-center"
        >
          <h2 className="text-white text-sm font-black tracking-[0.3em] uppercase">Waterting</h2>
          <p className="text-slate-500 text-[10px] mt-2 font-medium tracking-widest">ESTABLISHING SECURE SESSION...</p>
        </motion.div>
      </div>
    </div>
  );
}
