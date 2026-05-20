import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (!code) {
      return NextResponse.redirect(`${origin}/auth/login`)
    }

    const cookieStore = await cookies()

    // Response oldin yaratiladi — session cookielar shu response ga yoziladi
    const response = NextResponse.redirect(`${origin}/dashboard/main`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // Session tokenlarini response headeriga yozadi
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          }
        }
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/auth/login`)
    }

    return response

  } catch (err) {
    console.error('Auth callback exception:', err)
    const origin = new URL(request.url).origin
    return NextResponse.redirect(`${origin}/auth/login`)
  }
}
