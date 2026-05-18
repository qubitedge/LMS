import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import MarkAttendanceButton from './mark-attendance-button';

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
  const isWithinWindow = totalMinutes >= 570 && totalMinutes < 840;

  const { data: attendanceHistory } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  const hasMarkedToday = attendanceHistory?.some(a => a.date === todayStr);

  return (
    <div className="pb-10">
      <div className="mb-10">
        <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
          Attendance
        </h1>
        <p className="text-lg font-bold text-[#7182C7]">
          Mark your daily presence between <span className="text-[#2238A4]">9:30 AM</span> and <span className="text-[#2238A4]">2:00 PM</span>.
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
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-amber-50 flex items-center justify-center mb-6 shadow-inner border border-amber-100">
                    <Clock size={48} className="text-[#F59E0B]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#F59E0B] mb-2 uppercase tracking-tight">
                    {totalMinutes < 570 ? 'Not Started' : totalMinutes >= 840 ? 'Too Late!' : 'Pending'}
                  </h3>
                  <p className="text-xs font-bold text-rose-500 mb-6 uppercase tracking-widest">
                    {totalMinutes < 570 
                      ? 'Opens at 9:30 AM' 
                      : totalMinutes >= 840 
                        ? 'Window closed at 2:00 PM' 
                        : 'Window: 9:30 AM - 2:00 PM'}
                  </p>
                  <MarkAttendanceButton disabled={!isWithinWindow} />
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
              {(!attendanceHistory || attendanceHistory.length === 0) ? (
                <div className="py-20 text-center" style={{ color: '#7182C7' }}>
                  <p className="text-md font-bold">No attendance records found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {attendanceHistory.map((record) => (
                    <div 
                      key={record.id} 
                      className="p-5 rounded-[1.5rem] bg-white border border-blue-50 shadow-sm flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-1 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-100">
                        <CheckCircle2 size={20} className="text-[#10B981]" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#1A1A2E]">
                          {format(parseISO(record.date), 'MMM d')}
                        </p>
                        <p className="text-[10px] font-bold text-[#A0ACDC] uppercase tracking-widest">
                          {format(parseISO(record.checked_in_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
