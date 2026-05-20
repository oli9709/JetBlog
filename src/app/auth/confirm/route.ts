import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard/main';

  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });

  // PKCE flow: Supabase "code" parametri yuborsa
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error('Code exchange error in confirm:', error.message);
    return NextResponse.redirect(new URL(`/auth/login?error=CodeExchangeFailed`, request.url));
  }

  // OTP flow: "token_hash" + "type" parametrlari yuborilsa
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error('OTP verification error:', error.message);
    return NextResponse.redirect(new URL(`/auth/login?error=InvalidToken`, request.url));
  }

  // Parametrlar yo'q bo'lsa — login ga yo'naltir
  return NextResponse.redirect(new URL('/auth/login?error=MissingParams', request.url));
}
