import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import UserCreateDialog from '@/components/admin/user-create-dialog';
import UserActions from '@/components/admin/user-actions';
import { Users, Mail, Shield, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { role = 'intern' } = await searchParams;
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false });

  return (
    <div className="relative pb-10">
      <div className="bg-mesh opacity-20" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
              {role === 'admin' ? 'Admin Management' : 'Intern Management'}
            </h1>
            <p className="text-lg font-bold text-[#7182C7]">
              {role === 'admin' 
                ? 'Manage administrative access and permissions.' 
                : 'Oversee talent acquisition and monitor individual performance.'}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm flex">
              <Link 
                href="/admin/users?role=intern"
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${role === 'intern' ? 'bg-[#4A5DB5] text-white shadow-lg shadow-blue-500/20' : 'text-[#7182C7] hover:bg-white/50'}`}
              >
                Interns
              </Link>
              <Link 
                href="/admin/users?role=admin"
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${role === 'admin' ? 'bg-[#4A5DB5] text-white shadow-lg shadow-blue-500/20' : 'text-[#7182C7] hover:bg-white/50'}`}
              >
                Admins
              </Link>
            </div>
            <UserCreateDialog />
          </div>
        </div>

        <Card className="rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#E9EEF9]/50">
                  <TableRow className="border-b-blue-100/50">
                    <TableHead className="font-black text-[#1A1A2E] px-8 py-6">User Profile</TableHead>
                    <TableHead className="font-black text-[#1A1A2E]">Category</TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-center">Status</TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-center">Current Streak</TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-right">Joined Date</TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-right px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!users || users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center gap-4 text-[#7182C7]">
                          <Users size={48} className="opacity-20" />
                          <p className="font-bold">No {role}s found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-blue-50/30 transition-colors border-b-blue-50/50">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-white border flex items-center justify-center font-black shadow-sm ${user.role === 'admin' ? 'text-amber-500 border-amber-100' : 'text-[#4A5DB5] border-blue-100'}`}>
                              {user.role === 'admin' ? <Shield size={20} /> : (user.full_name?.charAt(0) || 'U')}
                            </div>
                            <div>
                              <p className="font-black text-[#1A1A2E]">{user.full_name}</p>
                              <p className="text-xs text-[#7182C7] flex items-center gap-1">
                                <Mail size={12} /> {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg ${user.role === 'admin' ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-[#4A5DB5] text-white shadow-blue-500/20'}`}>
                            {user.role === 'admin' ? 'Administrator' : (user.domain || 'Intern')}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                              <CheckCircle2 size={12} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-[10px] font-black uppercase tracking-widest">
                              <XCircle size={12} /> Disabled
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
                            <span className="text-sm font-black">🔥 {user.current_streak}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-[#7182C7]">
                          {format(parseISO(user.created_at), 'MMMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <UserActions user={user} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
