import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// @supabase/ssr — Next.js 15/16 uchun to'g'ri yechim
// auth-callback bilan bir xil library → cookie format mos keladi
export const SupabaseServerClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            // Server component da read-only — xato bo'lsa silent ignore
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Route handler da ishlaydi, server component da ishlamaydi — OK
          }
        }
      }
    }
  );
};
