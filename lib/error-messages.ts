/**
 * ユーザーフレンドリーなエラーメッセージの定義
 */

export const ERROR_MESSAGES = {
  // 認証関連
  UNAUTHORIZED: '認証が必要です。ログインしてください。',

  // トークン関連
  INSUFFICIENT_TOKENS: 'トークンが不足しています。トークンを購入してください。',
  TOKEN_OPERATION_FAILED: 'トークン処理に失敗しました。もう一度お試しください。',

  // 画像生成関連
  GENERATION_FAILED: '画像の生成に失敗しました。トークンは返金されました。',
  CHARACTER_SHEET_FAILED: 'キャラクターシートの生成に失敗しました。トークンは返金されました。',
  FACIAL_EXPRESSIONS_FAILED: '表情差分の生成に失敗しました。トークンは返金されました。',
  CONCEPT_ART_FAILED: 'コンセプトアートの生成に失敗しました。トークンは返金されました。',

  // 画像関連
  INVALID_IMAGE_FORMAT: '画像形式が無効です。PNG、JPEG、またはWebP形式の画像をアップロードしてください。',
  IMAGE_TOO_LARGE: '画像サイズが大きすぎます。10MB以下の画像をアップロードしてください。',
  IMAGE_UPLOAD_FAILED: '画像のアップロードに失敗しました。もう一度お試しください。',

  // 入力検証関連
  MISSING_REQUIRED_FIELDS: '必須項目が入力されていません。',
  INVALID_ASPECT_RATIO: 'アスペクト比が無効です。',
  INVALID_PROMPT: 'プロンプトが無効です。',

  // ネットワーク・サーバー関連
  NETWORK_ERROR: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
  SERVER_ERROR: 'サーバーエラーが発生しました。しばらく経ってから再度お試しください。',
  TIMEOUT_ERROR: 'リクエストがタイムアウトしました。もう一度お試しください。',

  // ストレージ関連
  STORAGE_ERROR: 'ストレージへの保存に失敗しましたが、画像は生成されました。',
  HISTORY_SAVE_FAILED: '履歴への保存に失敗しましたが、画像は生成されました。',

  // API制限関連
  RATE_LIMIT_EXCEEDED: 'リクエスト数が上限に達しました。しばらく経ってから再度お試しください。',
  QUOTA_EXCEEDED: 'APIの利用上限に達しました。しばらく経ってから再度お試しください。',

  // 一般的なエラー
  UNKNOWN_ERROR: '予期しないエラーが発生しました。もう一度お試しください。',
} as const

/**
 * エラーメッセージを取得する
 * エラーの種類に応じて適切なメッセージを返す
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // 画像形式エラー
    if (message.includes('invalid') && (message.includes('format') || message.includes('mime'))) {
      return ERROR_MESSAGES.INVALID_IMAGE_FORMAT
    }

    // 画像サイズエラー
    if (message.includes('too large') || message.includes('size limit')) {
      return ERROR_MESSAGES.IMAGE_TOO_LARGE
    }

    // ネットワークエラー
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ERROR_MESSAGES.NETWORK_ERROR
    }

    // タイムアウトエラー
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR
    }

    // レート制限エラー
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
    }

    // クォータ超過エラー
    if (message.includes('quota') || message.includes('limit exceeded')) {
      return ERROR_MESSAGES.QUOTA_EXCEEDED
    }

    // ストレージエラー
    if (message.includes('storage')) {
      return ERROR_MESSAGES.STORAGE_ERROR
    }

    // エラーメッセージをそのまま返す（日本語の場合）
    if (error.message && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(error.message)) {
      return error.message
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * 生成タイプに応じたエラーメッセージを取得する
 */
export function getGenerationErrorMessage(type: 'CHARACTER_SHEET' | 'FACIAL_EXPRESSIONS' | 'CONCEPT_ART'): string {
  switch (type) {
    case 'CHARACTER_SHEET':
      return ERROR_MESSAGES.CHARACTER_SHEET_FAILED
    case 'FACIAL_EXPRESSIONS':
      return ERROR_MESSAGES.FACIAL_EXPRESSIONS_FAILED
    case 'CONCEPT_ART':
      return ERROR_MESSAGES.CONCEPT_ART_FAILED
    default:
      return ERROR_MESSAGES.GENERATION_FAILED
  }
}
