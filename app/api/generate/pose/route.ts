import { createClient } from '@/lib/supabase/server'
import { consumeTokens, refundTokens } from '@/lib/tokens'
import { generatePose } from '@/services/geminiService'
import { uploadImageToStorage, saveImageHistory } from '@/lib/storage'
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

    const {
      base64Image,
      mimeType,
      poseDescription,
      referenceImageBase64,
      referenceImageMimeType,
      additionalPrompt,
      attachedImageBase64,
      attachedImageMimeType,
      model
    } = await request.json()

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS },
        { status: 400 }
      )
    }

    // ポーズの説明または参考画像のどちらかが必要
    if (!poseDescription && !referenceImageBase64) {
      return NextResponse.json(
        { error: 'ポーズの説明または参考画像のどちらかを提供してください' },
        { status: 400 }
      )
    }

    // Consume tokens (1 token for pose generation)
    const result = await consumeTokens(user.id, 'POSE_GENERATION', model || 'gemini-2.5-flash-image')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.INSUFFICIENT_TOKENS, tokens: result.newBalance },
        { status: 402 }
      )
    }

    // Generate pose
    try {
      const imageUrl = await generatePose(
        base64Image,
        mimeType,
        poseDescription || '',
        referenceImageBase64,
        referenceImageMimeType,
        additionalPrompt || '',
        attachedImageBase64,
        attachedImageMimeType,
        model || 'gemini-2.5-flash-image'
      )

      // 画像をStorageに保存して公開URLを取得
      let publicUrl: string = imageUrl

      try {
        publicUrl = await uploadImageToStorage(
          user.id,
          imageUrl,
          'pose_generation.png'
        )

        // 履歴に保存
        await saveImageHistory({
          userId: user.id,
          generationType: 'pose_generation',
          additionalPrompt: poseDescription || 'Reference image provided',
          images: { pose: publicUrl },
        })

        console.log('[Storage] Pose image saved to history')
      } catch (storageError) {
        console.error('[Storage] Failed to save to storage:', storageError)
        // Storageエラーでも生成した画像は返す
      }

      return NextResponse.json({
        image: publicUrl,
        tokens: result.newBalance,
      })

    } catch (generationError) {
      console.error('[API] Generation error:', generationError)

      // トークンを返金
      try {
        await refundTokens(user.id, 'POSE_GENERATION', model || 'gemini-2.5-flash-image')
        console.log('[Tokens] Refunded tokens due to generation failure')
      } catch (refundError) {
        console.error('[Tokens] Failed to refund tokens:', refundError)
      }

      const errorMessage = generationError instanceof Error
        ? generationError.message
        : 'ポーズ生成に失敗しました'

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERATION_FAILED
      },
      { status: 500 }
    )
  }
}
