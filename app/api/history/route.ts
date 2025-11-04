import { createClient } from '@/lib/supabase/server'
import { getImageHistory } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // クエリパラメータからlimitとoffsetを取得
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const history = await getImageHistory(user.id, limit, offset)

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Failed to fetch image history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image history' },
      { status: 500 }
    )
  }
}
