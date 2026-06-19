'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Globe, MessageCircle, Share2, Sparkles, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function InternshipFeedbackModal({ shouldShow }: { shouldShow: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (shouldShow) {
      // Check if they already saw/submitted it
      const hasSubmitted = localStorage.getItem('internship_feedback_submitted');
      if (!hasSubmitted) {
        setIsOpen(true);
      }
    }
  }, [shouldShow]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide a star rating");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'Review already submitted') {
          // If already submitted, just show success anyway and close
          localStorage.setItem('internship_feedback_submitted', 'true');
          setSubmitted(true);
          setTimeout(() => setIsOpen(false), 2000);
          return;
        }
        throw new Error('Failed to submit');
      }

      localStorage.setItem('internship_feedback_submitted', 'true');
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
      setTimeout(() => setIsOpen(false), 2000);
    } catch (error) {
      toast.error("An error occurred while submitting feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        {!submitted ? (
          <>
            <div className="bg-gradient-to-br from-[#4A5DB5] to-[#2238A4] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Sparkles size={100} />
              </div>
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-3xl font-black mb-2 text-white">Thank You!</DialogTitle>
                <DialogDescription className="text-white/90 text-md font-medium">
                  We hope you had a great internship session! As we wrap up, we'd love to hear your thoughts on the portal and your overall experience.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-black uppercase tracking-widest text-[#A0ACDC]">Rate your experience</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="transition-all hover:scale-110 active:scale-95 focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-100 text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black uppercase tracking-widest text-[#A0ACDC]">Share your thoughts</label>
                <Textarea 
                  placeholder="Tell us what you loved, what we can improve, and any feedback about the portal..."
                  className="min-h-[120px] resize-none rounded-2xl border-slate-200 focus-visible:ring-[#4A5DB5]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-sm font-bold text-[#7182C7] mb-3 text-center">Don't forget to follow us!</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-[#4A5DB5] hover:bg-[#4A5DB5] hover:text-white transition-colors">
                    <Globe size={18} />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-[#4A5DB5] hover:bg-[#4A5DB5] hover:text-white transition-colors">
                    <MessageCircle size={18} />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-[#4A5DB5] hover:bg-[#4A5DB5] hover:text-white transition-colors">
                    <Share2 size={18} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading} className="rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200">
                Maybe Later
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="rounded-xl font-black bg-[#4A5DB5] hover:bg-[#2238A4] text-white">
                <Send size={16} className="mr-2" /> {isLoading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2">
              <Sparkles size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1A1A2E]">Feedback Received!</h3>
            <p className="text-[#7182C7] font-medium">Thank you for helping us improve. We appreciate your time and effort.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
