'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, UserPlus, Mail, ShieldCheck, Lock, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UserCreateDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    domain: '',
    password: '',
    role: 'intern',
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create user');
      }

      toast.success(formData.role === 'admin' ? 'Administrator account created!' : 'Intern account created!');
      setOpen(false);
      setFormData({ full_name: '', email: '', domain: '', password: '', role: 'intern' });
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="h-14 px-8 rounded-2xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
            <Plus size={20} className="mr-2" />
            Add New User
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl">
        <div className="relative">
          {/* Header */}
          <div className="h-32 bg-gradient-to-br from-[#4A5DB5] to-[#1A1A2E] flex items-center px-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="relative z-10">
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Onboard User</DialogTitle>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Register a new member to the platform</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Account Type</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'intern' })}
                    className={`flex-1 h-14 rounded-2xl border-2 transition-all font-bold text-sm ${formData.role === 'intern' ? 'border-[#4A5DB5] bg-blue-50 text-[#4A5DB5]' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    Intern
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`flex-1 h-14 rounded-2xl border-2 transition-all font-bold text-sm ${formData.role === 'admin' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Full Name</Label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                  <Input 
                    name="full_name"
                    value={formData.full_name} 
                    onChange={handleChange} 
                    required
                    placeholder="e.g. Alex Johnson"
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                  <Input 
                    name="email"
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required
                    placeholder="alex@example.com"
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Category / Domain</Label>
                  <Select 
                    onValueChange={(value) => setFormData({ ...formData, domain: value || '' })}
                    defaultValue={formData.domain}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-white p-2">
                      <SelectItem value="Paid Intern" className="rounded-xl font-bold py-3 hover:bg-slate-50">Paid Intern</SelectItem>
                      <SelectItem value="Intern" className="rounded-xl font-bold py-3 hover:bg-slate-50">Standard Intern</SelectItem>
                      <SelectItem value="Staff" className="rounded-xl font-bold py-3 hover:bg-slate-50">Staff / Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                    <Input 
                      name="password"
                      type="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className={`w-full h-16 rounded-[1.5rem] text-white font-black text-lg shadow-xl mt-4 transition-all hover:scale-[1.02] active:scale-95 ${formData.role === 'admin' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-[#4A5DB5] hover:bg-[#2238A4] shadow-blue-500/20'}`}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Plus size={20} className="mr-2" />}
              {isLoading ? 'Creating Account...' : formData.role === 'admin' ? 'Deploy Admin Profile' : 'Deploy Intern Profile'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
