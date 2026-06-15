import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await req.json();

    if (!['AI/ML', 'Python', 'Data Analytics', 'IoT'].includes(domain)) {
      return NextResponse.json({ message: 'Invalid domain' }, { status: 400 });
    }

    // Insert capstone selection
    const { error } = await supabase
      .from('capstone_selections')
      .insert({
        user_id: user.id,
        domain
      });

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ message: 'You have already submitted your selection.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error submitting capstone domain:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
