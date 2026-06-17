'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowUpRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialConnectPopupProps {
  user: {
    full_name: string;
    avatar_url: string | null;
    role: string;
  } | null;
}

export default function SocialConnectPopup({ user }: SocialConnectPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visited, setVisited] = useState<{ [key: string]: boolean }>({
    facebook: false,
    twitter: false,
    youtube: false,
    instagram: false,
  });

  const storageKey = 'qubitedge_has_seen_social_popup_v2';

  useEffect(() => {
    // Small delay to let the dashboard render nicely first
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSocialClick = (platform: string, url: string) => {
    // Open social media page in a new window/tab
    window.open(url, '_blank', 'noopener,noreferrer');

    // If not already visited, trigger a small local confetti burst and mark as visited
    if (!visited[platform]) {
      setVisited((prev) => ({ ...prev, [platform]: true }));

      // Localized mini-confetti burst
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: platform === 'facebook' ? ['#1877F2', '#E9EEF9'] 
              : platform === 'twitter' ? ['#000000', '#A0ACDC'] 
              : platform === 'youtube' ? ['#FF0000', '#FFCDD2'] 
              : ['#C13584', '#FCAF45', '#E1306C', '#FD1D1D'],
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(storageKey, 'true');

    // Massive full-screen celebratory confetti burst
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 60 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 200);
  };

  if (!isOpen) return null;

  const isAdmin = user?.role === 'admin';
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : '';
  const greeting = firstName ? `Hey ${firstName}! 👋` : (isAdmin ? 'Dear Administrator, 🚀' : 'Dear Interns, 🚀');

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1CaDCiDQFT/',
      cta: 'Follow Page',
      color: 'from-[#1877F2]/10 to-[#1877F2]/20 hover:from-[#1877F2]/20 hover:to-[#1877F2]/30 text-[#1877F2] border-[#1877F2]/20',
      activeColor: 'bg-[#1877F2] text-white',
      badgeColor: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      url: 'https://x.com/qubitedgeinc',
      cta: 'Follow Us',
      color: 'from-black/5 to-black/10 hover:from-black/10 hover:to-black/15 text-slate-900 border-slate-900/10',
      activeColor: 'bg-black text-white',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://youtube.com/@qubitedge?si=TKVu_DIPrA9IX7j3',
      cta: 'Subscribe',
      color: 'from-[#FF0000]/5 to-[#FF0000]/10 hover:from-[#FF0000]/10 hover:to-[#FF0000]/15 text-[#FF0000] border-[#FF0000]/20',
      activeColor: 'bg-[#FF0000] text-white',
      badgeColor: 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://www.instagram.com/qubitedge?igsh=MTl6djFzNWdranFlcA==',
      cta: 'Follow Us',
      color: 'from-[#C13584]/5 to-[#FCAF45]/5 hover:from-[#C13584]/15 hover:to-[#FCAF45]/15 text-[#C13584] border-[#C13584]/20',
      activeColor: 'bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#C13584] text-white',
      badgeColor: 'bg-gradient-to-tr from-[#FCAF45]/10 via-[#E1306C]/10 to-[#C13584]/10 text-[#C13584] border-[#C13584]/20',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      )
    }
  ];

  const totalVisited = Object.values(visited).filter(Boolean).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md overflow-y-auto py-8 px-4">
        {/* Overlay backdrop click to close: prevented to ensure they see / acknowledge it */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative max-w-4xl w-full bg-white/95 backdrop-blur-2xl border border-indigo-100/60 rounded-[2.5rem] p-6 md:p-8 shadow-[0_30px_80px_-15px_rgba(34,56,164,0.25)] overflow-hidden flex flex-col gap-6"
        >
          {/* Glowing colorful accent blobs in background */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10 animate-pulse duration-[6000ms]" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#40C4D0]/10 rounded-full blur-[80px] -z-10 animate-pulse duration-[4000ms]" />

          {/* Close button inside modal (top right) */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-20"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Main content grid: horizontal layout on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 md:gap-8 items-stretch relative z-10 text-left">
            
            {/* Left Column: Greeting, Brand Badge, Introduction */}
            <div className="md:col-span-5 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                {/* Connect & Grow Badge */}
                <div className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] text-[#2238A4] bg-[#2238A4]/10 border border-[#2238A4]/20 uppercase">
                  Stay Connected 🔗
                </div>
                
                <h2 className="font-black text-2xl md:text-3xl text-slate-800 tracking-tight leading-tight">
                  Connect with QubitEdge
                </h2>
                
                <div className="text-slate-600 space-y-3 leading-relaxed text-sm">
                  <p className="font-bold text-indigo-950 text-[15px]">{greeting}</p>
                  
                  <p>
                    We invite all of you to follow and connect with QubitEdge on our social media platforms to stay updated with the latest announcements, internship opportunities, workshops, technical events, certifications, and future programs.
                  </p>
                  <p>
                    Your support and engagement on our social media channels encourage us to continue organizing impactful learning initiatives and create more opportunities for students and aspiring professionals.
                  </p>
                </div>
              </div>

              {/* Signature */}
              <div className="text-slate-500 text-xs pt-2 border-t border-slate-100/50 md:border-t-0">
                <p>Best Regards,</p>
                <p className="font-black text-slate-800 flex items-center gap-1 mt-0.5">
                  Qubitedge Team <span className="animate-bounce">🚀</span>
                </p>
              </div>
            </div>

            {/* Vertical Divider line between columns (desktop only) */}
            <div className="hidden md:block md:col-span-1 w-px bg-slate-100 self-stretch justify-self-center" />

            {/* Right Column: Social Links grid, encouragement text, Enter CTA */}
            <div className="md:col-span-5 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="text-slate-600 text-sm space-y-3 leading-relaxed">
                  <p>
                    We encourage you to follow, subscribe, and stay connected with us for exciting updates and future learning opportunities.
                  </p>
                  <p>
                    Thank you for being a part of the QubitEdge community. We look forward to growing and learning together.
                  </p>
                </div>

                {/* Social Platforms Grid */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 my-1">
                  {platforms.map((platform) => {
                    const isClicked = visited[platform.id];
                    return (
                      <button
                        key={platform.id}
                        onClick={() => handleSocialClick(platform.id, platform.url)}
                        className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center transition-all duration-300 relative group/card cursor-pointer ${
                          isClicked
                            ? 'bg-slate-50 border-emerald-500/30 shadow-inner'
                            : `bg-gradient-to-br ${platform.color} shadow-sm hover:shadow-md hover:-translate-y-0.5`
                        }`}
                      >
                        {/* Glowing halo behind card on hover */}
                        <div className="absolute inset-0 -z-10 rounded-2xl bg-white opacity-0 group-hover/card:opacity-10 transition-opacity duration-300 shadow-[0_12px_24px_rgba(0,0,0,0.06)]" />

                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl transition-all duration-300 mb-1.5 ${
                          isClicked ? 'bg-emerald-100 text-emerald-600 scale-95' : 'bg-white shadow-sm group-hover/card:scale-110'
                        }`}>
                          {platform.icon}
                        </div>

                        {/* Name */}
                        <span className="font-black text-xs md:text-sm text-slate-800 tracking-tight mb-2">
                          {platform.name}
                        </span>

                        {/* Button */}
                        <div className={`w-full py-1.5 px-2 rounded-xl text-[10px] md:text-xs font-black tracking-tight flex items-center justify-center gap-1 transition-all ${
                          isClicked
                            ? 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-200'
                            : 'bg-white shadow-sm border border-slate-200/50 group-hover/card:bg-slate-50'
                        }`}>
                          {isClicked ? (
                            <>
                              <Check size={10} className="stroke-[3]" />
                              Connected
                            </>
                          ) : (
                            <>
                              {platform.cta}
                              <ArrowUpRight size={10} className="opacity-60 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-transform" />
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {/* Social Pillars Banner */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-4 text-[9px] md:text-xs font-black text-slate-500 flex justify-around items-center select-none tracking-wide text-center">
                  <span>FOLLOW</span>
                  <span className="text-slate-300">•</span>
                  <span>SUBSCRIBE</span>
                  <span className="text-slate-300">•</span>
                  <span>CONNECT</span>
                  <span className="text-slate-300">•</span>
                  <span>GROW</span>
                </div>

                {/* Closing CTA */}
                <button
                  onClick={handleClose}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide shadow-md transition-all duration-300 flex items-center justify-center gap-2 group border relative overflow-hidden shrink-0 ${
                    totalVisited >= 4
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-500/10'
                      : 'bg-[#2238A4] hover:bg-[#1C2C80] text-white border-[#2238A4] shadow-[#2238A4]/10'
                  }`}
                >
                  Let&apos;s Enter Dashboard
                  <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
