import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 広告クリック報酬の設定
const AD_CLICK_REWARD = 1 // 1クリック = 1トークン
const COOLDOWN_HOURS = 24 // 24時間のクーリングタイム

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to earn tokens.' },
        { status: 401 }
      )
    }

    const userId = user.id

    // 最後の広告クリック報酬の時刻をチェック
    const { data: lastReward, error: checkError } = await supabase
      .from('transactions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', 'ad_click_reward')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows found (初回クリックの場合)
      console.error('Error checking last ad click reward:', checkError)
      return NextResponse.json(
        { error: 'Failed to check reward eligibility' },
        { status: 500 }
      )
    }

    // クーリングタイムチェック
    if (lastReward) {
      const lastRewardTime = new Date(lastReward.created_at).getTime()
      const now = Date.now()
      const hoursSinceLastReward = (now - lastRewardTime) / (1000 * 60 * 60)

      if (hoursSinceLastReward < COOLDOWN_HOURS) {
        const hoursRemaining = Math.ceil(COOLDOWN_HOURS - hoursSinceLastReward)
        return NextResponse.json(
          {
            error: 'Cooldown active',
            message: `Please wait ${hoursRemaining} hour(s) before claiming your next ad reward.`,
            cooldownRemaining: hoursRemaining,
          },
          { status: 429 } // 429 Too Many Requests
        )
      }
    }

    // 現在のトークン残高を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tokens')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user tokens:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const currentTokens = userData?.tokens || 0
    const newBalance = currentTokens + AD_CLICK_REWARD

    // トークンを追加
    const { error: updateError } = await supabase
      .from('users')
      .update({ tokens: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user tokens:', updateError)
      return NextResponse.json(
        { error: 'Failed to add tokens' },
        { status: 500 }
      )
    }

    // トランザクション記録
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'ad_click_reward',
        amount: AD_CLICK_REWARD,
        balance_after: newBalance,
      })

    if (transactionError) {
      console.error('Error recording ad click reward transaction:', transactionError)
      // トランザクション記録失敗してもトークンは付与されているので、エラーログのみ
    }

    console.log(`Ad click reward granted: userId=${userId}, reward=${AD_CLICK_REWARD}, newBalance=${newBalance}`)

    return NextResponse.json({
      success: true,
      reward: AD_CLICK_REWARD,
      newBalance,
      message: `You earned ${AD_CLICK_REWARD} token! Come back in ${COOLDOWN_HOURS} hours for more.`,
    })
  } catch (error) {
    console.error('Error in ad click reward endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
