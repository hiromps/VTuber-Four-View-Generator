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

    const { image, description, model } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS },
        { status: 400 }
      )
    }

    // Consume tokens (5 tokens for Live2D parts design)
    const result = await consumeTokens(user.id, 'LIVE2D_PARTS', model || 'gemini-2.5-flash-image')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.INSUFFICIENT_TOKENS, tokens: result.newBalance },
        { status: 402 }
      )
    }

    // Generate Live2D parts design
    try {
      const { parts } = await generateLive2DParts(image, description || '', model || 'gemini-2.5-flash-image')

      // 各パーツの画像をStorageに保存
      const savedParts = []

      try {
        for (const part of parts) {
          try {
            const publicUrl = await uploadImageToStorage(
              user.id,
              part.image,
              part.filename
            )
            console.log(`[Storage] Saved part: ${part.name} -> ${part.filename}`)
            savedParts.push({
              ...part,
              image: publicUrl
            })
          } catch (partError) {
            console.error(`[Storage] Failed to save part ${part.name}:`, partError)
            // 保存に失敗したパーツはBase64のまま返す
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
          },
        })

        console.log('[Storage] Live2D parts saved to history')
      } catch (storageError) {
        console.error('[Storage] Failed to save to storage:', storageError)
        // Storageエラーでも生成したパーツは返す
      }

      return NextResponse.json({
        parts: savedParts.length > 0 ? savedParts : parts,
        tokensRemaining: result.newBalance,
      })
    } catch (generationError) {
      console.error('[Generation] Live2D parts generation failed:', generationError)

      // Refund tokens on failure
      await refundTokens(user.id, 'LIVE2D_PARTS', model || 'gemini-2.5-flash-image')

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
