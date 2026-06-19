'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, User, Trophy, CalendarDays, ExternalLink, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import capstoneTeams from '@/lib/capstone-teams.json';

export default function CapstoneTeamPopup({ userEmail, isAdmin }: { userEmail: string | undefined; isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  useEffect(() => {
    if (!userEmail) return;

    // Find if user is in the selected list
    const student = capstoneTeams.find(s => s.email.toLowerCase() === userEmail.toLowerCase());
    
    if (student) {
      const hasSeen = localStorage.getItem('hasSeenCapstoneTeamPopup');
      if (!hasSeen) {
        setTeamData(student);
        setIsOpen(true);
        setTimeout(triggerConfetti, 500);
      }
    } else if (isAdmin) {
      // Auto-show preview once on load for admin so they see it
      const hasSeenPreview = localStorage.getItem('hasSeenCapstoneTeamPopupAdminPreview');
      if (!hasSeenPreview) {
        setTeamData(capstoneTeams[0]);
        setIsOpen(true);
        setTimeout(triggerConfetti, 500);
      }
    }
  }, [userEmail, isAdmin]);

  const handleClose = () => {
    setIsOpen(false);
    if (isAdmin) {
      localStorage.setItem('hasSeenCapstoneTeamPopupAdminPreview', 'true');
    } else {
      localStorage.setItem('hasSeenCapstoneTeamPopup', 'true');
    }
  };

  const handlePreview = () => {
    setTeamData(capstoneTeams[0]);
    setIsOpen(true);
    setTimeout(triggerConfetti, 100);
  };

  const joinGroup = () => {
    window.open('https://chat.whatsapp.com/Efq8aQKmTWOFYcA4rfP3cB', '_blank');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleClose();
      }}>
        {teamData && (
          <DialogContent className="w-[95vw] sm:max-w-[600px] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              {/* Header Section */}
              <div className="bg-gradient-to-br from-[#2238A4] to-[#1A2A7A] p-6 sm:p-8 text-white text-center relative overflow-hidden shrink-0">
                {/* Decorative shapes */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#40C4D0] opacity-20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 ring-4 ring-white/10">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#FBBF24]" />
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  Congratulations! 🎉
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-base sm:text-lg">
                  You have been officially selected for Capstone Project 2026.
                </DialogDescription>
              </div>

              {/* Content Section */}
              <div className="p-5 sm:p-8">
                <div className="mb-6 bg-blue-50/50 p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-1 h-full bg-blue-400"></div>
                  <h3 className="text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider mb-1">Your Project</h3>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{teamData.projectName}</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-gray-700 bg-white p-2.5 sm:p-3 rounded-xl shadow-sm border border-gray-100 w-max">
                      <User size={16} className="text-[#40C4D0] sm:w-[18px] sm:h-[18px]" />
                      <span className="text-xs sm:text-sm font-medium">Mentor:</span>
                      <span className="text-xs sm:text-sm font-bold">{teamData.mentorName}</span>
                    </div>
                    {teamData.teamName && (
                      <div className="flex items-center gap-2 text-gray-700 bg-white p-2.5 sm:p-3 rounded-xl shadow-sm border border-gray-100 w-max">
                        <Users size={16} className="text-[#FBBF24] sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-medium">Team:</span>
                        <span className="text-xs sm:text-sm font-bold">{teamData.teamName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users size={16} /> Your Team Members
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {teamData.teamMembers.map((member: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs uppercase shrink-0">
                          {member.substring(0, 2)}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-1" title={member}>{member}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <div className="bg-amber-50 p-3 sm:p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <CalendarDays className="text-amber-500 mt-0.5 shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs sm:text-sm">Next Steps</h4>
                      <p className="text-amber-800 text-[11px] sm:text-xs mt-1 leading-relaxed">
                        Get ready for the Monday session where further details and instructions will be provided.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#25D366]/10 p-3 sm:p-4 rounded-2xl border border-[#25D366]/20 flex items-center gap-3 sm:gap-4">
                    <div className="shrink-0 bg-white p-1 rounded-xl shadow-sm hidden sm:block">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://chat.whatsapp.com/Efq8aQKmTWOFYcA4rfP3cB" 
                        alt="WhatsApp Group QR Code" 
                        className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] object-contain rounded-lg"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#128C7E] text-xs sm:text-sm flex items-center gap-1">
                        <Smartphone size={14} /> Join WhatsApp
                      </h4>
                      <p className="text-[#075E54] text-[11px] sm:text-xs mt-1 leading-relaxed">
                        Scan the QR code or click the button below to get updates.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                  <Button 
                    onClick={joinGroup}
                    className="w-full sm:flex-1 rounded-xl h-11 sm:h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#25D366]/30 transition-all hover:scale-[1.02] order-1 sm:order-2"
                  >
                    Join Group <ExternalLink size={16} className="ml-2 sm:w-[18px] sm:h-[18px]" />
                  </Button>
                  <Button 
                    onClick={handleClose}
                    variant="outline"
                    className="w-full sm:flex-1 rounded-xl h-11 sm:h-12 text-gray-600 font-medium border-gray-200 order-2 sm:order-1"
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {isAdmin && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-[90]">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2238A4] to-[#40C4D0] hover:from-[#1A2A7A] hover:to-[#36b0bc] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-xs md:text-sm tracking-wide border-2 border-white/20 hover:scale-[1.02]"
          >
            <Trophy size={16} className="text-[#FBBF24] animate-bounce" />
            <span>Preview Capstone Popup</span>
          </button>
        </div>
      )}
    </>
  );
}
