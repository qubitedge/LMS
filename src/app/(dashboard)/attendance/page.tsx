import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, CalendarX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import MarkAttendanceButton from './mark-attendance-button';
import MarkPastAttendanceButton from './mark-past-attendance-button';

export const revalidate = 0;

export default async function AttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  // Get date and hour in IST
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const istHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(now), 10);
  const istMinute = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', minute: 'numeric' }).format(now), 10);
  const totalMinutes = istHour * 60 + istMinute;
  const isWithinWindow = totalMinutes >= 615 && totalMinutes < 840;

  // Check if today is a module day (i.e., an unlocked day's date matches today)
  const { data: unlockedSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'unlocked_days')
    .maybeSingle();

  const unlockedDayIds: string[] = unlockedSetting?.value || [];

  // Fetch all module days to list in history, starting from May 18, 2026
  const { data: allDaysData } = await supabase
    .from('days')
    .select('id, date, topic')
    .gte('date', '2026-05-18')
    .order('date', { ascending: true });

  const allModuleDays: any[] = [];
  const seenDates = new Set();
  
  if (allDaysData) {
    for (const day of allDaysData) {
      if (day.date && !seenDates.has(day.date)) {
        seenDates.add(day.date);
        allModuleDays.push(day);
      }
    }
  }

  // Check if today is a module day (regardless of unlock status)
  let isTodayModuleDay = false;
  const todayModule = allModuleDays.find(d => d.date === todayStr);
  if (todayModule) {
    isTodayModuleDay = true;
  }

  // Fetch all attendance for user
  const { data: attendanceHistory } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id);

  // Map for fast lookup
  const markedAttendanceMap = new Map();
  if (attendanceHistory) {
    attendanceHistory.forEach(record => {
      markedAttendanceMap.set(record.date, record);
    });
  }

  const hasMarkedToday = markedAttendanceMap.has(todayStr);

  return (
    <div className="pb-10">
      <div className="mb-10">
        <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
          Attendance
        </h1>
        <p className="text-lg font-bold text-[#7182C7]">
          Mark your daily presence between <span className="text-[#2238A4]">10:15 AM</span> and <span className="text-[#2238A4]">2:00 PM</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <Card className="qe-card border-none shadow-xl text-center p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black text-[#1A1A2E]">Today's Status</CardTitle>
            </CardHeader>
            <CardContent>
              {hasMarkedToday ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
                    <CheckCircle2 size={48} className="text-[#10B981]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#10B981] mb-2 uppercase tracking-tight">Present</h3>
                  <p className="text-sm font-bold text-[#A0ACDC]">
                    Attendance confirmed for {format(new Date(), 'MMMM do')}
                  </p>
                </div>
              ) : isTodayModuleDay ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-amber-50 flex items-center justify-center mb-6 shadow-inner border border-amber-100">
                    <Clock size={48} className="text-[#F59E0B]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#F59E0B] mb-2 uppercase tracking-tight">
                    {totalMinutes < 615 ? 'Not Started' : totalMinutes >= 840 ? 'Too Late!' : 'Pending'}
                  </h3>
                  <p className="text-xs font-bold text-rose-500 mb-6 uppercase tracking-widest">
                    {totalMinutes < 615 
                      ? 'Opens at 10:15 AM' 
                      : totalMinutes >= 840 
                        ? 'Window closed at 2:00 PM' 
                        : 'Window: 10:15 AM - 2:00 PM'}
                  </p>
                  <MarkAttendanceButton disabled={!isWithinWindow} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                    <CalendarX size={48} className="text-[#A0ACDC]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#A0ACDC] mb-2 uppercase tracking-tight">No Class Today</h3>
                  <p className="text-xs font-bold text-[#A0ACDC] uppercase tracking-widest">Attendance is only available on module days.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="qe-card border-none h-full shadow-xl p-6">
            <CardHeader className="pb-8">
              <CardTitle className="text-xl font-black text-[#1A1A2E]">Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              {(!allModuleDays || allModuleDays.length === 0) ? (
                <div className="py-20 text-center" style={{ color: '#7182C7' }}>
                  <p className="text-md font-bold">No module days found.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {allModuleDays.map((moduleDay) => {
                    const attendanceRecord = markedAttendanceMap.get(moduleDay.date);
                    const isFutureDate = moduleDay.date > todayStr;

                    return (
                      <div 
                        key={moduleDay.id} 
                        className={`p-4 rounded-2xl bg-white border shadow-sm flex items-center justify-between transition-all ${isFutureDate ? 'border-slate-100 opacity-70' : 'border-blue-50 hover:shadow-md'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isFutureDate ? 'bg-slate-50 text-slate-400' : (attendanceRecord ? 'bg-emerald-50 text-[#10B981]' : 'bg-amber-50 text-amber-500')}`}>
                            {isFutureDate ? (
                              <CalendarX size={20} />
                            ) : attendanceRecord ? (
                              <CheckCircle2 size={20} />
                            ) : (
                              <Clock size={20} />
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-black ${isFutureDate ? 'text-slate-500' : 'text-[#1A1A2E]'}`}>
                              {moduleDay.date ? format(parseISO(moduleDay.date), 'MMM d, yyyy') : 'TBD'}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isFutureDate ? (
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 whitespace-nowrap">
                              Session hasn't started
                            </span>
                          ) : attendanceRecord ? (
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                Marked
                              </span>
                              {attendanceRecord.checked_in_at && (
                                <p className="text-[10px] text-[#A0ACDC] mt-1 font-bold">
                                  {format(parseISO(attendanceRecord.checked_in_at), 'h:mm a')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <MarkPastAttendanceButton date={moduleDay.date} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
