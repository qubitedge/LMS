import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const { users } = await req.json();

    if (!Array.isArray(users)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    const results = {
      added: [] as any[],
      skipped: [] as any[],
      errors: [] as any[],
    };

    for (const userData of users) {
      const { name, email, password, domain, role = 'intern', address } = userData;

      if (!email || !password || !name) {
        results.errors.push({ email, error: 'Missing required fields' });
        continue;
      }

      // Check if user already exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        results.skipped.push({ email, name, reason: 'User already exists' });
        continue;
      }

      // Create user in Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name }
      });

      if (authError) {
        results.errors.push({ email, error: authError.message });
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          full_name: name,
          email,
          role,
          domain,
          address,
        });

      if (profileError) {
        // Cleanup Auth user if profile fails
        await supabase.auth.admin.deleteUser(authUser.user.id);
        results.errors.push({ email, error: profileError.message });
      } else {
        results.added.push({ email, name });
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
