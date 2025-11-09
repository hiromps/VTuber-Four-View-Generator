/**
 * レート制限ライブラリ
 * IPアドレスベースでAPIリクエストを制限
 */

import { createAdminClient } from '@/lib/supabase/server'

// レート制限設定
const RATE_LIMITS = {
  // 認証関連エンドポイント
  auth: {
    windowMs: 15 * 60 * 1000, // 15分
    maxRequests: 5, // 15分間に5回まで
  },
  // 決済関連エンドポイント
  payment: {
    windowMs: 60 * 60 * 1000, // 1時間
    maxRequests: 10, // 1時間に10回まで
  },
  // 画像生成エンドポイント
  generation: {
    windowMs: 60 * 60 * 1000, // 1時間
    maxRequests: 50, // 1時間に50回まで
  },
  // 一般的なAPIエンドポイント
  general: {
    windowMs: 15 * 60 * 1000, // 15分
    maxRequests: 100, // 15分間に100回まで
  },
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

/**
 * レート制限をチェック
 */
export async function checkRateLimit(
  identifier: string, // IPアドレスまたはユーザーID
  endpoint: keyof typeof RATE_LIMITS = 'general'
): Promise<RateLimitResult> {
  const adminClient = createAdminClient()
  const config = RATE_LIMITS[endpoint]
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowMs)

  try {
    // テーブルが存在しない場合は許可
    const { data: requests, error } = await adminClient
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      // テーブルが存在しない場合はデフォルトで許可
      console.warn('Rate limit table error:', error)
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(now.getTime() + config.windowMs),
      }
    }

    const requestCount = requests?.length || 0
    const remaining = Math.max(0, config.maxRequests - requestCount)
    const allowed = requestCount < config.maxRequests

    // 最も古いリクエストの時刻からリセット時刻を計算
    const oldestRequest = requests?.[requests.length - 1]
    const resetAt = oldestRequest
      ? new Date(new Date(oldestRequest.created_at).getTime() + config.windowMs)
      : new Date(now.getTime() + config.windowMs)

    return {
      allowed,
      remaining,
      resetAt,
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // エラー時はデフォルトで許可
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(now.getTime() + config.windowMs),
    }
  }
}

/**
 * レート制限記録を追加
 */
export async function recordRateLimit(
  identifier: string,
  endpoint: keyof typeof RATE_LIMITS = 'general',
  metadata?: Record<string, any>
): Promise<void> {
  const adminClient = createAdminClient()

  try {
    await adminClient.from('rate_limits').insert({
      identifier,
      endpoint,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to record rate limit:', error)
  }
}

/**
 * 古いレート制限記録をクリーンアップ
 */
export async function cleanupOldRateLimits(): Promise<void> {
  const adminClient = createAdminClient()
  const maxWindow = Math.max(
    ...Object.values(RATE_LIMITS).map((limit) => limit.windowMs)
  )
  const cutoff = new Date(Date.now() - maxWindow * 2).toISOString()

  try {
    await adminClient.from('rate_limits').delete().lt('created_at', cutoff)
  } catch (error) {
    console.error('Failed to cleanup old rate limits:', error)
  }
}

/**
 * IPアドレスをブロックリストに追加
 */
export async function addToBlocklist(
  ipAddress: string,
  reason: string,
  duration?: number // ミリ秒、undefinedの場合は永久ブロック
): Promise<void> {
  const adminClient = createAdminClient()
  const blockedUntil = duration
    ? new Date(Date.now() + duration).toISOString()
    : null

  try {
    await adminClient.from('ip_blocklist').upsert({
      ip_address: ipAddress,
      reason,
      blocked_until: blockedUntil,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    console.log(`IP blocked: ${ipAddress} - ${reason}`)
  } catch (error) {
    console.error('Failed to add to blocklist:', error)
  }
}

/**
 * IPアドレスがブロックリストに含まれているかチェック
 */
export async function isIpBlocked(ipAddress: string): Promise<boolean> {
  const adminClient = createAdminClient()

  try {
    const { data, error } = await adminClient
      .from('ip_blocklist')
      .select('*')
      .eq('ip_address', ipAddress)
      .single()

    if (error || !data) {
      return false
    }

    // ブロック期限が設定されている場合はチェック
    if (data.blocked_until) {
      const blockedUntil = new Date(data.blocked_until)
      if (blockedUntil < new Date()) {
        // ブロック期限が過ぎている場合は削除
        await adminClient
          .from('ip_blocklist')
          .delete()
          .eq('ip_address', ipAddress)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Failed to check IP blocklist:', error)
    return false
  }
}
