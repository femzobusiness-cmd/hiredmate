import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

export function createSupabaseBrowserClient() {
  return createClientComponentClient<Database>();
}
