import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export function createSupabaseRouteClient() {
  return createRouteHandlerClient<Database>({ cookies });
}
