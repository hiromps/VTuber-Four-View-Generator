import { createClient } from '@/lib/supabase/server'
import { consumeTokens, refundTokens } from '@/lib/tokens'
import { generateConceptArt } from '@/services/geminiService'
import { uploadImageToStorage, saveImageHistory } from '@/lib/storage'
import { AspectRatio } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage, getGenerationErrorMessage, ERROR_MESSAGES } from '@/lib/error-messages'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const { prompt, aspectRatio } = await request.json()

    if (!prompt || !aspectRatio) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS },
        { status: 400 }
      )
    }

    if (!['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_ASPECT_RATIO },
        { status: 400 }
      )
    }

    // Consume tokens (1 token for concept art)
    const result = await consumeTokens(user.id, 'CONCEPT_ART')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.INSUFFICIENT_TOKENS, tokens: result.newBalance },
        { status: 402 }
      )
    }

    // Generate the image
    try {
      const imageUrl = await generateConceptArt(prompt, aspectRatio as AspectRatio)

      // 画像をStorageに保存して公開URLを取得
      let storageUrl = imageUrl

      try {
        storageUrl = await uploadImageToStorage(
          user.id,
          imageUrl,
          'concept_art.png'
        )

        // 履歴に保存
        await saveImageHistory({
          userId: user.id,
          generationType: 'concept',
          prompt: prompt,
          aspectRatio: aspectRatio,
          images: storageUrl,
        })

        console.log('[Storage] Concept art image saved to history')
      } catch (storageError) {
        console.error('[Storage] Failed to save to storage:', storageError)
        // Storageエラーでも生成した画像は返す
      }

      return NextResponse.json({
        imageUrl: storageUrl,
        tokens: result.newBalance,
      })
    } catch (error) {
      // Refund tokens when generation fails
      console.error('Image generation error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })

      const refundResult = await refundTokens(user.id, 'CONCEPT_ART')

      if (refundResult.success) {
        console.log(`Tokens refunded successfully. New balance: ${refundResult.newBalance}`)
      } else {
        console.error('Failed to refund tokens:', refundResult.error)
      }

      const errorMessage = getErrorMessage(error)
      const userMessage = getGenerationErrorMessage('CONCEPT_ART')

      return NextResponse.json(
        {
          error: userMessage,
          details: errorMessage,
          tokens: refundResult.newBalance,
          refunded: refundResult.success
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Concept art generation error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })

    const errorMessage = getErrorMessage(error)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
