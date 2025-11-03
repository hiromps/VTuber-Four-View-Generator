/**
 * メールアドレスを正規化してエイリアスを無効化する
 *
 * Gmail、Outlook、Yahoo等の主要メールプロバイダーのエイリアス機能に対応：
 * - Gmail: `+`記号以降を削除、ドット(.)を無視
 * - Outlook/Hotmail: `+`記号以降を削除
 * - Yahoo: `-`記号のエイリアスに対応
 *
 * @param email - 正規化するメールアドレス
 * @returns 正規化されたメールアドレス（すべて小文字）
 *
 * @example
 * normalizeEmail('akihiro19970324+1@gmail.com') // => 'akihiro19970324@gmail.com'
 * normalizeEmail('Akihiro.Test+alias@gmail.com') // => 'akihirotest@gmail.com'
 * normalizeEmail('user+tag@outlook.com') // => 'user@outlook.com'
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email address')
  }

  // 小文字に変換してトリム
  const trimmedEmail = email.toLowerCase().trim()

  // メールアドレスのフォーマット検証
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error('Invalid email format')
  }

  const [localPart, domain] = trimmedEmail.split('@')

  // ドメイン別の正規化処理
  let normalizedLocal = localPart

  // Gmail: `+`以降を削除、ドットを削除
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    normalizedLocal = localPart
      .split('+')[0]  // `+`以降を削除
      .replace(/\./g, '')  // すべてのドットを削除
  }
  // Outlook/Hotmail: `+`以降を削除
  else if (
    domain === 'outlook.com' ||
    domain === 'hotmail.com' ||
    domain === 'live.com' ||
    domain === 'msn.com'
  ) {
    normalizedLocal = localPart.split('+')[0]
  }
  // Yahoo: `-`エイリアスに対応
  else if (
    domain === 'yahoo.com' ||
    domain === 'yahoo.co.jp' ||
    domain === 'ymail.com'
  ) {
    normalizedLocal = localPart.split('-')[0]
  }
  // その他のプロバイダー: `+`以降を削除（一般的なエイリアス対策）
  else {
    normalizedLocal = localPart.split('+')[0]
  }

  return `${normalizedLocal}@${domain}`
}

/**
 * メールアドレスの基本的なバリデーション
 *
 * @param email - 検証するメールアドレス
 * @returns 有効な場合true
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}
