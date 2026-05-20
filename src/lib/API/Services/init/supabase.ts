import 'server-only';

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../../../supabase/types';

//https://github.com/vercel/next.js/issues/45371

//import type { Database } from '@/lib/database.types'

export const SupabaseServerClient = async () => {
  const cookieStore = await cookies();
  return createServerComponentClient<any>({ cookies: () => cookieStore as any });
};
