import { createClient } from '@/lib/supabase/server'
import { consumeTokens } from '@/lib/tokens'
import { generateFacialExpression } from '@/services/geminiService'
import { ExpressionType } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

// APIルートのボディサイズ制限を10MBに設定
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

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

    const { base64Image, mimeType, additionalPrompt } = await request.json()

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Consume tokens (4 tokens for facial expressions - all 4 expressions)
    const result = await consumeTokens(user.id, 'FACIAL_EXPRESSIONS')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Insufficient tokens', tokens: result.newBalance },
        { status: 402 }
      )
    }

    // Generate all 4 expressions in parallel
    try {
      const expressions: ExpressionType[] = ['joy', 'anger', 'sorrow', 'surprise']

      const imagePromises = expressions.map((expression) =>
        generateFacialExpression(base64Image, mimeType, expression, additionalPrompt || '')
          .then((imageUrl) => ({ expression, imageUrl }))
      )

      const results = await Promise.all(imagePromises)

      // Convert results array to object
      const images = results.reduce(
        (acc, { expression, imageUrl }) => {
          acc[expression] = imageUrl
          return acc
        },
        {} as Record<ExpressionType, string>
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
        { error: 'Failed to generate facial expressions' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Facial expressions generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate facial expressions' },
      { status: 500 }
    )
  }
}
