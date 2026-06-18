'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, User, Trophy, CalendarDays, ExternalLink, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import capstoneTeams from '@/lib/capstone-teams.json';

export default function CapstoneTeamPopup({ userEmail }: { userEmail: string | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);

  useEffect(() => {
    if (!userEmail) return;

    // Find if user is in the selected list
    const student = capstoneTeams.find(s => s.email.toLowerCase() === userEmail.toLowerCase());
    
    if (student) {
      const hasSeen = localStorage.getItem('hasSeenCapstoneTeamPopup');
      if (!hasSeen) {
        setTeamData(student);
        setIsOpen(true);
        // Trigger celebratory confetti
        setTimeout(() => {
          const duration = 3 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

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
        }, 500);
      }
    }
  }, [userEmail]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenCapstoneTeamPopup', 'true');
  };

  const joinGroup = () => {
    window.open('https://chat.whatsapp.com/Efq8aQKmTWOFYcA4rfP3cB', '_blank');
  };

  if (!teamData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#2238A4] to-[#1A2A7A] p-8 text-white text-center relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#40C4D0] opacity-20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 ring-4 ring-white/10">
            <Trophy size={32} className="text-[#FBBF24]" />
          </div>
          <DialogTitle className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display' }}>
            Congratulations! 🎉
          </DialogTitle>
          <DialogDescription className="text-blue-100 text-lg">
            You have been officially selected for Capstone Project 2026.
          </DialogDescription>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="mb-6 bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1 h-full bg-blue-400"></div>
            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1">Your Project</h3>
            <p className="text-xl font-bold text-gray-900 mb-4">{teamData.projectName}</p>
            
            <div className="flex items-center gap-2 text-gray-700 bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-max">
              <User size={18} className="text-[#40C4D0]" />
              <span className="text-sm font-medium">Mentor:</span>
              <span className="text-sm font-bold">{teamData.mentorName}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users size={16} /> Your Team Members
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {teamData.teamMembers.map((member: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs uppercase">
                    {member.substring(0, 2)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{member}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
              <CalendarDays className="text-amber-500 mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Next Steps</h4>
                <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                  Get ready for the Monday session where further details and instructions will be provided.
                </p>
              </div>
            </div>

            <div className="bg-[#25D366]/10 p-4 rounded-2xl border border-[#25D366]/20 flex items-center gap-4">
              <div className="shrink-0 bg-white p-1 rounded-xl shadow-sm">
                {/* Dynamically generated QR Code using public API */}
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://chat.whatsapp.com/Efq8aQKmTWOFYcA4rfP3cB" 
                  alt="WhatsApp Group QR Code" 
                  className="w-[70px] h-[70px] object-contain rounded-lg"
                />
              </div>
              <div>
                <h4 className="font-bold text-[#128C7E] text-sm flex items-center gap-1">
                  <Smartphone size={14} /> Join WhatsApp
                </h4>
                <p className="text-[#075E54] text-xs mt-1 leading-relaxed">
                  Scan the QR code or click the button below to get updates.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button 
              onClick={handleClose}
              variant="outline"
              className="flex-1 rounded-xl h-12 text-gray-600 font-medium border-gray-200"
            >
              Later
            </Button>
            <Button 
              onClick={joinGroup}
              className="flex-1 rounded-xl h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-base shadow-lg shadow-[#25D366]/30 transition-all hover:scale-[1.02]"
            >
              Join Group <ExternalLink size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
