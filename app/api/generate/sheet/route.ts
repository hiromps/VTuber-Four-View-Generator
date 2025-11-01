import { createClient } from '@/lib/supabase/server'
import { consumeTokens } from '@/lib/tokens'
import { generateCharacterSheetView } from '@/services/geminiService'
import { ViewType } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { base64Image, mimeType } = await request.json()

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Consume tokens (4 tokens for character sheet - all 4 views)
    const result = await consumeTokens(user.id, 'CHARACTER_SHEET')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Insufficient tokens', tokens: result.newBalance },
        { status: 402 }
      )
    }

    // Generate all 4 views in parallel
    try {
      const views: ViewType[] = ['front', 'back', 'left', 'right']

      const imagePromises = views.map((view) =>
        generateCharacterSheetView(base64Image, mimeType, view)
          .then((imageUrl) => ({ view, imageUrl }))
      )

      const results = await Promise.all(imagePromises)

      // Convert results array to object
      const images = results.reduce(
        (acc, { view, imageUrl }) => {
          acc[view] = imageUrl
          return acc
        },
        {} as Record<ViewType, string>
      )

      return NextResponse.json({
        images,
        tokens: result.newBalance,
      })
    } catch (error) {
      // If generation fails, we should ideally refund the tokens
      // For now, just return the error
      console.error('Image generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate character sheet' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Character sheet generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate character sheet' },
      { status: 500 }
    )
  }
}
