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

  let query = supabase
    .from('attendance')
    .select('id, date, checked_in_at, profiles(full_name, email, domain, address)')
    .order('date', { ascending: false })
    .order('checked_in_at', { ascending: false });

  if (type === 'daily') {
    if (dateStr) {
      query = query.eq('date', dateStr);
    } else {
      query = query.eq('date', format(new Date(), 'yyyy-MM-dd'));
    }
    if (college) {
      query = query.eq('profiles.address', college);
    }
  } else if (type === 'weekly') {
    const targetDate = dateStr ? parseISO(dateStr) : new Date();
    const start = format(startOfWeek(targetDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const end = format(endOfWeek(targetDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    query = query.gte('date', start).lte('date', end);
    if (college) {
      query = query.eq('profiles.address', college);
    }
  } else if (type === 'college') {
    if (college) {
      query = query.eq('profiles.address', college);
    }
    if (dateStr) {
      query = query.eq('date', dateStr);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Filter out null profiles (if inner join didn't work as expected with PostgREST eq on joined table)
  let filteredData = data;
  if (college) {
      filteredData = data?.filter((record: any) => record.profiles?.address === college) || [];
  }

  return NextResponse.json({ data: filteredData });
}
