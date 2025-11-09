import { createAdminClient } from '@/lib/supabase/server'

// 設定
const MAX_LOGIN_ATTEMPTS = 10 // 最大ログイン試行回数
const LOCK_DURATION_MINUTES = 30 // アカウントロック時間（分）
const ATTEMPT_WINDOW_MINUTES = 15 // ログイン試行をカウントする時間枠（分）

interface LoginAttempt {
  email: string
  ip_address: string
  success: boolean
  user_agent?: string
}

/**
 * ログイン試行を記録する
 */
export async function recordLoginAttempt(attempt: LoginAttempt): Promise<void> {
  const adminClient = createAdminClient()

  try {
    await adminClient.from('login_attempts').insert({
      email: attempt.email.toLowerCase().trim(),
      ip_address: attempt.ip_address,
      success: attempt.success,
      user_agent: attempt.user_agent,
      attempted_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to record login attempt:', error)
  }
}

/**
 * アカウントがロックされているかチェック
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const adminClient = createAdminClient()
  const normalizedEmail = email.toLowerCase().trim()

  try {
    const { data: lock, error } = await adminClient
      .from('account_locks')
      .select('*')
      .eq('email', normalizedEmail)
      .single()

    if (error || !lock) {
      return false
    }

    // ロック期限が過ぎていればロックを解除
    if (lock.locked_until && new Date(lock.locked_until) < new Date()) {
      await unlockAccount(normalizedEmail)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to check account lock:', error)
    return false
  }
}

/**
 * 失敗したログイン試行回数を取得
 */
export async function getFailedLoginAttempts(
  email: string,
  ipAddress: string
): Promise<number> {
  const adminClient = createAdminClient()
  const normalizedEmail = email.toLowerCase().trim()
  const windowStart = new Date(
    Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000
  ).toISOString()

  try {
    // メールアドレスまたはIPアドレスからの失敗回数をカウント
    const { count: emailCount } = await adminClient
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .eq('success', false)
      .gte('attempted_at', windowStart)

    const { count: ipCount } = await adminClient
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .eq('success', false)
      .gte('attempted_at', windowStart)

    // より高い方の失敗回数を返す
    return Math.max(emailCount || 0, ipCount || 0)
  } catch (error) {
    console.error('Failed to get failed login attempts:', error)
    return 0
  }
}

/**
 * アカウントをロックする
 */
export async function lockAccount(email: string, reason?: string): Promise<void> {
  const adminClient = createAdminClient()
  const normalizedEmail = email.toLowerCase().trim()
  const lockedUntil = new Date(
    Date.now() + LOCK_DURATION_MINUTES * 60 * 1000
  ).toISOString()

  try {
    await adminClient.from('account_locks').upsert({
      email: normalizedEmail,
      locked_at: new Date().toISOString(),
      locked_until: lockedUntil,
      reason: reason || 'Too many failed login attempts',
      updated_at: new Date().toISOString(),
    })

    console.log(`Account locked: ${normalizedEmail} until ${lockedUntil}`)
  } catch (error) {
    console.error('Failed to lock account:', error)
  }
}

/**
 * アカウントのロックを解除する
 */
export async function unlockAccount(email: string): Promise<void> {
  const adminClient = createAdminClient()
  const normalizedEmail = email.toLowerCase().trim()

  try {
    await adminClient
      .from('account_locks')
      .delete()
      .eq('email', normalizedEmail)

    console.log(`Account unlocked: ${normalizedEmail}`)
  } catch (error) {
    console.error('Failed to unlock account:', error)
  }
}

/**
 * ログイン成功時に失敗記録をクリア
 */
export async function clearLoginAttempts(email: string): Promise<void> {
  const adminClient = createAdminClient()
  const normalizedEmail = email.toLowerCase().trim()

  try {
    // 失敗記録を削除
    await adminClient
      .from('login_attempts')
      .delete()
      .eq('email', normalizedEmail)
      .eq('success', false)

    // アカウントロックを解除
    await unlockAccount(normalizedEmail)
  } catch (error) {
    console.error('Failed to clear login attempts:', error)
  }
}

/**
 * ログイン試行をチェックして、必要に応じてアカウントをロック
 */
export async function checkAndLockIfNeeded(
  email: string,
  ipAddress: string
): Promise<{ shouldLock: boolean; remainingAttempts: number }> {
  // 既にロックされているかチェック
  const locked = await isAccountLocked(email)
  if (locked) {
    return { shouldLock: true, remainingAttempts: 0 }
  }

  // 失敗回数を取得
  const failedAttempts = await getFailedLoginAttempts(email, ipAddress)

  // 最大試行回数に達したかチェック
  if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    await lockAccount(email)
    return { shouldLock: true, remainingAttempts: 0 }
  }

  const remainingAttempts = MAX_LOGIN_ATTEMPTS - failedAttempts
  return { shouldLock: false, remainingAttempts }
}
