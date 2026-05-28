import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { startOfWeek, endOfWeek, parseISO, format } from 'date-fns';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type'); // 'daily', 'weekly', 'college'
  const dateStr = searchParams.get('date');
  const college = searchParams.get('college');
  
  const supabase = await createClient();
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (type === 'daily' || type === 'college') {
    const targetDate = dateStr || format(new Date(), 'yyyy-MM-dd');
    
    // 1. Fetch profiles
    let profilesQuery = supabase.from('profiles').select('id, full_name, email, domain, address').eq('role', 'intern');
    if (college) {
      profilesQuery = profilesQuery.eq('address', college);
    }
    const { data: profiles, error: pError } = await profilesQuery;
    if (pError) return NextResponse.json({ error: pError.message }, { status: 500 });

    // 2. Fetch attendance
    let attendanceQuery = supabase.from('attendance').select('user_id, checked_in_at').eq('date', targetDate);
    const { data: attendance, error: aError } = await attendanceQuery;
    if (aError) return NextResponse.json({ error: aError.message }, { status: 500 });

    const attendanceMap = new Map((attendance || []).map(a => [a.user_id, a.checked_in_at]));

    // 3. Merge
    const mergedData = (profiles || []).map(p => {
      const checkedInAt = attendanceMap.get(p.id);
      return {
        date: targetDate,
        checked_in_at: checkedInAt || null,
        status: checkedInAt ? '✅ Present' : '❌ Absent',
        profiles: p
      };
    });

    return NextResponse.json({ data: mergedData });
  }

  // Fallback for weekly
  let query = supabase
    .from('attendance')
    .select('id, date, checked_in_at, profiles(full_name, email, domain, address)')
    .order('date', { ascending: false })
    .order('checked_in_at', { ascending: false });

  if (type === 'weekly') {
    const targetDate = dateStr ? parseISO(dateStr) : new Date();
    const start = format(startOfWeek(targetDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const end = format(endOfWeek(targetDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    query = query.gte('date', start).lte('date', end);
    if (college) {
      query = query.eq('profiles.address', college);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  let filteredData = data;
  if (college) {
      filteredData = data?.filter((record: any) => record.profiles?.address === college) || [];
  }

  return NextResponse.json({ data: filteredData });
}
