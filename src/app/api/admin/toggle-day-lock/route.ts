import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if user is an administrator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    // 3. Read settings from body
    const { unlockedDays } = await req.json();

    if (!Array.isArray(unlockedDays)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    // 4. Save to site_settings
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'unlocked_days',
        value: unlockedDays,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, unlockedDays });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
