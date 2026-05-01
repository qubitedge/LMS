'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import QubitedgeLogo from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsSubmitted(true);
      toast.success('Reset link sent to your email');
      
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10 lg:p-16 space-y-8"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <QubitedgeLogo size={64} />
        </motion.div>
        
        {!isSubmitted ? (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display' }}>
                Forgot Password?
              </h1>
              <p className="text-sm font-bold text-[#7182C7] max-w-[300px]">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleResetRequest} className="w-full space-y-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]/60 ml-1">
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@qubitedge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold px-6 focus:ring-4 focus:ring-blue-50 transition-all"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display' }}>
                Check Your Email
              </h1>
              <p className="text-sm font-bold text-[#7182C7]">
                We've sent a password reset link to <span className="text-[#1A1A2E] font-black">{email}</span>.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-600 font-bold">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
            </div>
          </div>
        )}

        <Link 
          href="/login" 
          className="flex items-center text-sm font-black text-[#7182C7] hover:text-[#1A1A2E] transition-colors pt-4 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}
