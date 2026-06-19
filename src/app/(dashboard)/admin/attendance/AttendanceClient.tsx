'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import { CalendarCheck, Download, Calendar, Building2, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 10;

export function AttendanceClient({ initialData, initialDate, initialCollege, initialAttendanceUnlocked }: { initialData: any[], initialDate: string, initialCollege: string, initialAttendanceUnlocked: boolean }) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [date, setDate] = useState(initialDate);
  const [college, setCollege] = useState(initialCollege);
  const [page, setPage] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(initialAttendanceUnlocked);
  const [isToggling, setIsToggling] = useState(false);

  const topAttendees = useMemo(() => {
    if (!initialData || initialData.length === 0) return [];
    const counts: Record<string, any> = {};
    initialData.forEach((entry) => {
      const email = entry.profiles?.email;
      if (!email) return;
      if (!counts[email]) {
        counts[email] = {
          name: entry.profiles?.full_name,
          email: email,
          college: entry.profiles?.address,
          count: 0,
        };
      }
      counts[email].count += 1;
    });
    return Object.values(counts).sort((a: any, b: any) => b.count - a.count).slice(0, 6);
  }, [initialData]);

  const handleFilter = (newDate: string, newCollege: string) => {
    const params = new URLSearchParams();
    if (newDate) params.set('date', newDate);
    if (newCollege) params.set('college', newCollege);
    router.push(`/admin/attendance?${params.toString()}`);
  };

  const handleDownload = async (type: 'daily' | 'weekly' | 'college') => {
    let downloadCollege = college;
    if (type === 'college' && !downloadCollege) {
      const col = window.prompt("Enter the College name to download report:");
      if (!col) return;
      downloadCollege = col;
      setCollege(col);
      handleFilter(date, col);
    }

    setIsDownloading(true);
    try {
      const params = new URLSearchParams();
      params.set('type', type);
      if (date) params.set('date', date);
      if (downloadCollege) params.set('college', downloadCollege);

      const res = await fetch(`/api/admin/attendance/export?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch data for export');
      const { data } = await res.json();

      if (!data || data.length === 0) {
        alert('No data found for the selected filters.');
        setIsDownloading(false);
        return;
      }

      const exportData = data.map((entry: any) => ({
        Date: entry.date,
        Name: entry.profiles?.full_name,
        Email: entry.profiles?.email,
        Domain: entry.profiles?.domain || 'Intern',
        College: entry.profiles?.address || 'N/A',
        Status: entry.status || (entry.checked_in_at ? '✅ Present' : '❌ Absent'),
        'Check-in Time': entry.checked_in_at ? format(parseISO(entry.checked_in_at), 'h:mm:ss a') : 'N/A'
      }));

      // Sort: Present first, Absent second
      exportData.sort((a: any, b: any) => {
        const aIsPresent = a.Status.includes('✅');
        const bIsPresent = b.Status.includes('✅');
        if (aIsPresent && !bIsPresent) return -1;
        if (!aIsPresent && bIsPresent) return 1;
        return 0;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
      
      let filename = 'Attendance_Report.xlsx';
      if (type === 'daily') filename = `Daily_Attendance_${date || format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      if (type === 'weekly') filename = `Weekly_Attendance_${date || format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      if (type === 'college') filename = `College_Attendance_${downloadCollege || 'All'}.xlsx`;

      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleAttendanceLock = async () => {
    setIsToggling(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'attendance_unlocked', value: !isUnlocked })
      });
      if (!res.ok) throw new Error('Failed to update attendance lock status');
      setIsUnlocked(!isUnlocked);
    } catch (error) {
      console.error(error);
      alert('Failed to update attendance lock status');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative pb-10">
      <div className="bg-mesh opacity-20" />
      
      <div className="relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
              Attendance Registry
            </h1>
            <p className="text-lg font-bold text-[#7182C7]">
              Real-time tracking of intern participation and punctuality.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
              <span className="text-sm font-black">Total Attendees:</span>
              <span className="text-lg font-black">{initialData?.length || 0}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <Button
                variant={isUnlocked ? "default" : "outline"}
                className={`font-bold shadow-sm rounded-xl ${isUnlocked ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'}`}
                onClick={handleToggleAttendanceLock}
                disabled={isToggling}
              >
                {isToggling ? 'Updating...' : isUnlocked ? '🔓 Attendance Unlocked' : '🔒 Attendance Locked'}
             </Button>
             <Button 
                variant="outline" 
                className="bg-white/70 backdrop-blur-xl border-white/40 shadow-sm rounded-xl font-bold text-[#4A5DB5] hover:bg-white"
                onClick={() => handleDownload('daily')}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" /> Daily Report
             </Button>
             <Button 
                variant="outline" 
                className="bg-white/70 backdrop-blur-xl border-white/40 shadow-sm rounded-xl font-bold text-[#4A5DB5] hover:bg-white"
                onClick={() => handleDownload('weekly')}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" /> Weekly Report
             </Button>
             <Button 
                variant="outline" 
                className="bg-white/70 backdrop-blur-xl border-white/40 shadow-sm rounded-xl font-bold text-[#4A5DB5] hover:bg-white"
                onClick={() => handleDownload('college')}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" /> College Report
             </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg mb-8 overflow-hidden p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
               <label className="text-xs font-black text-[#7182C7] uppercase tracking-widest px-2">Filter by Date</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A0ACDC]" />
                 <input 
                   type="date"
                   value={date}
                   onChange={(e) => {
                     setDate(e.target.value);
                     handleFilter(e.target.value, college);
                   }}
                   className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9EEF9] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4A5DB5]/20 focus:border-[#4A5DB5] transition-all"
                 />
               </div>
            </div>
            <div className="flex-1 w-full space-y-2">
               <label className="text-xs font-black text-[#7182C7] uppercase tracking-widest px-2">Filter by College</label>
               <div className="relative">
                 <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A0ACDC]" />
                 <input 
                   type="text"
                   placeholder="Enter college name..."
                   value={college}
                   onChange={(e) => setCollege(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleFilter(date, college);
                   }}
                   onBlur={() => handleFilter(date, college)}
                   className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9EEF9] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4A5DB5]/20 focus:border-[#4A5DB5] transition-all"
                 />
               </div>
            </div>
            <Button
              className="h-12 px-6 rounded-xl bg-[#4A5DB5] hover:bg-[#3A4A9A] text-white font-bold shadow-md shadow-blue-500/20"
              onClick={() => {
                const today = format(new Date(), 'yyyy-MM-dd');
                setDate(today);
                handleFilter(today, college);
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl border-[#E9EEF9] text-[#7182C7] font-bold hover:bg-[#F8FAFF]"
              onClick={() => {
                setDate('');
                setCollege('');
                handleFilter('', '');
              }}
            >
              Clear
            </Button>
          </div>
        </Card>

        {/* Top Attendees Section */}
        {topAttendees.length > 0 && !date && (
          <Card className="rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg mb-8 overflow-hidden p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="text-yellow-500 w-6 h-6" />
              <h2 className="text-xl font-black text-[#1A1A2E]">Top Attendees</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {topAttendees.map((attendee, idx) => (
                  <div key={attendee.email} className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-4 flex items-center justify-between border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-lg ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-600' : 
                        idx === 1 ? 'bg-slate-200 text-slate-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-black text-[#1A1A2E] text-sm leading-tight mb-1">{attendee.name || 'Unknown'}</p>
                        <p className="text-xs text-[#7182C7] font-bold truncate max-w-[150px]">{attendee.college || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#4A5DB5] leading-none">{attendee.count}</p>
                      <p className="text-[10px] font-black text-[#7182C7] uppercase tracking-wider mt-1">Days</p>
                    </div>
                  </div>
               ))}
            </div>
          </Card>
        )}

        {(() => {
          const totalPages = Math.ceil((initialData?.length || 0) / PAGE_SIZE);
          const pageData = (initialData || []).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
          const startIdx = page * PAGE_SIZE;

          return (
            <>
              <Card className="rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-auto max-h-[600px]">
                    <Table>
                      <TableHeader className="bg-[#E9EEF9]/50 sticky top-0 z-10 shadow-sm backdrop-blur-md">
                        <TableRow className="border-b-blue-100/50">
                          <TableHead className="font-black text-[#1A1A2E] px-6 py-6 w-[80px] text-center">Sl No</TableHead>
                          <TableHead className="font-black text-[#1A1A2E] px-8 py-6">Intern</TableHead>
                          <TableHead className="font-black text-[#1A1A2E]">College</TableHead>
                          <TableHead className="font-black text-[#1A1A2E]">Category</TableHead>
                          <TableHead className="font-black text-[#1A1A2E] text-center">Date</TableHead>
                          <TableHead className="font-black text-[#1A1A2E] text-right px-8">Check-in Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!initialData || initialData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-20">
                              <div className="flex flex-col items-center gap-4 text-[#7182C7]">
                                <CalendarCheck size={48} className="opacity-20" />
                                <p className="font-bold">No attendance records found.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          pageData.map((entry: any, index: number) => (
                            <TableRow key={entry.id} className="hover:bg-blue-50/30 transition-colors border-b-blue-50/50">
                              <TableCell className="px-6 py-6 text-center">
                                <span className="text-sm font-black text-[#7182C7]">{startIdx + index + 1}</span>
                              </TableCell>
                              <TableCell className="px-8 py-6">
                                <div>
                                  <p className="font-black text-[#1A1A2E]">{entry.profiles?.full_name}</p>
                                  <p className="text-xs text-[#7182C7]">{entry.profiles?.email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm font-bold text-[#4A5DB5] max-w-[200px] truncate" title={entry.profiles?.address || 'N/A'}>
                                  {entry.profiles?.address || 'N/A'}
                                </p>
                              </TableCell>
                              <TableCell>
                                <span className="px-3 py-1 bg-white border border-blue-100 text-[#4A5DB5] rounded-xl text-[10px] font-black uppercase tracking-wider">
                                  {entry.profiles?.domain || 'Intern'}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <p className="text-sm font-black text-[#1A1A2E]">
                                  {format(parseISO(entry.date), 'EEEE')}
                                </p>
                                <p className="text-[10px] font-bold text-[#A0ACDC]">
                                  {format(parseISO(entry.date), 'MMM d, yyyy')}
                                </p>
                              </TableCell>
                              <TableCell className="text-right px-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-xs font-black">
                                    {format(parseISO(entry.checked_in_at), 'h:mm:ss a')}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between px-2">
                  <p className="text-sm font-bold text-[#7182C7]">
                    Showing <span className="text-[#1A1A2E]">{startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, initialData.length)}</span> of <span className="text-[#1A1A2E]">{initialData.length}</span> records
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="h-10 px-4 rounded-xl border-[#E9EEF9] font-bold text-[#4A5DB5] hover:bg-[#F8FAFF] disabled:opacity-40"
                    >
                      <ChevronLeft size={16} className="mr-1" /> Prev
                    </Button>
                    <div className="flex items-center gap-1">
                      {(() => {
                        let start = Math.max(0, page - 2);
                        let end = Math.min(totalPages - 1, page + 2);
                        if (page < 2) end = Math.min(totalPages - 1, 4);
                        if (page > totalPages - 3) start = Math.max(0, totalPages - 5);
                        
                        const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                        
                        return (
                          <>
                            {start > 0 && (
                              <>
                                <button onClick={() => setPage(0)} className="w-9 h-9 rounded-xl text-sm font-black transition-all text-[#7182C7] hover:bg-[#E9EEF9]">1</button>
                                {start > 1 && <span className="text-[#7182C7] px-1">...</span>}
                              </>
                            )}
                            {range.map(i => (
                              <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`w-9 h-9 rounded-xl text-sm font-black transition-all ${
                                  i === page
                                    ? 'bg-[#4A5DB5] text-white shadow-md shadow-blue-500/20'
                                    : 'text-[#7182C7] hover:bg-[#E9EEF9]'
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                            {end < totalPages - 1 && (
                              <>
                                {end < totalPages - 2 && <span className="text-[#7182C7] px-1">...</span>}
                                <button onClick={() => setPage(totalPages - 1)} className="w-9 h-9 rounded-xl text-sm font-black transition-all text-[#7182C7] hover:bg-[#E9EEF9]">{totalPages}</button>
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="h-10 px-4 rounded-xl border-[#E9EEF9] font-bold text-[#4A5DB5] hover:bg-[#F8FAFF] disabled:opacity-40"
                    >
                      Next <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
