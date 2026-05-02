import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const adminAuthClient = createAdminClient();
    const { id, email, password, full_name, domain, role, is_active } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // 1. Update Auth User if email or password is provided
    const updateData: any = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    if (Object.keys(updateData).length > 0) {
      const { error: authError } = await adminAuthClient.auth.admin.updateUserById(id, updateData);
      if (authError) throw authError;
    }

    // 2. Update Profile
    const profileUpdate: any = {};
    if (full_name) profileUpdate.full_name = full_name;
    if (email) profileUpdate.email = email;
    if (domain) profileUpdate.domain = domain;
    if (role) profileUpdate.role = role;
    if (typeof is_active === 'boolean') profileUpdate.is_active = is_active;

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await adminAuthClient
        .from('profiles')
        .update(profileUpdate)
        .eq('id', id);

      if (profileError) throw profileError;
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
