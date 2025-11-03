import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Auth callback error:', error.message)
        // エラーがあってもホームページにリダイレクト
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      // 例外が発生してもホームページにリダイレクト
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', request.url))
}
