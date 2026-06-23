import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Verify who the caller is via their session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized — no active session' }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // 2. Use the admin client to update the password by user ID.
    // This avoids session cookie forwarding issues in production (Vercel/Next.js 16)
    // where supabase.auth.updateUser() can silently fail due to missing session context.
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(user.id, { password });

    if (error) throw error;

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
