import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import UserCreateDialog from '@/components/admin/user-create-dialog';
import UserActions from '@/components/admin/user-actions';
import BulkUserUpload from '@/components/admin/bulk-user-upload';
import UserListExport from '@/components/admin/user-list-export';
import UserSearch from '@/components/admin/user-search';
import { Users, Mail, Shield, CheckCircle2, XCircle, FileText, Award, Search } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ role?: string; q?: string; sortBy?: string; sortOrder?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { role = 'intern', q = '', sortBy = 'created_at', sortOrder = 'desc' } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', role);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,address.ilike.%${q}%`);
  }

  const ascending = sortOrder === 'asc';
  const { data: users } = await query.order(sortBy, { ascending });

  const getSortLink = (column: string) => {
    const nextOrder = sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc';
    const params = new URLSearchParams();
    params.set('role', role);
    if (q) params.set('q', q);
    params.set('sortBy', column);
    params.set('sortOrder', nextOrder);
    return `/admin/users?${params.toString()}`;
  };

  return (
    <div className="relative pb-10">
      <div className="bg-mesh opacity-20" />
      
      <div className="relative z-10">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
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
          <div className="flex flex-wrap gap-4 w-full xl:w-auto">
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
            <div className="flex gap-4">
              <UserListExport users={users || []} role={role} />
              <BulkUserUpload />
              <UserCreateDialog />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <UserSearch />
          {q && (
            <p className="text-sm font-bold text-[#7182C7]">
              Showing results for "<span className="text-[#4A5DB5]">{q}</span>"
            </p>
          )}
        </div>

        <Card className="rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#E9EEF9]/50">
                  <TableRow className="border-b-blue-100/50">
                    <TableHead className="font-black text-[#1A1A2E] px-8 py-6">
                      <Link href={getSortLink('full_name')} className="flex items-center gap-1 hover:text-[#4A5DB5] transition-colors">
                        User Profile {sortBy === 'full_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </Link>
                    </TableHead>
                    <TableHead className="font-black text-[#1A1A2E]">
                      <Link href={getSortLink('address')} className="flex items-center gap-1 hover:text-[#4A5DB5] transition-colors">
                        College {sortBy === 'address' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </Link>
                    </TableHead>
                    <TableHead className="font-black text-[#1A1A2E]">Category</TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-center">Status</TableHead>
                    {role === 'intern' && <TableHead className="font-black text-[#1A1A2E] text-center">Certifications</TableHead>}
                    <TableHead className="font-black text-[#1A1A2E] text-right">
                      <Link href={getSortLink('created_at')} className="flex items-center gap-1 justify-end hover:text-[#4A5DB5] transition-colors">
                        Joined Date {sortBy === 'created_at' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </Link>
                    </TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-right px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!users || users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={role === 'intern' ? 7 : 6} className="text-center py-20">
                        <div className="flex flex-col items-center gap-4 text-[#7182C7]">
                          {q ? <Search size={48} className="opacity-20" /> : <Users size={48} className="opacity-20" />}
                          <p className="font-bold">
                            {q ? `No ${role}s found matching "${q}"` : `No ${role}s found.`}
                          </p>
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
                        <TableCell className="font-bold text-[#1A1A2E]">
                          {user.address || <span className="text-slate-300 italic font-normal">Not Specified</span>}
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
                        {role === 'intern' && (
                          <TableCell>
                            <div className="flex items-center justify-center gap-3">
                              <div 
                                title={user.offer_letter_url ? "Offer Letter Issued" : "Offer Letter Pending"} 
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${user.offer_letter_url ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}
                              >
                                <FileText size={16} />
                              </div>
                              <div 
                                title={user.certificate_url ? "Certificate Issued" : "Certificate Pending"} 
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${user.certificate_url ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}
                              >
                                <Award size={16} />
                              </div>
                            </div>
                          </TableCell>
                        )}
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
