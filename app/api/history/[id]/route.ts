import { createClient } from '@/lib/supabase/server'
import { deleteImageHistory } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params
    await deleteImageHistory(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete image history:', error)
    return NextResponse.json(
      { error: 'Failed to delete image history' },
      { status: 500 }
    )
  }
}
