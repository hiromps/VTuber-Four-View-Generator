import { createClient } from '@/lib/supabase/server'
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

    // Check if an account with this normalized email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('normalized_email', normalizedEmail)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing user:', checkError)
      // Continue anyway - the trigger will handle duplicates
    }

    // If user exists but trying to use a different email alias, reject
    if (existingUser && existingUser.email !== email.toLowerCase().trim()) {
      console.warn(
        `Alias attempt detected: ${email} -> ${existingUser.email} (normalized: ${normalizedEmail})`
      )
      return NextResponse.json(
        {
          error:
            'An account with this email address already exists. Email aliases (e.g., user+tag@example.com) are not allowed.',
        },
        { status: 409 }
      )
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL

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
