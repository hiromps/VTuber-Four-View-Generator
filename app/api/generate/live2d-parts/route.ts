import { createClient } from '@/lib/supabase/server'
import { consumeTokens, refundTokens } from '@/lib/tokens'
import { generateLive2DParts } from '@/services/geminiService'
import { uploadImageToStorage, saveImageHistory } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage, ERROR_MESSAGES } from '@/lib/error-messages'

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

    const { image, description } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS },
        { status: 400 }
      )
    }

    // Consume tokens (5 tokens for Live2D parts design)
    const result = await consumeTokens(user.id, 'LIVE2D_PARTS')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.INSUFFICIENT_TOKENS, tokens: result.newBalance },
        { status: 402 }
      )
    }

    // Generate Live2D parts design
    try {
      const { parts, visualizationImage } = await generateLive2DParts(image, description || '')

      // 各パーツの画像をStorageに保存
      const savedParts = []
      let savedVisualizationUrl: string | null = null

      try {
        // 視覚化図解画像を保存
        if (visualizationImage) {
          savedVisualizationUrl = await uploadImageToStorage(
            user.id,
            visualizationImage,
            'live2d_visualization.png'
          )
          console.log('[Storage] Visualization image saved successfully')
        }

        // 各パーツの画像を保存（現在は使用していないが将来的に拡張可能）
        for (const part of parts) {
          if (part.image) {
            const publicUrl = await uploadImageToStorage(
              user.id,
              part.image,
              `live2d_part_${part.name.replace(/\s+/g, '_')}.png`
            )
            savedParts.push({
              ...part,
              image: publicUrl
            })
          } else {
            savedParts.push(part)
          }
        }

        // 履歴に保存
        await saveImageHistory({
          userId: user.id,
          generationType: 'live2d_parts',
          additionalPrompt: description || undefined,
          images: {
            parts: savedParts,
            visualization: savedVisualizationUrl
          },
        })

        console.log('[Storage] Live2D parts saved to history')
      } catch (storageError) {
        console.error('[Storage] Failed to save to storage:', storageError)
        // Storageエラーでも生成したパーツは返す
      }

      return NextResponse.json({
        parts: savedParts,
        visualizationImage: savedVisualizationUrl,
        tokensRemaining: result.newBalance,
      })
    } catch (generationError) {
      console.error('[Generation] Live2D parts generation failed:', generationError)

      // Refund tokens on failure
      await refundTokens(user.id, 'LIVE2D_PARTS')

      return NextResponse.json(
        {
          error: getErrorMessage(generationError) || ERROR_MESSAGES.GENERATION_FAILED,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[API] Live2D parts generation error:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
