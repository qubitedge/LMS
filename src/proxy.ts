import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|logo\\.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
