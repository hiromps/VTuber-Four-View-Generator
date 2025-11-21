import { createClient } from '@/lib/supabase/server'
import { consumeTokens, refundTokens } from '@/lib/tokens'
import { generateCharacterSheetView } from '@/services/geminiService'
import { uploadImageToStorage, saveImageHistory } from '@/lib/storage'
import { ViewType } from '@/types'
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

    // Consume tokens (4 tokens for character sheet - all 4 views)
    const result = await consumeTokens(user.id, 'CHARACTER_SHEET', model || 'gemini-2.5-flash-image')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.INSUFFICIENT_TOKENS, tokens: result.newBalance },
        { status: 402 }
      )
    }

    // Generate all 4 views in parallel
    try {
      const views: ViewType[] = ['front', 'back', 'left', 'right']

      const imagePromises = views.map((view) =>
        generateCharacterSheetView(
          base64Image,
          mimeType,
          view,
          additionalPrompt || '',
          attachedImageBase64,
          attachedImageMimeType,
          model || 'gemini-2.5-flash-image'
        ).then((imageUrl) => ({ view, imageUrl }))
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

      // 画像をStorageに保存して公開URLを取得
      const storageUrls: Record<ViewType, string> = {} as Record<ViewType, string>

      try {
        for (const [view, dataUrl] of Object.entries(images)) {
          const publicUrl = await uploadImageToStorage(
            user.id,
            dataUrl,
            `character_sheet_${view}.png`
          )
          storageUrls[view as ViewType] = publicUrl
        }

        // 履歴に保存
        await saveImageHistory({
          userId: user.id,
          generationType: 'character_sheet',
          additionalPrompt: additionalPrompt || undefined,
          images: storageUrls,
        })

        console.log('[Storage] Character sheet images saved to history')
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

      const refundResult = await refundTokens(user.id, 'CHARACTER_SHEET', model || 'gemini-2.5-flash-image')

      if (refundResult.success) {
        console.log(`Tokens refunded successfully. New balance: ${refundResult.newBalance}`)
      } else {
        console.error('Failed to refund tokens:', refundResult.error)
      }

      const errorMessage = getErrorMessage(error)
      const userMessage = getGenerationErrorMessage('CHARACTER_SHEET')

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
    console.error('Character sheet generation error:', error)
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
