'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function FlipUnit({ value }: { value: string }) {
  return (
    <div className="relative inline-flex items-center justify-center overflow-hidden h-8 min-w-[2rem]">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function ProjectDeadlineTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Set target date to June 11, 2026, 23:59:59
    const targetDate = new Date('2026-06-11T23:59:59').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isClient) return null;

  return (
    <div 
      className="flex flex-col p-6 rounded-[24px] min-w-[280px] sm:min-w-[340px]"
      style={{
        background: '#f3f6ff',
        border: '1px solid #dfe5ff',
        color: '#1f2640',
        boxShadow: '8px 8px 20px rgba(0,0,0,0.08), -8px -8px 20px rgba(255,255,255,0.9)'
      }}
    >
      <div className="text-xs font-bold uppercase tracking-widest text-[#7182C7] mb-3">
        Submission Deadline
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[#4A5DB5]"
        >
          <Clock size={20} strokeWidth={2.5} />
        </motion.div>
        
        <div className="flex items-center text-[1.4rem] font-black tabular-nums tracking-widest">
           <FlipUnit value={timeLeft.hours} /> 
           <span className="mx-1 pb-1 text-[#7182C7] opacity-60">:</span>
           <FlipUnit value={timeLeft.minutes} /> 
           <span className="mx-1 pb-1 text-[#7182C7] opacity-60">:</span>
           <FlipUnit value={timeLeft.seconds} />
        </div>
      </div>
      
      <div className="text-[11px] font-bold text-[#A0ACDC] uppercase tracking-wider">
        Ends Today
      </div>
    </div>
  );
}
