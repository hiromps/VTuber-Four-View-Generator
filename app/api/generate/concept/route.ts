import { createClient } from '@/lib/supabase/server'
import { consumeTokens } from '@/lib/tokens'
import { generateConceptArt } from '@/services/geminiService'
import { uploadImageToStorage, saveImageHistory } from '@/lib/storage'
import { AspectRatio } from '@/types'
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

    const { prompt, aspectRatio } = await request.json()

    if (!prompt || !aspectRatio) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio)) {
      return NextResponse.json(
        { error: 'Invalid aspect ratio' },
        { status: 400 }
      )
    }

    // Consume tokens (1 token for concept art)
    const result = await consumeTokens(user.id, 'CONCEPT_ART')

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Insufficient tokens', tokens: result.newBalance },
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
      // If generation fails, we should ideally refund the tokens
      // For now, just return the error
      console.error('Image generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Concept art generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate concept art' },
      { status: 500 }
    )
  }
}
