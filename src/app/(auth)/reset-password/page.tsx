'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import QubitedgeLogo from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Please enter a new password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Password updated successfully');
      router.push('/login');
      
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
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display' }}>
            Reset Password
          </h1>
          <p className="text-sm font-bold text-[#7182C7] max-w-[300px]">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="w-full space-y-6 text-left">
          <div className="space-y-2">
            <Label htmlFor="password" title="New Password" />
            <div className="relative">
              <Input 
                id="password" 
                type="password" 
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold px-6 focus:ring-4 focus:ring-blue-50 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" title="Confirm Password" />
            <div className="relative">
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold px-6 focus:ring-4 focus:ring-blue-50 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
