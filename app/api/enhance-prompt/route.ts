import { enhancePrompt } from '@/services/geminiService'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt cannot be empty' },
        { status: 400 }
      )
    }

    // Gemini Proを使用してプロンプトを最適化
    const enhancedPrompt = await enhancePrompt(prompt)

    return NextResponse.json({
      enhancedPrompt,
    })
  } catch (error) {
    console.error('Prompt enhancement error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enhance prompt' },
      { status: 500 }
    )
  }
}
