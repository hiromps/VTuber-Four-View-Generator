import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeEmail, isValidEmail } from '@/lib/email-utils'

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
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Normalize email to prevent alias abuse
    let normalizedEmail: string
    try {
      normalizedEmail = normalizeEmail(email)
    } catch (error) {
      console.error('Email normalization error:', error)
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // If user exists but trying to use a different email alias, block immediately
    if (existingUser && existingUser.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      console.warn(
        `Alias attempt blocked before magic link: ${email} -> ${existingUser.email} (normalized: ${normalizedEmail})`
      )
      return NextResponse.json(
        {
          error:
            'An account with this email address already exists. Email aliases (e.g., user+tag@example.com) are not allowed.',
        },
        { status: 409 }
      )
    }

    // Also check auth.users to catch users that were created but failed in trigger
    const { data: authUsers } = await adminClient.auth.admin.listUsers()

    if (authUsers?.users) {
      const matchingAuthUser = authUsers.users.find(user => {
        try {
          const authNormalizedEmail = normalizeEmail(user.email || '')
          return authNormalizedEmail === normalizedEmail &&
                 user.email?.toLowerCase().trim() !== email.toLowerCase().trim()
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
            error:
              'An account with this email address already exists. Email aliases (e.g., user+tag@example.com) are not allowed.',
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

      // Handle duplicate account error from trigger
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          {
            error:
              'An account with this email address already exists. Email aliases are not allowed.',
          },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

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
