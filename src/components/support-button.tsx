'use client';

import { useState } from 'react';
import { HelpCircle, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportButton({ userName }: { userName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [concern, setConcern] = useState('');
  const [hasImage, setHasImage] = useState(false);

  const WHATSAPP_NUMBER = '916302829618';

  const handleWhatsAppClick = () => {
    // Generate a simple 5-digit ticket number
    const ticketNumber = `QE-${Math.floor(10000 + Math.random() * 90000)}`;
    
    let message = `*Ticket: ${ticketNumber}*\n\n`;
    if (userName) {
      message += `Hi, I am ${userName}. I need help with:\n\n${concern}`;
    } else {
      message += `Hi, I am having trouble logging into the qubitedge LMS Portal. My concern is:\n\n${concern}`;
    }

    if (hasImage) {
      message += `\n\n*(I will attach a screenshot to this chat shortly)*`;
    }
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setConcern('');
  };

  return (
    <>
      <div className="fixed top-20 right-4 md:top-8 md:right-8 z-[100]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-[#2238A4] to-[#4A5DB5] rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-[#4A5DB5]/50 transition-all border-4 border-[#E8E4DE]"
        >
          <HelpCircle size={24} className="md:w-7 md:h-7" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-md relative"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E9EEF9] text-[#2238A4] flex items-center justify-center">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#1A1A2E]">Support Request</h2>
                  <p className="text-xs font-bold text-[#7182C7]">We're here to help.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/60 mb-2 block">
                    Describe your concern
                  </label>
                  <textarea
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    placeholder="E.g. I can't access my tasks, or I need help with..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-50 text-sm font-medium transition-all mb-4"
                  />
                </div>
                
                <label className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasImage}
                    onChange={(e) => setHasImage(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#25D366] focus:ring-[#25D366]"
                  />
                  <div>
                    <p className="text-xs font-black text-[#1A1A2E] mb-0.5">I want to attach a screenshot</p>
                    <p className="text-[10px] font-bold text-[#7182C7]">You can attach the image directly once WhatsApp opens.</p>
                  </div>
                </label>
                
                <button
                  onClick={handleWhatsAppClick}
                  disabled={!concern.trim()}
                  className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
                >
                  <MessageCircle size={18} />
                  Continue to WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
