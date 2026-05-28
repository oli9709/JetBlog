import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  try {
    // Next.js 16 da cookies() async — await qilish shart
    const cookieStore = await cookies()

    // Redirect response oldin yaratiladi — session cookie shu response ga yoziladi
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
            cookiesToSet.forEach(({ name, value, options }) => {
              // Ikki joyga yoziladi: cookieStore + response headers
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
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
    return NextResponse.redirect(`${origin}/auth/login`)
  }
}
