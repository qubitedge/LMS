import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import UserCreateDialog from '@/components/admin/user-create-dialog';
import UserActions from '@/components/admin/user-actions';
import BulkUserUpload from '@/components/admin/bulk-user-upload';
import UserListExport from '@/components/admin/user-list-export';
import UserSearch from '@/components/admin/user-search';
import ProgramFilter from '@/components/admin/program-filter';
import { Users, Mail, Shield, CheckCircle2, XCircle, FileText, Award, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{ role?: string; q?: string; sortBy?: string; sortOrder?: string; page?: string; eventId?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { role = 'intern', q = '', sortBy = 'created_at', sortOrder = 'desc', page = '0', eventId = '' } = await searchParams;
  const pageNum = Math.max(0, parseInt(page, 10) || 0);
  const supabase = await createClient();

  // Check if we need to filter by program enrollment
  let enrolledUserIds: string[] = [];
  let hasEnrolls = false;
  if (eventId) {
    const { data: enrollments } = await supabase
      .from('user_enrollments')
      .select('user_id')
      .eq('event_id', eventId);
    enrolledUserIds = (enrollments || []).map(e => e.user_id);
    hasEnrolls = true;
  }

  // Count total for pagination and fetch users in parallel
  let countQuery = supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', role);
  if (q) countQuery = countQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,address.ilike.%${q}%`);
  if (hasEnrolls) {
    if (enrolledUserIds.length > 0) {
      countQuery = countQuery.in('id', enrolledUserIds);
    } else {
      countQuery = countQuery.in('id', ['00000000-0000-0000-0000-000000000000']);
    }
  }

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, role, address, is_active, domain, created_at, avatar_url, offer_letter_url, certificate_url, user_enrollments(events(id, title))')
    .eq('role', role)
    .range(pageNum * PAGE_SIZE, pageNum * PAGE_SIZE + PAGE_SIZE - 1);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,address.ilike.%${q}%`);
  }
  if (hasEnrolls) {
    if (enrolledUserIds.length > 0) {
      query = query.in('id', enrolledUserIds);
    } else {
      query = query.in('id', ['00000000-0000-0000-0000-000000000000']);
    }
  }

  const ascending = sortOrder === 'asc';

  // Fetch active events to populate filter
  const [countResult, usersResult, eventsResult] = await Promise.all([
    countQuery,
    query.order(sortBy, { ascending }),
    supabase.from('events').select('id, title').eq('is_active', true)
  ]);

  const totalCount = countResult.count;
  const users = usersResult.data;
  const eventsList = eventsResult.data || [];
  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  // Fetch all attendance for fast mapping circumventing the 1000 row API limit
  let allAttendance: any[] = [];
  let attPage = 0;
  while (true) {
    const { data, error } = await supabase.from('attendance').select('user_id').range(attPage * 1000, (attPage + 1) * 1000 - 1);
    if (error || !data || data.length === 0) break;
    allAttendance.push(...data);
    if (data.length < 1000) break;
    attPage++;
  }

  const attendanceMap = new Map<string, number>();
  allAttendance.forEach(record => {
    attendanceMap.set(record.user_id, (attendanceMap.get(record.user_id) || 0) + 1);
  });

  const getSortLink = (column: string) => {
    const nextOrder = sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc';
    const params = new URLSearchParams();
    params.set('role', role);
    if (q) params.set('q', q);
    if (eventId) params.set('eventId', eventId);
    params.set('sortBy', column);
    params.set('sortOrder', nextOrder);
    params.set('page', '0');
    return `/admin/users?${params.toString()}`;
  };

  const getPageLink = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set('role', role);
    if (q) params.set('q', q);
    if (eventId) params.set('eventId', eventId);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('page', String(targetPage));
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
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
            <UserSearch />
            {role === 'intern' && <ProgramFilter events={eventsList} currentEventId={eventId} />}
          </div>
          {q && (
            <p className="text-sm font-bold text-[#7182C7]">
              Showing results for "<span className="text-[#4A5DB5]">{q}</span>"
            </p>
          )}
        </div>

        <Card className="rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[calc(100vh-280px)]">
              <Table>
                <TableHeader className="bg-[#E9EEF9]/50 sticky top-0 z-10">
                  <TableRow className="border-b-blue-100/50">
                    <TableHead className="font-black text-[#1A1A2E] px-4 py-6">
                      <Link href={getSortLink('full_name')} className="flex items-center gap-1 hover:text-[#4A5DB5] transition-colors">
                        User Profile {sortBy === 'full_name' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </Link>
                    </TableHead>
                    <TableHead className="font-black text-[#1A1A2E]">
                      <Link href={getSortLink('email')} className="flex items-center gap-1 hover:text-[#4A5DB5] transition-colors">
                        Email {sortBy === 'email' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </Link>
                    </TableHead>
                    <TableHead className="font-black text-[#1A1A2E]">
                      <Link href={getSortLink('address')} className="flex items-center gap-1 hover:text-[#4A5DB5] transition-colors">
                        College {sortBy === 'address' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </Link>
                    </TableHead>
                    <TableHead className="font-black text-[#1A1A2E]">
                      <Link href={getSortLink('domain')} className="flex items-center gap-1 hover:text-[#4A5DB5] transition-colors">
                        Branch {sortBy === 'domain' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </Link>
                    </TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-center">
                      <Link href={getSortLink('is_active')} className="flex items-center gap-1 justify-center hover:text-[#4A5DB5] transition-colors">
                        Status {sortBy === 'is_active' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </Link>
                    </TableHead>
                    {role === 'intern' && <TableHead className="font-black text-[#1A1A2E] text-center">Certifications</TableHead>}
                    {role === 'intern' && <TableHead className="font-black text-[#1A1A2E] text-center">Attendance</TableHead>}
                    <TableHead className="font-black text-[#1A1A2E] text-right">
                      <Link href={getSortLink('created_at')} className="flex items-center gap-1 justify-end hover:text-[#4A5DB5] transition-colors">
                        Joined {sortBy === 'created_at' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                      </Link>
                    </TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-right px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!users || users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={role === 'intern' ? 10 : 8} className="text-center py-20">
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
                        <TableCell className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-white border flex items-center justify-center font-black shadow-sm text-sm ${user.role === 'admin' ? 'text-amber-500 border-amber-100' : 'text-[#4A5DB5] border-blue-100'}`}>
                              {user.role === 'admin' ? <Shield size={18} /> : (user.full_name?.charAt(0) || 'U')}
                            </div>
                            <div>
                              <p className="font-black text-[#1A1A2E] text-sm">{user.full_name}</p>
                              {user.role === 'intern' && user.user_enrollments && (user.user_enrollments as any[]).length > 0 && (
                                <p className="text-[10px] text-[#7182C7] font-bold mt-0.5">
                                  📚 {(user.user_enrollments as any[]).map(ue => ue.events?.title).filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[#7182C7] font-medium">{user.email}</TableCell>
                        <TableCell className="font-bold text-[#1A1A2E] text-sm">
                          {user.address || <span className="text-slate-300 italic font-normal">—</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${user.role === 'admin' ? 'bg-amber-500 text-white' : 'bg-[#E9EEF9] text-[#4A5DB5]'}`}>
                            {user.role === 'admin' ? 'Administrator' : (user.domain || '—')}
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
                        {role === 'intern' && (
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-black text-xs">
                              {attendanceMap.get(user.id) || 0} Days
                            </span>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between px-2">
            <p className="text-sm font-bold text-[#7182C7]">
              Showing <span className="text-[#1A1A2E]">{pageNum * PAGE_SIZE + 1}–{Math.min((pageNum + 1) * PAGE_SIZE, totalCount || 0)}</span> of <span className="text-[#1A1A2E]">{totalCount}</span> {role}s
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={getPageLink(pageNum - 1)}
                aria-disabled={pageNum === 0}
                className={`inline-flex items-center h-10 px-4 rounded-xl border border-[#E9EEF9] font-bold text-sm text-[#4A5DB5] hover:bg-[#F8FAFF] transition-colors ${pageNum === 0 ? 'pointer-events-none opacity-40' : ''}`}
              >
                <ChevronLeft size={16} className="mr-1" /> Prev
              </Link>
              <div className="flex items-center gap-1">
                {(() => {
                  let start = Math.max(0, pageNum - 2);
                  let end = Math.min(totalPages - 1, pageNum + 2);
                  if (pageNum < 2) end = Math.min(totalPages - 1, 4);
                  if (pageNum > totalPages - 3) start = Math.max(0, totalPages - 5);
                  
                  const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                  
                  return (
                    <>
                      {start > 0 && (
                        <>
                          <Link href={getPageLink(0)} className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-black transition-all text-[#7182C7] hover:bg-[#E9EEF9]">1</Link>
                          {start > 1 && <span className="text-[#7182C7] px-1">...</span>}
                        </>
                      )}
                      {range.map(i => (
                        <Link
                          key={i}
                          href={getPageLink(i)}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                            i === pageNum
                              ? 'bg-[#4A5DB5] text-white shadow-md shadow-blue-500/20'
                              : 'text-[#7182C7] hover:bg-[#E9EEF9]'
                          }`}
                        >
                          {i + 1}
                        </Link>
                      ))}
                      {end < totalPages - 1 && (
                        <>
                          {end < totalPages - 2 && <span className="text-[#7182C7] px-1">...</span>}
                          <Link href={getPageLink(totalPages - 1)} className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-black transition-all text-[#7182C7] hover:bg-[#E9EEF9]">{totalPages}</Link>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
              <Link
                href={getPageLink(pageNum + 1)}
                aria-disabled={pageNum >= totalPages - 1}
                className={`inline-flex items-center h-10 px-4 rounded-xl border border-[#E9EEF9] font-bold text-sm text-[#4A5DB5] hover:bg-[#F8FAFF] transition-colors ${pageNum >= totalPages - 1 ? 'pointer-events-none opacity-40' : ''}`}
              >
                Next <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
