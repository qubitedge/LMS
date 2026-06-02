import { createClient } from '@/lib/supabase/server';
import { AttendanceClient } from './AttendanceClient';

export const revalidate = 60;

export default async function AdminAttendancePage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const dateStr = typeof searchParams.date === 'string' ? searchParams.date : '';
  const collegeStr = typeof searchParams.college === 'string' ? searchParams.college : '';

  const supabase = await createClient();

  let query = supabase
    .from('attendance')
    .select('*, profiles(full_name, email, domain, address)')
    .order('date', { ascending: false })
    .order('checked_in_at', { ascending: false });

  if (dateStr) {
    query = query.eq('date', dateStr);
  }

  const { data: attendance } = await query;
  
  // Filter by college in JS if inner join filtering is tricky with supabase postgREST for nested tables in a simple query
  let filteredAttendance = attendance;
  if (collegeStr) {
    filteredAttendance = attendance?.filter((entry: any) => 
      entry.profiles?.address?.toLowerCase().includes(collegeStr.toLowerCase())
    ) || [];
  }

  return (
    <AttendanceClient 
      initialData={filteredAttendance || []} 
      initialDate={dateStr}
      initialCollege={collegeStr}
    />
  );
}
