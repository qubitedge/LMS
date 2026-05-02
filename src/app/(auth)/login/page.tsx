'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import QubitedgeLogo from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import bgImage from '@/assets/wmremove-transformed.png';

import { Suspense } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'account_disabled') {
      toast.error('Your account has been disabled. Please contact your administrator.', {
        duration: 5000,
      });
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Login successful');
      router.push('/dashboard');
      router.refresh();
      
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
      className="flex flex-col md:flex-row w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[620px]"
    >
      {/* Left Side: Image & Message */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden group">
        <Image 
          src={bgImage}
          alt="Login Background"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-8">
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
                Welcome Back
              </h1>
              <p className="text-sm font-bold text-[#7182C7] max-w-[300px]">
                Sign in to the qubitedge LMS Portal to continue your internship journey.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]/60">
                  Password
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-black text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group/pass">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold px-6 pr-14 focus:ring-4 focus:ring-blue-50 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="pt-4 text-center">
            <p className="text-sm font-bold text-[#7182C7]">
              Don&apos;t have an account?{' '}
              <a 
                href="mailto:likhithmanakala@gmail.com" 
                className="text-[#1A1A2E] hover:text-[#4A5DB5] transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
              >
                Contact your administrator.
              </a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[620px]">
        <Loader2 className="h-12 w-12 animate-spin text-[#4A5DB5]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
