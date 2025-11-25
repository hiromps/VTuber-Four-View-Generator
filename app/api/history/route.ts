import { createClient } from '@/lib/supabase/server'
import { getImageHistory, getImageHistoryWithFilters } from '@/lib/storage'
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

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const type = searchParams.get('type') || undefined
    const search = searchParams.get('search') || undefined
    const sort = searchParams.get('sort') as 'newest' | 'oldest' | 'type' | undefined

    // フィルタやソートが指定されている場合は拡張関数を使用
    if (type || search || sort) {
      const result = await getImageHistoryWithFilters({
        userId: user.id,
        limit,
        offset,
        type,
        search,
        sort: sort || 'newest',
      })

      return NextResponse.json(result)
    }

    // 従来の単純な取得
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
