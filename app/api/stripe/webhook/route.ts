import { stripe } from '@/lib/stripe'
import { addTokens } from '@/lib/tokens'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    const tokens = parseInt(session.metadata?.tokens || '0', 10)
    const packageId = session.metadata?.packageId

    if (!userId || !tokens) {
      console.error('Missing metadata in checkout session:', session.metadata)
      return NextResponse.json(
        { error: 'Invalid session metadata' },
        { status: 400 }
      )
    }

    try {
      const result = await addTokens(userId, tokens, session.id, packageId)

      if (!result.success) {
        console.error('Failed to add tokens:', result.error)
        return NextResponse.json(
          { error: 'Failed to add tokens' },
          { status: 500 }
        )
      }

      console.log(
        `Successfully added ${tokens} tokens to user ${userId}. New balance: ${result.newBalance}`
      )
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
