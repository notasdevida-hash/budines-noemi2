'use client';

import { Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function FloatingInstagram() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 1.5 
      }}
      className="fixed bottom-8 right-8 z-50"
    >
      <Link 
        href="https://www.instagram.com/budines_noemi/" 
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full blur-lg opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
        
        {/* Button body */}
        <div className="relative w-16 h-16 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:scale-110 group-active:scale-90">
          <Instagram className="w-8 h-8" />
        </div>

        {/* Tooltip */}
        <span className="absolute right-full mr-4 px-4 py-2 bg-black/80 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest rounded-xl opacity-0 -translate-x-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
          Seguinos en Instagram
        </span>
      </Link>
    </motion.div>
  );
}
