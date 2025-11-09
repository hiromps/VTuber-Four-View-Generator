import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isIpBlocked, checkRateLimit, recordRateLimit } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // IPアドレスを取得
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  // IPがブロックリストに含まれているかチェック
  try {
    const blocked = await isIpBlocked(ipAddress)
    if (blocked) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
  } catch (error) {
    console.error('IP blocklist check failed:', error)
  }

  // エンドポイントタイプを判定
  let endpoint: 'auth' | 'payment' | 'generation' | 'general' = 'general'
  if (pathname.startsWith('/api/auth')) {
    endpoint = 'auth'
  } else if (pathname.startsWith('/api/stripe')) {
    endpoint = 'payment'
  } else if (pathname.startsWith('/api/generate')) {
    endpoint = 'generation'
  }

  // レート制限をチェック（APIエンドポイントのみ）
  if (pathname.startsWith('/api/')) {
    try {
      const rateLimitResult = await checkRateLimit(ipAddress, endpoint)

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Too many requests. Please try again later.',
            retryAfter: rateLimitResult.resetAt.toISOString(),
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(
                (rateLimitResult.resetAt.getTime() - Date.now()) / 1000
              ).toString(),
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
            },
          }
        )
      }

      // レート制限記録を追加
      await recordRateLimit(ipAddress, endpoint, {
        pathname,
        method: request.method,
      })
    } catch (error) {
      console.error('Rate limit check failed:', error)
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
