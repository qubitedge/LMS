'use client';

import { useState } from 'react';
import { Trash2, Edit3, MoreVertical, Loader2, User, Mail, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserActionsProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    domain?: string;
    role: string;
    is_active: boolean;
  };
}

export default function UserActions({ user }: UserActionsProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user.full_name,
    email: user.email,
    domain: user.domain || 'Intern',
    password: '',
  });

  const router = useRouter();

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          is_active: !user.is_active,
        }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      toast.success(user.is_active ? 'User disabled.' : 'User enabled.');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleMakeAdmin = async () => {
    setIsPromoting(true);
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          role: 'admin',
        }),
      });

      if (!res.ok) throw new Error('Failed to promote user');
      toast.success('User promoted to Administrator.');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleRemoveAdmin = async () => {
    setIsPromoting(true); // Reuse promoting state
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          role: 'intern',
        }),
      });

      if (!res.ok) throw new Error('Failed to remove admin privileges');
      toast.success('Administrator privileges removed.');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/delete-user?id=${user.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      toast.success('Intern account removed successfully.');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          ...editData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update user');
      }

      toast.success('Profile updated successfully.');
      setShowEditDialog(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger 
          render={
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
              <MoreVertical size={18} className="text-[#7182C7]" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-none bg-white">
          <DropdownMenuItem 
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 text-[#1A1A2E] font-bold transition-colors"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit3 size={16} className="text-[#4A5DB5]" />
            Edit Profile
          </DropdownMenuItem>

          {user.role !== 'admin' ? (
            <DropdownMenuItem 
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 text-[#1A1A2E] font-bold transition-colors"
              onClick={handleMakeAdmin}
              disabled={isPromoting}
            >
              {isPromoting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} className="text-amber-500" />}
              Make Administrator
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-amber-50 text-amber-600 font-bold transition-colors"
              onClick={handleRemoveAdmin}
              disabled={isPromoting}
            >
              {isPromoting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} className="opacity-50" />}
              Remove Admin Privileges
            </DropdownMenuItem>
          )}

          <DropdownMenuItem 
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer font-bold transition-colors ${user.is_active ? 'hover:bg-slate-50 text-[#1A1A2E]' : 'hover:bg-emerald-50 text-emerald-600'}`}
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
          >
            {isTogglingStatus ? <Loader2 size={16} className="animate-spin" /> : user.is_active ? <User size={16} className="text-slate-400" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
            {user.is_active ? 'Disable Access' : 'Restore Access'}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2 bg-slate-50" />
          <DropdownMenuItem 
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-rose-50 text-rose-500 font-bold transition-colors"
            onClick={() => setShowDeleteAlert(true)}
          >
            <Trash2 size={16} />
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl">
          <div className="h-24 bg-gradient-to-br from-[#4A5DB5] to-[#1A1A2E] flex items-center px-10">
            <DialogTitle className="text-2xl font-black text-white">Edit Intern Profile</DialogTitle>
          </div>
          <div className="p-10 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                  <Input 
                    value={editData.full_name}
                    onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                  <Input 
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Category</Label>
                <Select 
                  onValueChange={(val) => setEditData({...editData, domain: val || ''})}
                  defaultValue={editData.domain}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-white p-2">
                    <SelectItem value="Paid Intern" className="rounded-xl font-bold py-3 hover:bg-slate-50">Paid Intern</SelectItem>
                    <SelectItem value="Intern" className="rounded-xl font-bold py-3 hover:bg-slate-50">Standard Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Reset Password (Optional)</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                  <Input 
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={editData.password}
                    onChange={(e) => setEditData({...editData, password: e.target.value})}
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="h-14 flex-1 rounded-2xl border-slate-200 font-black text-[#7182C7]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={isUpdating}
                className="h-14 flex-1 rounded-2xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black shadow-xl shadow-blue-500/20"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <DialogContent className="rounded-[2.5rem] p-10 border-none bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#1A1A2E]">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-md font-bold text-[#7182C7] mt-2">
              Are you sure you want to remove <span className="text-[#1A1A2E]">{user.full_name}</span>? This will permanently delete their progress, scores, and profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-4">
            <Button 
              variant="outline"
              onClick={() => setShowDeleteAlert(false)}
              className="h-14 px-8 rounded-2xl border-slate-200 font-black text-[#7182C7]"
            >
              Cancel
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="h-14 px-8 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black shadow-xl shadow-rose-500/20"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
