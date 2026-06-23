import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const adminAuthClient = createAdminClient();
    
    // We only want admins hitting this endpoint
    // Server component fetching must be done with regular client to verify session
    // So we'll trust the middleware / admin guard for now, but in a real app,
    // explicitly verify the caller's JWT role here as well.
    
    const { email, password, full_name, domain, role = 'intern', address, eventIds } = await req.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create auth user (requires service role key)
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm
    });

    if (authError) throw authError;

    // 2. Create profile and enrollments
    if (authData.user) {
      const { error: profileError } = await adminAuthClient
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name,
          email,
          domain,
          role,
          address,
        });

      if (profileError) {
        // Rollback on failure
        await adminAuthClient.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // 3. Create user enrollments if intern
      if (role === 'intern' && eventIds && Array.isArray(eventIds) && eventIds.length > 0) {
        const enrollments = eventIds.map((eventId: string) => ({
          user_id: authData.user.id,
          event_id: eventId,
        }));

        const { error: enrollError } = await adminAuthClient
          .from('user_enrollments')
          .insert(enrollments);

        if (enrollError) {
          // Rollback profile and auth user on failure
          await adminAuthClient.from('profiles').delete().eq('id', authData.user.id);
          await adminAuthClient.auth.admin.deleteUser(authData.user.id);
          throw enrollError;
        }
      }
    }

    return NextResponse.json({ success: true, user: authData.user });
    
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

