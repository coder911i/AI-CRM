'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden">
      {/* Deep Blur Backdrop */}
      <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-xl z-0"></div>
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full z-0 animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* The 'Handshake' / Heartbeat Pulse Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)]">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          {/* Ripple rings */}
          <div className="absolute inset-0 rounded-3xl bg-blue-500/20 animate-ping"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <h2 className="text-white text-lg font-bold tracking-[0.2em] uppercase">Waterting</h2>
          <div className="flex items-center gap-2 justify-center mt-2">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </motion.div>
      </div>

      {/* Access Text */}
      <div className="absolute bottom-12 text-slate-500 text-[10px] font-bold tracking-[0.5em] uppercase">
        Establishing Secure Connection
      </div>
    </div>
  );
}
