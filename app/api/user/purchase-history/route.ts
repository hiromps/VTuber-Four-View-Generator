import { createClient } from '@/lib/supabase/server'
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

    // Get packageId from query parameter
    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Check if user has purchased this specific package
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'purchase')
      .eq('package_id', packageId)
      .limit(1)

    if (error) {
      console.error('Error checking purchase history:', error)
      return NextResponse.json(
        { error: 'Failed to check purchase history' },
        { status: 500 }
      )
    }

    const hasPurchased = (data?.length ?? 0) > 0

    return NextResponse.json({ hasPurchased })
  } catch (error) {
    console.error('Error in purchase history endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to check purchase history' },
      { status: 500 }
    )
  }
}
