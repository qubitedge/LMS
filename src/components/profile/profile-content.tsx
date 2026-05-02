'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Briefcase, MapPin, Phone, Edit2, 
  Camera, Lock, Save, X, Trophy, Flame, 
  Star, CheckCircle2, LogOut, Key, Loader2,
  ChevronRight, Globe, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileContentProps {
  initialProfile: any;
  stats: {
    totalPoints: number;
    completedTasksCount: number;
    attendanceCount: number;
    totalExpectedDays: number;
  };
}

export default function ProfileContent({ initialProfile, stats }: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [editedProfile, setEditedProfile] = useState(initialProfile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatar_url);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // In a real app, upload to Supabase Storage here
      // For now, we'll keep the preview and "mock" the upload on save
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editedProfile.full_name,
          phone: editedProfile.phone,
          address: editedProfile.address,
          domain: editedProfile.domain,
          avatar_url: avatarPreview // Mocking upload for now
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Progress calculations
  const masteryPercentage = Math.round((stats.attendanceCount / stats.totalExpectedDays) * 100) || 0;

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/profile/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) throw new Error('Failed to update password');

      toast.success('Password changed successfully!');
      setShowPasswordDialog(false);
      setNewPassword('');
      setShowNewPassword(false);
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="pb-20 space-y-10">
      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="rounded-[2.5rem] p-10 border-none bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#1A1A2E]">Change Password</DialogTitle>
            <DialogDescription className="text-md font-bold text-[#7182C7] mt-2">
              Enter your new desired password below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] ml-2">New Password</Label>
              <div className="relative group/pass">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A5DB5]" size={18} />
                <Input 
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 rounded-2xl border-blue-50 bg-slate-50 focus:bg-white font-bold transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus:outline-none"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8 gap-4">
            <Button 
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              className="h-14 px-8 rounded-2xl border-slate-200 font-black text-[#7182C7]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordUpdate}
              disabled={isUpdatingPassword}
              className="h-14 px-8 rounded-2xl bg-[#2238A4] hover:bg-[#1A1A2E] text-white font-black shadow-xl shadow-blue-900/20"
            >
              {isUpdatingPassword ? <Loader2 className="animate-spin" /> : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
            User Settings
          </h1>
          <p className="text-[#7182C7] font-bold text-lg">Manage your personal identity and preferences</p>
        </div>
        
        <div className="flex gap-3">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="h-14 px-8 rounded-2xl bg-white border-2 border-blue-100 text-[#4A5DB5] font-black hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/5 group"
            >
              <Edit2 size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedProfile(profile);
                  setAvatarPreview(profile.avatar_url);
                }}
                variant="outline"
                className="h-14 px-6 rounded-2xl border-2 border-slate-200 text-slate-500 font-black hover:bg-slate-50"
              >
                <X size={18} className="mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className="h-14 px-8 rounded-2xl bg-[#2238A4] text-white font-black hover:bg-[#1A1A2E] shadow-xl shadow-blue-900/20 transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="qe-card border-none shadow-2xl overflow-hidden relative group rounded-[2.5rem] bg-white">
            <div className="h-40 bg-gradient-to-br from-[#4A5DB5] via-[#2238A4] to-[#1A1A2E] relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
               <motion.div 
                 animate={isEditing ? { opacity: 0.5, scale: 1.1 } : { opacity: 1, scale: 1 }}
                 className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" 
               />
            </div>
            
            <CardContent className="pt-0 flex flex-col items-center pb-10 px-8">
              {/* Avatar Section */}
              <div className="relative group/avatar cursor-pointer -mt-20 mb-6" onClick={handleAvatarClick}>
                <div 
                  className={`w-40 h-40 rounded-[3rem] flex items-center justify-center text-5xl font-black border-8 border-white shadow-2xl transition-all duration-500 overflow-hidden
                    ${isEditing ? 'ring-4 ring-[#4A5DB5]/30' : ''}`}
                  style={{ 
                    background: 'white',
                    color: '#2238A4'
                  }}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile?.full_name?.charAt(0) || 'U'
                  )}
                </div>
                
                <AnimatePresence>
                  {isEditing && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 rounded-[3rem] bg-black/40 backdrop-blur-sm flex items-center justify-center text-white z-10"
                    >
                      <Camera size={32} />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>

              {/* Identity Section */}
              <div className="text-center w-full space-y-4">
                <div className="space-y-1">
                  {isEditing ? (
                    <Input 
                      name="full_name"
                      value={editedProfile.full_name}
                      onChange={handleInputChange}
                      className="text-center text-2xl font-black h-12 rounded-xl border-blue-100 bg-blue-50/30 focus:bg-white transition-all"
                      placeholder="Full Name"
                    />
                  ) : (
                    <h2 className="text-3xl font-black text-[#1A1A2E] tracking-tight">{profile?.full_name}</h2>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                      <Lock size={12} />
                      {profile?.role === 'admin' ? 'Administrator' : 'Intern'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 space-y-4 text-left">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] ml-2">Domain</Label>
                      {isEditing ? (
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A5DB5]" size={18} />
                          <Input 
                            name="domain"
                            value={editedProfile.domain || ''}
                            onChange={handleInputChange}
                            className="pl-12 h-14 rounded-2xl border-blue-50 bg-slate-50 focus:bg-white font-bold transition-all"
                            placeholder="e.g. Full Stack Development"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-5 rounded-3xl bg-[#E9EEF9]/50 border border-blue-100/30">
                          <Globe size={20} className="text-[#4A5DB5]" />
                          <span className="font-bold text-[#1A1A2E]">{profile?.domain || 'General Intern'}</span>
                        </div>
                      )}
                   </div>

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] ml-2">Email Address</Label>
                      <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 opacity-60">
                        <Mail size={20} className="text-[#7182C7]" />
                        <span className="font-bold text-slate-500">{profile?.email}</span>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] ml-2">Phone Number</Label>
                      {isEditing ? (
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A5DB5]" size={18} />
                          <Input 
                            name="phone"
                            value={editedProfile.phone || ''}
                            onChange={handleInputChange}
                            className="pl-12 h-14 rounded-2xl border-blue-50 bg-slate-50 focus:bg-white font-bold transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-5 rounded-3xl bg-[#E9EEF9]/50 border border-blue-100/30">
                          <Phone size={20} className="text-[#4A5DB5]" />
                          <span className="font-bold text-[#1A1A2E]">{profile?.phone || 'Not provided'}</span>
                        </div>
                      )}
                   </div>

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] ml-2">Living Address</Label>
                      {isEditing ? (
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A5DB5]" size={18} />
                          <Input 
                            name="address"
                            value={editedProfile.address || ''}
                            onChange={handleInputChange}
                            className="pl-12 h-14 rounded-2xl border-blue-50 bg-slate-50 focus:bg-white font-bold transition-all"
                            placeholder="City, Country"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-5 rounded-3xl bg-[#E9EEF9]/50 border border-blue-100/30">
                          <MapPin size={20} className="text-[#4A5DB5]" />
                          <span className="font-bold text-[#1A1A2E]">{profile?.address || 'Not provided'}</span>
                        </div>
                      )}
                   </div>
                </div>

                <div className="pt-8 grid grid-cols-2 gap-3">
                   <Button 
                    onClick={() => setShowPasswordDialog(true)}
                    variant="outline" 
                    className="h-12 rounded-xl border-slate-200 font-bold text-xs hover:bg-slate-50"
                   >
                      <Key size={14} className="mr-2" />
                      Password
                   </Button>
                   <Button 
                    onClick={handleLogout}
                    className="h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 font-bold text-xs hover:bg-rose-100"
                   >
                      <LogOut size={14} className="mr-2" />
                      Sign Out
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Performance Dashboard */}
        <div className="lg:col-span-8 space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white to-[#E9EEF9] border-2 border-white shadow-xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                     <Flame size={28} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#7182C7] mb-2">Active Streak</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black tracking-tighter text-[#1A1A2E]">{profile?.current_streak || 0}</span>
                    <span className="text-xl font-bold text-[#A0ACDC]">Days 🔥</span>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Flame size={180} />
               </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white to-[#E9EEF9] border-2 border-white shadow-xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#2238A4] mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                     <Trophy size={28} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#7182C7] mb-2">Record Streak</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black tracking-tighter text-[#1A1A2E]">{profile?.longest_streak || 0}</span>
                    <span className="text-xl font-bold text-[#A0ACDC]">Days 🏆</span>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Trophy size={180} />
               </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white to-[#E9EEF9] border-2 border-white shadow-xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                     <Star size={28} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#7182C7] mb-2">Total Points</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black tracking-tighter text-[#1A1A2E]">{stats.totalPoints}</span>
                    <span className="text-xl font-bold text-[#A0ACDC]">EXP ⭐</span>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Star size={180} />
               </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white to-[#E9EEF9] border-2 border-white shadow-xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                     <CheckCircle2 size={28} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#7182C7] mb-2">Tasks Done</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black tracking-tighter text-[#1A1A2E]">{stats.completedTasksCount}</span>
                    <span className="text-xl font-bold text-[#A0ACDC]">Passed ✅</span>
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckCircle2 size={180} />
               </div>
            </motion.div>
          </div>

          {/* Mastery Level Section */}
          <Card className="qe-card border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white p-10 relative">
             <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="relative">
                   <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        className="text-slate-100"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 88}
                        initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - masteryPercentage / 100) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="text-[#2238A4]"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-[#1A1A2E]">{masteryPercentage}%</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#7182C7]">Mastery</span>
                   </div>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                   <div className="space-y-2">
                      <h3 className="text-3xl font-black text-[#1A1A2E] tracking-tight">Your Mastery Level</h3>
                      <p className="text-lg font-bold text-[#7182C7]">
                        {masteryPercentage >= 80 ? "You're a Legend! Unstoppable force." : 
                         masteryPercentage >= 50 ? "Great progress! You're becoming a master." : 
                         "Keep going! The path to mastery is a marathon."}
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC]">Attendance Rate</p>
                         <p className="text-xl font-black text-[#1A1A2E]">{Math.round((stats.attendanceCount / stats.totalExpectedDays) * 100)}%</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC]">Target Goals</p>
                         <p className="text-xl font-black text-[#1A1A2E]">{stats.attendanceCount} / {stats.totalExpectedDays}</p>
                      </div>
                   </div>

                   <Button className="w-full md:w-auto h-12 px-10 rounded-2xl bg-[#E9EEF9] text-[#4A5DB5] font-black hover:bg-blue-50 border border-blue-100 shadow-lg shadow-blue-900/5 transition-all">
                      View Learning Path
                      <ChevronRight size={18} className="ml-2" />
                   </Button>
                </div>
             </div>
             
             {/* Decorative Background Glow */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#4A5DB5]/5 blur-[6rem] rounded-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}
