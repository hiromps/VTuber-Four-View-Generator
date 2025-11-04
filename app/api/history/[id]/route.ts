import { createClient } from '@/lib/supabase/server'
import { deleteImageHistory } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteImageHistory(params.id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete image history:', error)
    return NextResponse.json(
      { error: 'Failed to delete image history' },
      { status: 500 }
    )
  }
}
