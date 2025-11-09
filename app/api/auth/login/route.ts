import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeEmail, isValidEmail } from '@/lib/email-utils'
import en from '@/locales/en.json'
import ja from '@/locales/ja.json'
import {
  isAccountLocked,
  checkAndLockIfNeeded,
  recordLoginAttempt,
  clearLoginAttempts,
} from '@/lib/auth/login-attempts'

// Get translation based on Accept-Language header
function getTranslation(request: NextRequest, key: string): string {
  const language = request.headers.get('accept-language') || 'en'
  const translations = language.startsWith('ja') ? ja : en

  const keys = key.split('.')
  let value: any = translations

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: getTranslation(request, 'auth.invalidEmailFormat') },
        { status: 400 }
      )
    }

    // IPアドレスを取得
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    // アカウントがロックされているかチェック
    const locked = await isAccountLocked(email)
    if (locked) {
      // ログイン試行を記録（失敗）
      await recordLoginAttempt({
        email,
        ip_address: ipAddress,
        success: false,
        user_agent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(
        {
          error: getTranslation(request, 'auth.accountLocked'),
        },
        { status: 429 }
      )
    }

    // Normalize email to prevent alias abuse
    let normalizedEmail: string
    try {
      normalizedEmail = normalizeEmail(email)
    } catch (error) {
      console.error('Email normalization error:', error)
      return NextResponse.json(
        { error: getTranslation(request, 'auth.invalidEmailFormat') },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Check if normalized_email column exists in users table
    const { data: columns } = await adminClient
      .from('users')
      .select('normalized_email')
      .limit(1)

    let existingUser = null

    // If normalized_email column exists (migration has been run)
    if (columns !== null) {
      const { data, error: checkError } = await adminClient
        .from('users')
        .select('id, email, normalized_email')
        .eq('normalized_email', normalizedEmail)
        .maybeSingle()

      if (!checkError && data) {
        existingUser = data
      }
    } else {
      // If migration hasn't been run yet, check all emails manually
      console.log('normalized_email column not found, checking all emails manually')
      const { data: allUsers, error: usersError } = await adminClient
        .from('users')
        .select('id, email')

      if (!usersError && allUsers) {
        // Find user with matching normalized email
        existingUser = allUsers.find(user => {
          try {
            return normalizeEmail(user.email) === normalizedEmail
          } catch {
            return false
          }
        })
      }
    }

    // Check if user exists with normalized email
    if (existingUser) {
      const inputEmail = email.toLowerCase().trim()
      const existingEmail = existingUser.email?.toLowerCase().trim()

      console.log('Existing user found:', existingUser)
      console.log('Email check:', {
        input: inputEmail,
        existing: existingEmail,
        normalized: normalizedEmail,
        match: inputEmail === existingEmail,
        existingUserEmail: existingUser.email
      })

      // If emails match exactly, this is a normal sign-in (allow)
      if (inputEmail === existingEmail) {
        console.log('Normal sign-in detected, proceeding...')
        // Continue to send magic link
      }
      // If emails don't match, this is an alias attempt (block)
      else {
        console.warn(
          `Alias attempt blocked before magic link: ${email} -> ${existingUser.email} (normalized: ${normalizedEmail})`
        )
        return NextResponse.json(
          {
            error: getTranslation(request, 'auth.emailAliasNotAllowed'),
          },
          { status: 409 }
        )
      }
    }

    // Also check auth.users to catch users that were created but failed in trigger
    const { data: authUsers } = await adminClient.auth.admin.listUsers()

    if (authUsers?.users) {
      const inputEmail = email.toLowerCase().trim()

      const matchingAuthUser = authUsers.users.find(user => {
        try {
          const authNormalizedEmail = normalizeEmail(user.email || '')
          const authEmail = user.email?.toLowerCase().trim()

          // Only match if normalized emails match but actual emails differ (alias case)
          return authNormalizedEmail === normalizedEmail && authEmail !== inputEmail
        } catch {
          return false
        }
      })

      if (matchingAuthUser) {
        console.warn(
          `Alias attempt blocked (found in auth.users): ${email} -> ${matchingAuthUser.email} (normalized: ${normalizedEmail})`
        )
        return NextResponse.json(
          {
            error: getTranslation(request, 'auth.emailAliasNotAllowed'),
          },
          { status: 409 }
        )
      }
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL

    // Only proceed with magic link if no alias detected
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Magic link error:', error)

      // ログイン失敗を記録
      await recordLoginAttempt({
        email,
        ip_address: ipAddress,
        success: false,
        user_agent: request.headers.get('user-agent') || undefined,
      })

      // 失敗回数をチェックしてアカウントロックが必要かチェック
      const { shouldLock, remainingAttempts } = await checkAndLockIfNeeded(
        email,
        ipAddress
      )

      // Handle duplicate account error from trigger
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          {
            error: getTranslation(request, 'auth.emailAliasNotAllowed'),
            remainingAttempts: shouldLock ? 0 : remainingAttempts,
          },
          { status: 409 }
        )
      }

      // 一般的なエラーメッセージを返す（セキュリティ強化）
      return NextResponse.json(
        {
          error: getTranslation(request, 'auth.loginFailed'),
          remainingAttempts: shouldLock ? 0 : remainingAttempts,
        },
        { status: shouldLock ? 429 : 400 }
      )
    }

    // ログイン成功を記録
    await recordLoginAttempt({
      email,
      ip_address: ipAddress,
      success: true,
      user_agent: request.headers.get('user-agent') || undefined,
    })

    // 成功時は失敗記録をクリア
    await clearLoginAttempts(email)

    return NextResponse.json({
      message: 'Magic link sent! Please check your email.',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}
