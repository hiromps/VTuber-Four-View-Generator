import { createClient } from '@/lib/supabase/server'
import { consumeTokens, refundTokens } from '@/lib/tokens'
import { generateFacialExpression } from '@/services/geminiService'
import { uploadImageToStorage, saveImageHistory } from '@/lib/storage'
import { ExpressionType } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage, getGenerationErrorMessage, ERROR_MESSAGES } from '@/lib/error-messages'

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
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const { base64Image, mimeType, additionalPrompt, attachedImageBase64, attachedImageMimeType, model } = await request.json()

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS },
        { status: 400 }
      )
    }

    // Consume tokens (4 tokens for facial expressions - all 4 expressions)
    const result = await consumeTokens(user.id, 'FACIAL_EXPRESSIONS', model || 'gemini-2.5-flash-image')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.INSUFFICIENT_TOKENS, tokens: result.newBalance },
        { status: 402 }
      )
    }

    // Generate all 4 expressions in parallel
    try {
      const expressions: ExpressionType[] = ['joy', 'anger', 'sorrow', 'surprise']

      const imagePromises = expressions.map((expression) =>
        generateFacialExpression(
          base64Image,
          mimeType,
          expression,
          additionalPrompt || '',
          attachedImageBase64,
          attachedImageMimeType,
          model || 'gemini-2.5-flash-image'
        ).then((imageUrl) => ({ expression, imageUrl }))
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

      // 画像をStorageに保存して公開URLを取得
      const storageUrls: Record<ExpressionType, string> = {} as Record<ExpressionType, string>

      try {
        for (const [expression, dataUrl] of Object.entries(images)) {
          const publicUrl = await uploadImageToStorage(
            user.id,
            dataUrl,
            `facial_expression_${expression}.png`
          )
          storageUrls[expression as ExpressionType] = publicUrl
        }

        // 履歴に保存
        await saveImageHistory({
          userId: user.id,
          generationType: 'facial_expressions',
          additionalPrompt: additionalPrompt || undefined,
          images: storageUrls,
        })

        console.log('[Storage] Facial expression images saved to history')
      } catch (storageError) {
        console.error('[Storage] Failed to save to storage:', storageError)
        // Storageエラーでも生成した画像は返す
      }

      return NextResponse.json({
        images: storageUrls,
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

      const refundResult = await refundTokens(user.id, 'FACIAL_EXPRESSIONS', model || 'gemini-2.5-flash-image')

      if (refundResult.success) {
        console.log(`Tokens refunded successfully. New balance: ${refundResult.newBalance}`)
      } else {
        console.error('Failed to refund tokens:', refundResult.error)
      }

      const errorMessage = getErrorMessage(error)
      const userMessage = getGenerationErrorMessage('FACIAL_EXPRESSIONS')

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
    console.error('Facial expressions generation error:', error)
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
