import { createClient } from '@/lib/supabase/server'
import { consumeTokens } from '@/lib/tokens'
import { generateFacialExpression } from '@/services/geminiService'
import { uploadImageToStorage, saveImageHistory } from '@/lib/storage'
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

    const { base64Image, mimeType, additionalPrompt, attachedImageBase64, attachedImageMimeType } = await request.json()

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
        generateFacialExpression(
          base64Image,
          mimeType,
          expression,
          additionalPrompt || '',
          attachedImageBase64,
          attachedImageMimeType
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
      // If generation fails, we should ideally refund the tokens
      // For now, just return the error
      console.error('Image generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate facial expressions'
      console.error('Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Facial expressions generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate facial expressions'
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
