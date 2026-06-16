'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Link from 'next/link';

export default function DeveloperCredit() {
  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[100]">
      <Link 
        href="https://www.linkedin.com/in/likhithmankala" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-lg rounded-full p-1.5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-200 group"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E9EEF9] flex items-center justify-center shrink-0 border-2 border-white shadow-sm relative">
          <DotLottieReact
            src="/Profile%20Avatar%20of%20Young%20Boy.lottie"
            loop
            autoplay
            className="w-[150%] h-[150%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        
        <div className="flex flex-col justify-center max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:pr-4 transition-all duration-500 overflow-hidden whitespace-nowrap">
          <span className="text-[9px] font-black text-[#7182C7] uppercase tracking-widest leading-none mb-1">
            Developed By
          </span>
          <span className="text-sm font-black text-[#1A1A2E] leading-none">
            Likhith
          </span>
        </div>
      </Link>
    </div>
  );
}
