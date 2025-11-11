import { createClient } from '@/lib/supabase/server'

/**
 * Base64画像データをSupabase Storageにアップロード
 */
export async function uploadImageToStorage(
  userId: string,
  base64Data: string,
  fileName: string
): Promise<string> {
  const supabase = await createClient()

  // Base64データからBlobに変換（data:image/png;base64,を除く）
  const base64WithoutPrefix = base64Data.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64WithoutPrefix, 'base64')

  // ファイルパス: {userId}/{timestamp}_{fileName}
  const timestamp = Date.now()
  const filePath = `${userId}/${timestamp}_${fileName}`

  // Storageにアップロード
  const { data, error } = await supabase.storage
    .from('generated-images')
    .upload(filePath, buffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Storage upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // 公開URLを取得
  const {
    data: { publicUrl },
  } = supabase.storage.from('generated-images').getPublicUrl(filePath)

  return publicUrl
}

/**
 * 画像履歴をデータベースに保存
 */
export async function saveImageHistory(data: {
  userId: string
  generationType: 'concept' | 'character_sheet' | 'facial_expressions' | 'pose_generation'
  prompt?: string
  aspectRatio?: string
  additionalPrompt?: string
  images: Record<string, string> | string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('image_history').insert({
    user_id: data.userId,
    generation_type: data.generationType,
    prompt: data.prompt,
    aspect_ratio: data.aspectRatio,
    additional_prompt: data.additionalPrompt,
    images: data.images,
  })

  if (error) {
    console.error('Failed to save image history:', error)
    throw new Error(`Failed to save image history: ${error.message}`)
  }
}

/**
 * ユーザーの画像履歴を取得
 */
export async function getImageHistory(userId: string, limit = 20, offset = 0) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('image_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Failed to fetch image history:', error)
    throw new Error(`Failed to fetch image history: ${error.message}`)
  }

  return data
}

/**
 * 画像履歴を削除
 */
export async function deleteImageHistory(historyId: string, userId: string) {
  const supabase = await createClient()

  // 履歴のデータを取得
  const { data: history, error: fetchError } = await supabase
    .from('image_history')
    .select('images')
    .eq('id', historyId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !history) {
    throw new Error('Image history not found')
  }

  // Storageから画像を削除
  const images = history.images as Record<string, string> | string
  const imageUrls = typeof images === 'string' ? [images] : Object.values(images)

  for (const url of imageUrls) {
    // URLからファイルパスを抽出
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/generated-images/')
    if (pathParts.length > 1) {
      const filePath = pathParts[1]
      await supabase.storage.from('generated-images').remove([filePath])
    }
  }

  // データベースから履歴を削除
  const { error: deleteError } = await supabase
    .from('image_history')
    .delete()
    .eq('id', historyId)
    .eq('user_id', userId)

  if (deleteError) {
    throw new Error(`Failed to delete image history: ${deleteError.message}`)
  }
}
